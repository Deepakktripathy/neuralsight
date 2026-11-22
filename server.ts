import 'dotenv/config';
import { createHash } from 'node:crypto';
import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { GoogleGenAI, ThinkingLevel, type Content } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PROMPT_VERSION = 'v2-2026-11-21';

export type InferredIntent = 'tutor' | 'debugger' | 'math' | 'quick';
export type ComplexityTier = 'fast' | 'balanced' | 'analytical' | 'deep';
export type AllowedModel = 'gemini-3.1-flash-lite' | 'gemini-4-hydrogen';

export interface ChatHistoryTurn {
  role: 'user' | 'model';
  text: string;
}

export interface SimulationContextSnapshot {
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

export interface ModelCandidate {
  model: AllowedModel;
  thinkingLevel: ThinkingLevel;
}

export interface RoutingDecision {
  intent: InferredIntent;
  complexity: ComplexityTier;
  primary: ModelCandidate;
  candidates: ModelCandidate[];
  refersToLiveRun: boolean;
}

interface CachedChatEntry {
  text: string;
  model: AllowedModel;
  thinkingLevel: ThinkingLevel;
  intent: InferredIntent;
  complexity: ComplexityTier;
  createdAt: number;
}

const RESPONSE_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESPONSE_CACHE_MAX_ENTRIES = 200;
const MODEL_COOLDOWN_MS = 45 * 1000; // 45s cooldown after 429/503 overload

const cacheStats = { hits: 0, misses: 0, bypassed: 0 };

const responseCache = new Map<string, CachedChatEntry>();
const modelCooldowns = new Map<AllowedModel, { until: number; reason: string }>();

function getCachedResponse(key: string): CachedChatEntry | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > RESPONSE_CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  // Touch for LRU ordering
  responseCache.delete(key);
  responseCache.set(key, entry);
  return entry;
}

function setCachedResponse(key: string, entry: CachedChatEntry): void {
  if (responseCache.has(key)) {
    responseCache.delete(key);
  }
  responseCache.set(key, entry);
  if (responseCache.size > RESPONSE_CACHE_MAX_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
}

function markModelCooldown(model: AllowedModel, reason: string): void {
  modelCooldowns.set(model, {
    until: Date.now() + MODEL_COOLDOWN_MS,
    reason,
  });
}

function isModelInCooldown(model: AllowedModel): boolean {
  const record = modelCooldowns.get(model);
  if (!record) return false;
  if (Date.now() >= record.until) {
    modelCooldowns.delete(model);
    return false;
  }
  return true;
}

function orderCandidatesByHealth(candidates: ModelCandidate[]): ModelCandidate[] {
  const healthy = candidates.filter((c) => !isModelInCooldown(c.model));
  if (healthy.length === 0) {
    // All candidates in cooldown: try full list in priority order anyway
    return candidates;
  }
  const cooled = candidates.filter((c) => isModelInCooldown(c.model));
  return [...healthy, ...cooled];
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

function isShortFollowUp(lower: string, wordCount: number): boolean {
  if (wordCount > 14) return false;
  return (
    /^(why|how|and|what about|can you|could you|show|elaborate|explain|wait|so|then|does that|is that|fix)\b/.test(
      lower
    ) || /\b(that|this|above|previous|step \d+|more detail|example)\b/.test(lower)
  );
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function analyzeQueryAndContext(
  message: string,
  history: ChatHistoryTurn[],
  context: SimulationContextSnapshot
): RoutingDecision {
  const lower = message.toLowerCase().trim();
  const wordCount = lower.split(/\s+/).filter(Boolean).length;
  const questionMarks = (lower.match(/\?/g) || []).length;

  const failureMode = String(context.hyperparams?.failureMode ?? 'None');
  const hasActiveFailure = failureMode !== 'None' && failureMode !== '';

  const lossFn = String(context.hyperparams?.lossFunction ?? 'Cross-Entropy');
  const latestLoss = context.latestMetrics?.loss;
  const latestValLoss = context.latestMetrics?.valLoss;
  const isNonFiniteLoss =
    latestLoss !== null && latestLoss !== undefined && !Number.isFinite(latestLoss);
  const isExplodingCeLoss =
    lossFn !== 'MSE' &&
    lossFn !== 'Huber' &&
    latestLoss !== null &&
    latestLoss !== undefined &&
    latestLoss > 5;
  const isExplodingRegressionLoss =
    (lossFn === 'MSE' || lossFn === 'Huber') &&
    latestLoss !== null &&
    latestLoss !== undefined &&
    latestLoss > 1e4;
  const isDivergingValLoss =
    latestLoss !== null &&
    latestLoss !== undefined &&
    latestValLoss !== null &&
    latestValLoss !== undefined &&
    Number.isFinite(latestLoss) &&
    Number.isFinite(latestValLoss) &&
    latestValLoss - latestLoss > Math.max(0.45, Math.abs(latestLoss) * 0.5);
  const hasNumericInstability =
    isNonFiniteLoss || isExplodingCeLoss || isExplodingRegressionLoss || isDivergingValLoss;

  const archName = context.architecture ? String(context.architecture).trim() : '';
  const mentionsActiveArch =
    Boolean(archName) &&
    new RegExp(`\\b${escapeRegex(archName)}\\b`, 'i').test(lower);

  const hasExplicitLiveDeixis =
    /\b(this|my|current|currently|active|live|canvas|simulation|sandbox|sidebar|in the studio|right now|on screen|injected|here)\b/.test(
      lower
    ) ||
    /\b(at|on)\s+step\s+\d+\b/.test(lower) ||
    /\bLR\s*=/.test(message) ||
    /\b(my|this|current|active|our)\s+(model|network|loss|accuracy|val\s*loss|val\s*accuracy|curve|gradient|metrics?|run|epoch|step|generator|discriminator|agent)\b/.test(
      lower
    ) ||
    /\bwhy\s+(is|are|did|does)\s+(it|the\s+(loss|val\s*loss|accuracy|training|generator|discriminator|agent|gradients?)|loss|val\s*loss)\b/.test(
      lower
    );

  const refersToLiveRun =
    hasExplicitLiveDeixis ||
    (mentionsActiveArch && (hasActiveFailure || /\b(run|curve|metric|hyperparam)\b/.test(lower)));

  const isDebugSignal =
    /\b(nan|explod\w*|vanish\w*|overfit\w*|collapse\w*|diverging|diverge[sd]?|oscillat\w*|stuck|wrong|fix|debug\w*|fail\w*|broken|not learning|plateau\w*|diagnos\w*|troubleshoot\w*|instabil\w*|memori[zs]\w*|dead neurons?|crash\w*|starving)\b/.test(
      lower
    ) ||
    /\bwhy\s+(is|are|did|does)\s+(it|my|this|the\s+(loss|accuracy|model|network|training|generator|discriminator|agent)|loss|gradients?|val)\b/.test(
      lower
    ) ||
    ((hasActiveFailure || hasNumericInstability) && refersToLiveRun);

  const isExplicitMathOrCodeSignal =
    /\b(formula\w*|equation\w*|deriv\w*|jacobian\w*|hessian\w*|q-k-v|matmul|dimension\w*|tensor shape\w*|bellman|minimax|kl divergence|eigen\w*|theorem\w*|proof\w*|prove\b|chain rule|pytorch|keras|tensorflow|implement\w*|code|snippet|mathematic\w*|calculat\w*|reparameterization|update rule|bias-corrected|optimal discriminator)\b/.test(
      lower
    ) ||
    /\b(gradient of|with respect to|divide\s+qk|sqrt\(|softmax.*logits?|loss function.*written)\b/.test(
      lower
    );

  const isDeepSynthesisSignal =
    /\b(step[- ]by[- ]step|from scratch|prove|derive|compare|versus|vs\.?|trade-?off|when should|architecture|end[- ]to[- ]end|deep dive|thoroughly|rigorous|systematically|root cause)\b/.test(
      lower
    ) ||
    questionMarks >= 2 ||
    wordCount >= 38;

  const isQuickLookupSignal =
    !isDebugSignal &&
    !isExplicitMathOrCodeSignal &&
    !isDeepSynthesisSignal &&
    wordCount <= 14 &&
    (/^(what is|what does|what are|define|meaning of|tldr|short|explain briefly|in short|hi|hello|thanks)\b/.test(
      lower
    ) ||
      /\b(tldr|briefly|in one sentence|in 2 sentences|quick summary|stand for)\b/.test(lower)) &&
    !/\b(difference between|equations?|formula\w*|role of)\b/.test(lower);

  // Check recent conversation history for context continuity / escalation
  const recentWindow = history.slice(-4).map((t) => t.text.toLowerCase()).join(' ');
  const recentWasDeep =
    /\b(deriv\w*|jacobian|hessian|backprop|bellman|minimax|nash|proof|pytorch|keras|attention|gradient|collapse|overfit|cross-entropy|kl divergence)\b/.test(
      recentWindow
    );
  const followUp = history.length > 0 && isShortFollowUp(lower, wordCount);

  let intent: InferredIntent = 'tutor';
  if (isDebugSignal) {
    intent = 'debugger';
  } else if (isExplicitMathOrCodeSignal) {
    intent = 'math';
  } else if (isQuickLookupSignal && !followUp) {
    intent = 'quick';
  }

  // Score complexity (0..10) to pick fast / balanced / analytical / deep
  let score = intent === 'quick' ? 1 : 2;
  if (wordCount >= 18) score += 1;
  if (wordCount >= 35) score += 2;
  if (questionMarks >= 2) score += 1;
  if (intent === 'debugger') score += 2;
  if (intent === 'math') score += 2;
  if (isDeepSynthesisSignal) score += 2;
  if (refersToLiveRun && (hasActiveFailure || hasNumericInstability)) score += 1;
  if (followUp && recentWasDeep) score += 2;
  if (history.length >= 6) score += 1;
  if (intent === 'quick') score = 1;

  let complexity: ComplexityTier;
  if (score <= 1) {
    complexity = 'fast';
  } else if (score <= 3) {
    complexity = 'balanced';
  } else if (score <= 5) {
    complexity = 'analytical';
  } else {
    complexity = 'deep';
  }

  let rawCandidates: ModelCandidate[];
  if (complexity === 'fast') {
    rawCandidates = [
      { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
      // MINIMAL is unsupported on gemini-4-hydrogen, so fallback uses LOW
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW },
    ];
  } else if (complexity === 'balanced') {
    rawCandidates = [
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW },
      { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.LOW },
    ];
  } else if (complexity === 'analytical') {
    rawCandidates = [
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.MEDIUM },
      { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MEDIUM },
    ];
  } else {
    rawCandidates = [
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.HIGH },
      { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.HIGH },
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.MEDIUM },
    ];
  }

  const ordered = orderCandidatesByHealth(rawCandidates);
  return {
    intent,
    complexity,
    primary: ordered[0],
    candidates: ordered,
    refersToLiveRun,
  };
}

// Stable static prefix placed first so implicit prefix caching hits across turns and steps.
const STATIC_SYSTEM_PREFIX = [
  'You are the NeuralSight AI Tutor—an expert Machine Learning, Deep Learning, and AI educator embedded inside an interactive neural network playground.',
  '',
  'Core Capabilities & Grounding Rules:',
  '- General ML/DL/AI Knowledge: Answer any machine learning, deep learning, Transformer, LLM, RL, optimization, or mathematics question thoroughly—even topics outside the currently selected NeuralSight model.',
  '- Live Playground Grounding: When the user asks about "this model", "my loss", "why is it failing", or current simulation behavior, ground your answer strictly in the Live Sandbox Context provided below without inventing metrics or UI controls.',
  '- Formatting: Keep responses crisp and readable inside a side drawer (concise paragraphs, tight bullet points, code blocks when helpful, and KaTeX math using $...$ inline and $$...$$ display).',
].join('\n');

export function buildSystemInstruction(
  intent: InferredIntent,
  complexity: ComplexityTier,
  context: SimulationContextSnapshot,
  options?: { stateless?: boolean }
): string {
  const intentGuidance: Record<InferredIntent, string> = {
    tutor:
      'Focus on clear, intuitive conceptual explanations. Connect ideas to the NeuralSight canvas and sidebar controls when relevant.',
    debugger:
      'Adopt a diagnostic troubleshooting approach: pinpoint root causes of training pathologies (exploding/vanishing gradients, overfitting, attention collapse, mode collapse, discriminator overpowering, poor exploration) using deep learning theory plus the live hyperparameters, active failure mode, and metrics trend, then give concrete fixes.',
    math:
      'Adopt a rigorous math & tensor-shape coaching style: show exact equations, forward/backprop steps, gradients, and tensor dimensions using KaTeX ($...$ inline and $$...$$ display).',
    quick:
      'Keep your answer crisp and direct—2 to 4 clear sentences or tight bullet points without unnecessary boilerplate.',
  };

  if (options?.stateless) {
    return [
      STATIC_SYSTEM_PREFIX,
      '',
      `Turn Directive (${intent}/${complexity}): ${intentGuidance[intent]}`,
    ].join('\n');
  }

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
    STATIC_SYSTEM_PREFIX,
    '',
    `Turn Directive (${intent}/${complexity}): ${intentGuidance[intent]}`,
    '',
    'Live NeuralSight Sandbox Context:',
    `- Architecture: ${context.architecture ?? 'Unknown'}`,
    `- Mode: ${context.mode ?? 'Train'}`,
    `- Task Objective: ${context.useCase ?? 'Unknown'}`,
    `- Dataset / Environment: ${context.dataSource ?? 'Unknown'}`,
    `- Current Step: ${context.step ?? 0}`,
    `- Hyperparameters: ${hpSummary || 'default'}`,
    `- ${metricsLine}`,
    context.recentTrend ? `- Recent Trajectory: ${context.recentTrend}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function prepareConversationHistory(history: ChatHistoryTurn[]): Content[] {
  const MAX_VERBATIM_TURNS = 10;
  const MAX_TOTAL_CHARS = 10000;

  const totalChars = history.reduce((sum, t) => sum + t.text.length, 0);
  if (history.length <= MAX_VERBATIM_TURNS && totalChars <= MAX_TOTAL_CHARS) {
    return history.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    }));
  }

  // Compact older turns into a concise digest while keeping the recent window verbatim
  const splitIndex = Math.max(0, history.length - MAX_VERBATIM_TURNS);
  const olderTurns = history.slice(0, splitIndex);
  const recentTurns = history.slice(splitIndex);

  const digestLines = olderTurns.map((t, idx) => {
    const clean = t.text.replace(/\s+/g, ' ').trim();
    const snippet = clean.length > 160 ? `${clean.slice(0, 157)}...` : clean;
    return `${idx + 1}. ${t.role === 'user' ? 'User' : 'Tutor'}: ${snippet}`;
  });

  const compactedPrefix: Content[] = [
    {
      role: 'user',
      parts: [
        {
          text: `[Earlier Conversation Digest (${olderTurns.length} turns)]\n${digestLines.join('\n')}`,
        },
      ],
    },
    {
      role: 'model',
      parts: [
        {
          text: 'Understood—I have the context from our earlier discussion and will continue seamlessly.',
        },
      ],
    },
  ];

  return [
    ...compactedPrefix,
    ...recentTurns.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    })),
  ];
}

export function buildStatelessCacheKey(
  model: AllowedModel,
  thinkingLevel: ThinkingLevel,
  systemInstruction: string,
  message: string
): string {
  const normalizedMessage = message.toLowerCase().replace(/\s+/g, ' ').trim();
  return createHash('sha256')
    .update(`${PROMPT_VERSION}|${model}|${thinkingLevel}|${systemInstruction}|${normalizedMessage}`)
    .digest('hex');
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

function classifyFailure(err: unknown): {
  retrySameModel: boolean;
  shouldFallback: boolean;
  shouldCooldown: boolean;
  reason: string;
} {
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

  if (isRateLimit) {
    return {
      retrySameModel: false,
      shouldFallback: true,
      shouldCooldown: true,
      reason: 'rate_limit',
    };
  }
  if (isOverloaded) {
    return {
      retrySameModel: false,
      shouldFallback: true,
      shouldCooldown: true,
      reason: 'high_demand',
    };
  }
  if (isTransient) {
    return {
      retrySameModel: true,
      shouldFallback: true,
      shouldCooldown: false,
      reason: 'transient',
    };
  }
  return {
    retrySameModel: false,
    shouldFallback: false,
    shouldCooldown: false,
    reason: 'hard_error',
  };
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

  app.post('/api/chat/cache/purge', (_req: Request, res: Response) => {
    const purgedEntries = responseCache.size;
    responseCache.clear();
    console.info(
      `[NeuralSight AI] Cache purged (${purgedEntries} entries). Lifetime stats: hits=${cacheStats.hits}, misses=${cacheStats.misses}, bypassed=${cacheStats.bypassed}`
    );
    res.json({
      ok: true,
      purgedEntries,
      cacheStats: { ...cacheStats },
    });
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
      .slice(-40);

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
      const routing = analyzeQueryAndContext(message, sanitizedHistory, context);
      const stateless = sanitizedHistory.length === 0 && !routing.refersToLiveRun;
      const systemInstruction = buildSystemInstruction(
        routing.intent,
        routing.complexity,
        context,
        { stateless }
      );

      if (stateless) {
        const primaryCacheKey = buildStatelessCacheKey(
          routing.primary.model,
          routing.primary.thinkingLevel,
          systemInstruction,
          message
        );
        const cached = getCachedResponse(primaryCacheKey);

        if (cached) {
          cacheStats.hits += 1;
          console.info(
            `[NeuralSight AI] cache=hit intent=${routing.intent} complexity=${routing.complexity} model=${cached.model} (hits=${cacheStats.hits}, misses=${cacheStats.misses}, bypassed=${cacheStats.bypassed})`
          );
          writeEvent('meta', {
            model: cached.model,
            thinkingLevel: cached.thinkingLevel,
            intent: cached.intent,
            complexity: cached.complexity,
            cached: true,
          });
          writeEvent('delta', { text: cached.text });
          writeEvent('done', {});
          if (!res.writableEnded) res.end();
          return;
        }
        cacheStats.misses += 1;
      } else {
        cacheStats.bypassed += 1;
      }

      const historyContents = prepareConversationHistory(sanitizedHistory);

      let streamStarted = false;
      let lastError: unknown = null;
      let activeCandidate: ModelCandidate | null = null;
      let accumulatedText = '';

      for (let cIdx = 0; cIdx < routing.candidates.length && !clientClosed && !streamStarted; cIdx++) {
        const candidate = routing.candidates[cIdx];
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
                  activeCandidate = candidate;
                  writeEvent('meta', {
                    model: candidate.model,
                    thinkingLevel: candidate.thinkingLevel,
                    intent: routing.intent,
                    complexity: routing.complexity,
                    cached: false,
                    ...(isFallback ? { fallbackFrom: routing.primary.model } : {}),
                  });
                }
                accumulatedText += text;
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

            const { retrySameModel, shouldFallback, shouldCooldown, reason } = classifyFailure(err);

            if (shouldCooldown) {
              markModelCooldown(candidate.model, reason);
            }

            if (retrySameModel && attempt < maxAttemptsForCandidate) {
              await sleep(400);
              continue;
            }

            if (shouldFallback && cIdx < routing.candidates.length - 1) {
              console.warn(
                `[NeuralSight AI] ${candidate.model} (${reason}); routing to ${routing.candidates[cIdx + 1].model}.`
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
        if (stateless && activeCandidate && accumulatedText.trim()) {
          const storeKey = buildStatelessCacheKey(
            activeCandidate.model,
            activeCandidate.thinkingLevel,
            systemInstruction,
            message
          );
          setCachedResponse(storeKey, {
            text: accumulatedText,
            model: activeCandidate.model,
            thinkingLevel: activeCandidate.thinkingLevel,
            intent: routing.intent,
            complexity: routing.complexity,
            createdAt: Date.now(),
          });
        }
        console.info(
          `[NeuralSight AI] cache=${stateless ? 'miss' : 'bypass'} intent=${routing.intent} complexity=${routing.complexity} model=${activeCandidate?.model ?? 'unknown'} (hits=${cacheStats.hits}, misses=${cacheStats.misses}, bypassed=${cacheStats.bypassed})`
        );
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

const isMainModule =
  Boolean(process.argv[1]) &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMainModule) {
  startServer().catch((err) => {
    console.error('Failed to start NeuralSight server:', err);
    process.exit(1);
  });
}
