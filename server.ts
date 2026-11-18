import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, type Content } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type InferredIntent = 'tutor' | 'debugger' | 'math' | 'quick';
type AllowedModel = 'gemini-3.1-flash-lite' | 'gemini-4-hydrogen';

interface ChatHistoryTurn {
  role: 'user' | 'model';
  text: string;
}

interface SimulationContextSnapshot {
  architecture?: string;
  mode?: string;
  useCase?: string;
  dataSource?: string;
  step?: number;
  hyperparams?: Record<string, unknown>;
  latestMetrics?: {
    step: number;
    loss: number | null;
    accuracy: number | null;
    valLoss?: number | null;
    valAccuracy?: number | null;
  } | null;
  recentTrend?: string;
}

interface ChatRequestBody {
  message?: unknown;
  history?: unknown;
  context?: unknown;
}

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw Object.assign(
      new Error('GEMINI_API_KEY is not configured. Please check your API key in Settings > Secrets.'),
      { status: 400 }
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ModelCandidate {
  model: AllowedModel;
  thinkingLevel: ThinkingLevel;
}

function inferIntentAndRouting(
  message: string,
  context: SimulationContextSnapshot
): { intent: InferredIntent; primary: ModelCandidate; candidates: ModelCandidate[] } {
  const lower = message.toLowerCase().trim();
  const wordCount = lower.split(/\s+/).filter(Boolean).length;

  const failureMode = String(context.hyperparams?.failureMode ?? 'None');
  const hasActiveFailure = failureMode !== 'None' && failureMode !== '';
  const refersToLiveRun =
    /\b(this|my|current|active|canvas|simulation|sandbox|run|curve|metric|sidebar|tweak|step|next)\b/.test(
      lower
    );

  const isDebugIntent =
    /\b(nan|explod|vanish|overfit|collapse|diverg|oscillat|stuck|wrong|why is|fix|debug|fail|broken|not learning|plateau|diagnos|troubleshoot)\b/.test(
      lower
    ) || (hasActiveFailure && refersToLiveRun);

  const isMathOrDeepIntent =
    /\b(formula|equation|deriv|gradient|backprop|jacobian|hessian|softmax|q-k-v|attention|matmul|dimension|shape|tensor|loss function|bellman|minimax|nash|kl divergence|eigen|code|pytorch|keras|math)\b/.test(
      lower
    );

  const isQuickLookup =
    !isDebugIntent &&
    !isMathOrDeepIntent &&
    wordCount <= 14 &&
    (/^(what is|what does|define|meaning of|tldr|short|explain briefly|in short)\b/.test(lower) ||
      /\b(tldr|briefly|in one sentence|in 2 sentences|quick summary)\b/.test(lower));

  if (isQuickLookup) {
    const primary: ModelCandidate = {
      model: 'gemini-3.1-flash-lite',
      thinkingLevel: ThinkingLevel.MINIMAL,
    };
    return {
      intent: 'quick',
      primary,
      candidates: [
        primary,
        // MINIMAL is unsupported on gemini-4-hydrogen, so fallback uses LOW
        { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW },
      ],
    };
  }

  if (isDebugIntent) {
    const primary: ModelCandidate = {
      model: 'gemini-4-hydrogen',
      thinkingLevel: ThinkingLevel.MEDIUM,
    };
    return {
      intent: 'debugger',
      primary,
      candidates: [
        primary,
        { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MEDIUM },
      ],
    };
  }

  if (isMathOrDeepIntent) {
    const primary: ModelCandidate = {
      model: 'gemini-4-hydrogen',
      thinkingLevel: ThinkingLevel.MEDIUM,
    };
    return {
      intent: 'math',
      primary,
      candidates: [
        primary,
        { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MEDIUM },
      ],
    };
  }

  const primary: ModelCandidate = {
    model: 'gemini-4-hydrogen',
    thinkingLevel: ThinkingLevel.LOW,
  };
  return {
    intent: 'tutor',
    primary,
    candidates: [
      primary,
      { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.LOW },
    ],
  };
}

function buildSystemInstruction(
  intent: InferredIntent,
  context: SimulationContextSnapshot
): string {
  const intentGuidance: Record<InferredIntent, string> = {
    tutor:
      'Focus on clear, intuitive conceptual explanations. Connect ideas to the NeuralSight canvas and sidebar controls when the user asks about their active simulation.',
    debugger:
      'Adopt a diagnostic troubleshooting approach: pinpoint root causes of training pathologies (exploding/vanishing gradients, overfitting, attention collapse, mode collapse, discriminator overpowering, poor exploration) using both deep learning theory and the user’s live hyperparameters, active failure mode, and loss/accuracy trend, then suggest concrete fixes.',
    math:
      'Adopt a rigorous math & tensor-shape coaching style: derive or show exact equations, forward/backprop steps, gradients, and tensor dimensions using KaTeX ($...$ inline and $$...$$ display).',
    quick:
      'Keep your answer crisp and direct—2 to 4 clear sentences or tight bullet points without unnecessary boilerplate.',
  };

  const hp = context.hyperparams ?? {};
  const hpSummary = Object.entries(hp)
    .map(([k, v]) => `${k}=${String(v)}`)
    .join(', ');

  const metricsLine = context.latestMetrics
    ? `Latest Metrics (step ${context.latestMetrics.step}): loss=${formatMetric(context.latestMetrics.loss)}, accuracy=${formatPercent(context.latestMetrics.accuracy)}${
        context.latestMetrics.valLoss !== undefined
          ? `, valLoss=${formatMetric(context.latestMetrics.valLoss)}`
          : ''
      }${
        context.latestMetrics.valAccuracy !== undefined
          ? `, valAccuracy=${formatPercent(context.latestMetrics.valAccuracy)}`
          : ''
      }`
    : 'Latest Metrics: simulation at initial state (step 0)';

  return [
    'You are the NeuralSight AI Tutor—an expert Machine Learning, Deep Learning, and AI educator embedded inside an interactive neural network playground.',
    `Response Style for This Turn: ${intentGuidance[intent]}`,
    '',
    'Live NeuralSight Sandbox Context (use when the question refers to the active simulation or training run):',
    `- Architecture: ${context.architecture ?? 'Unknown'}`,
    `- Mode: ${context.mode ?? 'Train'}`,
    `- Task Objective: ${context.useCase ?? 'Unknown'}`,
    `- Dataset / Environment: ${context.dataSource ?? 'Unknown'}`,
    `- Current Step: ${context.step ?? 0}`,
    `- Hyperparameters: ${hpSummary || 'default'}`,
    `- ${metricsLine}`,
    context.recentTrend ? `- Recent Trajectory: ${context.recentTrend}` : '',
    '',
    'Grounding & Response Guidelines:',
    '- General ML/DL/AI Knowledge: Answer any machine learning, deep learning, Transformer, LLM, RL, optimization, or mathematics question thoroughly—even topics outside the currently selected NeuralSight model.',
    '- Live Playground Grounding: When the user asks about "this model", "my loss", "why is it failing", or current behavior, ground your answer strictly in the live NeuralSight context above without inventing metrics or UI controls.',
    '- Formatting: Keep responses readable inside a narrow side drawer (concise paragraphs, short bullets, and KaTeX math using $...$ or $$...$$).',
  ]
    .filter(Boolean)
    .join('\n');
}

function formatMetric(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'NaN';
  if (!Number.isFinite(value)) return 'Infinity';
  return value.toFixed(3);
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'NaN';
  return `${(value * 100).toFixed(1)}%`;
}

function normalizeGeminiError(err: unknown): { status: number; message: string } {
  const anyErr = err as { status?: number; code?: number; message?: string };
  const rawMessage = anyErr?.message || 'An unexpected error occurred while contacting Gemini.';
  const status = Number(anyErr?.status || anyErr?.code || 500);

  if (status === 400 || /API_KEY_INVALID|API key not valid|not configured/i.test(rawMessage)) {
    return {
      status: 400,
      message: 'Invalid or missing Gemini API key. Please verify GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (status === 403 || /PERMISSION_DENIED/i.test(rawMessage)) {
    return {
      status: 403,
      message: 'Permission denied for this Gemini request. Please verify your API key in Settings > Secrets.',
    };
  }
  if (status === 429 || /RESOURCE_EXHAUSTED|quota|rate limit/i.test(rawMessage)) {
    return {
      status: 429,
      message: 'Rate limit or free-tier quota reached. Please wait a moment and try again.',
    };
  }
  if (status === 404 || /NOT_FOUND/i.test(rawMessage)) {
    return {
      status: 404,
      message: 'Requested Gemini model was not found. Please retry your question.',
    };
  }
  return {
    status: status >= 400 && status < 600 ? status : 500,
    message: rawMessage,
  };
}

function classifyFailure(err: unknown): { retrySameModel: boolean; shouldFallback: boolean } {
  const anyErr = err as { status?: number; code?: number; message?: string };
  const status = Number(anyErr?.status || anyErr?.code || 0);
  const rawMessage = anyErr?.message || '';

  const isRateLimit =
    status === 429 || /RESOURCE_EXHAUSTED|quota|rate limit/i.test(rawMessage);
  const isOverloaded =
    status === 503 || /UNAVAILABLE|overloaded|high demand|capacity/i.test(rawMessage);
  const isTransient =
    status === 500 ||
    status === 502 ||
    status === 504 ||
    /fetch failed|ECONNRESET|ETIMEDOUT|DEADLINE_EXCEEDED|empty response/i.test(rawMessage);

  if (isRateLimit || isOverloaded) {
    return { retrySameModel: false, shouldFallback: true };
  }
  if (isTransient) {
    return { retrySameModel: true, shouldFallback: true };
  }
  return { retrySameModel: false, shouldFallback: false };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as ChatRequestBody;
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!message) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }
    if (message.length > 4000) {
      res.status(400).json({ error: 'Message exceeds 4,000 character limit.' });
      return;
    }

    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const sanitizedHistory: ChatHistoryTurn[] = rawHistory
      .filter(
        (item): item is ChatHistoryTurn =>
          Boolean(item) &&
          typeof item === 'object' &&
          ((item as ChatHistoryTurn).role === 'user' || (item as ChatHistoryTurn).role === 'model') &&
          typeof (item as ChatHistoryTurn).text === 'string' &&
          (item as ChatHistoryTurn).text.trim().length > 0
      )
      .slice(-24);

    const context: SimulationContextSnapshot =
      body.context && typeof body.context === 'object'
        ? (body.context as SimulationContextSnapshot)
        : {};

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let clientClosed = false;
    res.on('close', () => {
      if (!res.writableEnded) {
        clientClosed = true;
      }
    });

    const writeEvent = (event: string, data: unknown) => {
      if (clientClosed || res.writableEnded) return;
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const ai = createGeminiClient();
      const { intent, primary, candidates } = inferIntentAndRouting(message, context);
      const systemInstruction = buildSystemInstruction(intent, context);

      const historyContents: Content[] = sanitizedHistory.map((turn) => ({
        role: turn.role,
        parts: [{ text: turn.text }],
      }));

      let streamStarted = false;
      let lastError: unknown = null;

      for (let cIdx = 0; cIdx < candidates.length && !clientClosed && !streamStarted; cIdx++) {
        const candidate = candidates[cIdx];
        const isFallback = cIdx > 0;
        const maxAttemptsForCandidate = 2;
        let attempt = 0;

        while (attempt < maxAttemptsForCandidate && !clientClosed) {
          try {
            const chat = ai.chats.create({
              model: candidate.model,
              history: historyContents,
              config: {
                systemInstruction,
                thinkingConfig: { thinkingLevel: candidate.thinkingLevel },
              },
            });

            const stream = await chat.sendMessageStream({ message });
            for await (const chunk of stream) {
              if (clientClosed) break;
              const text = chunk.text;
              if (text) {
                if (!streamStarted) {
                  streamStarted = true;
                  writeEvent('meta', {
                    model: candidate.model,
                    thinkingLevel: candidate.thinkingLevel,
                    intent,
                    ...(isFallback ? { fallbackFrom: primary.model } : {}),
                  });
                }
                writeEvent('delta', { text });
              }
            }

            if (!streamStarted && !clientClosed) {
              throw new Error('Gemini returned an empty response. Please try again.');
            }
            break;
          } catch (err) {
            lastError = err;
            attempt += 1;

            if (streamStarted || clientClosed) {
              throw err;
            }

            const { retrySameModel, shouldFallback } = classifyFailure(err);

            if (retrySameModel && attempt < maxAttemptsForCandidate) {
              await sleep(400);
              continue;
            }

            if (shouldFallback && cIdx < candidates.length - 1) {
              console.warn(
                `[NeuralSight AI] ${candidate.model} unavailable; falling back to ${candidates[cIdx + 1].model}.`
              );
              break;
            }

            throw err;
          }
        }
      }

      if (!clientClosed) {
        if (!streamStarted) {
          throw lastError ?? new Error('Gemini returned an empty response. Please try again.');
        }
        writeEvent('done', {});
        res.end();
      }
    } catch (err) {
      const normalized = normalizeGeminiError(err);
      writeEvent('error', {
        status: normalized.status,
        message: normalized.message,
      });
      if (!res.writableEnded) {
        res.end();
      }
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`NeuralSight server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start NeuralSight server:', err);
  process.exit(1);
});
