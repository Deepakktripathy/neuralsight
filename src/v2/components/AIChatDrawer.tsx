import React, { useState, useRef, useEffect, useMemo } from 'react';
import katex from 'katex';
import {
  X,
  Send,
  Square,
  RotateCcw,
  Trash2,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { Architecture, Hyperparameters, Mode, UseCase, DataSource } from '../types';
import { ARCHITECTURE_METADATA } from '../lib/architectureConfig';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
  complexityTier?: 'fast' | 'balanced' | 'analytical' | 'deep';
  error?: string;
  failedPrompt?: string;
}

export interface SimulationContextSnapshot {
  architecture: Architecture;
  mode: Mode;
  useCase: UseCase;
  dataSource: DataSource;
  step: number;
  hyperparams: Hyperparameters;
  latestMetrics?: {
    step: number;
    loss: number;
    accuracy: number;
    valLoss?: number;
    valAccuracy?: number;
  } | null;
  recentTrend?: string;
}

interface AIChatDrawerProps {
  onClose: () => void;
  simulationContext: SimulationContextSnapshot;
  messages: ChatMessage[];
  onMessagesChange: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

function buildStarterPrompts(ctx: SimulationContextSnapshot): { label: string; prompt: string }[] {
  const failure = ctx.hyperparams.failureMode;
  const hasFailure = failure && failure !== 'None';
  const arch = ctx.architecture;

  const starters: { label: string; prompt: string }[] = [];

  if (hasFailure) {
    starters.push({
      label: `Diagnose ${failure}`,
      prompt: `I injected "${failure}" on ${arch} with LR=${ctx.hyperparams.learningRate} and ${ctx.hyperparams.optimizer}. Why is the loss behaving like this and how do I fix it?`,
    });
  } else {
    starters.push({
      label: `Explain ${arch} on ${ctx.dataSource.split(' ')[0]}`,
      prompt: `How is ${arch} currently processing "${ctx.dataSource}" for ${ctx.useCase} with my current hyperparameters?`,
    });
  }

  if (arch === 'Transformer') {
    starters.push({
      label: 'Break down Q-K-V attention math',
      prompt: `Walk me through the scaled dot-product attention math and tensor shapes for ${ctx.hyperparams.attentionHeads ?? 2} heads.`,
    });
  } else if (arch === 'CNN') {
    starters.push({
      label: 'How do conv stride & pooling affect shapes?',
      prompt: `Explain how ${ctx.hyperparams.convLayers ?? 2} conv layers, stride ${ctx.hyperparams.stride ?? 1}, and ${ctx.hyperparams.poolingType ?? 'Max'} pooling transform the input tensor.`,
    });
  } else if (arch === 'GAN') {
    starters.push({
      label: 'Explain Generator vs Discriminator equilibrium',
      prompt: 'How do L_G and L_D balance at Nash equilibrium, and how do I spot mode collapse early?',
    });
  } else if (arch === 'RNN') {
    starters.push({
      label: `Compare ${ctx.hyperparams.rnnCellType ?? 'LSTM'} gates & BPTT`,
      prompt: `How does ${ctx.hyperparams.rnnCellType ?? 'LSTM'} across ${ctx.hyperparams.rnnUnrollSteps ?? 5} unrolled steps mitigate vanishing gradients?`,
    });
  } else if (arch === 'DQN') {
    starters.push({
      label: 'Explain Bellman target & discount factor',
      prompt: `How does discount factor γ=${ctx.hyperparams.dqnDiscountFactor ?? 0.9} shape Q-value updates under ${ctx.hyperparams.dqnExplorationSchedule ?? 'Standard'} exploration?`,
    });
  } else {
    starters.push({
      label: 'Show forward & backprop equations',
      prompt: `Show the forward and backpropagation matrix equations for a ${ctx.hyperparams.layers}-layer network with ${ctx.hyperparams.lossFunction} loss.`,
    });
  }

  starters.push({
    label: 'What should I tweak next?',
    prompt: `Give me a quick experiment to try right now in the sidebar for ${arch} and tell me what to watch on the canvas.`,
  });

  return starters;
}

function renderInlineSegments(text: string, keyPrefix: string): React.ReactNode[] {
  // Split on inline math ($...$) or inline code (`...`) or bold (**...**)
  const tokenRegex = /(\$[^$\n]+?\$|`[^`\n]+?`|\*\*[^*\n]+?\*\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    const key = `${keyPrefix}-${idx}`;
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const expr = part.slice(1, -1);
      try {
        const html = katex.renderToString(expr, {
          throwOnError: false,
          displayMode: false,
        });
        return (
          <span
            key={key}
            className="inline-block align-middle text-indigo-200 px-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return (
          <code key={key} className="font-mono text-[11px] bg-slate-900 px-1 py-0.5 rounded text-indigo-300">
            {expr}
          </code>
        );
      }
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={key}
          className="font-mono text-[11px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-indigo-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={key} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

const FormattedMessageBody: React.FC<{ text: string }> = ({ text }) => {
  // Split fenced code blocks and display math blocks ($$...$$) first
  const blockRegex = /(```[\s\S]*?```|\$\$[\s\S]*?\$\$)/g;
  const blocks = text.split(blockRegex);

  return (
    <div className="space-y-2 text-xs text-slate-200 leading-relaxed break-words">
      {blocks.map((block, bIdx) => {
        if (!block) return null;

        if (block.startsWith('```') && block.endsWith('```')) {
          const inner = block.slice(3, -3).replace(/^[a-zA-Z0-9_-]+\n/, '');
          return (
            <pre
              key={bIdx}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto leading-relaxed"
            >
              <code>{inner.trim()}</code>
            </pre>
          );
        }

        if (block.startsWith('$$') && block.endsWith('$$')) {
          const expr = block.slice(2, -2).trim();
          try {
            const html = katex.renderToString(expr, {
              throwOnError: false,
              displayMode: true,
            });
            return (
              <div
                key={bIdx}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-indigo-200 text-center overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <pre
                key={bIdx}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto"
              >
                {expr}
              </pre>
            );
          }
        }

        // Plain prose / lists / headings
        const lines = block.split('\n');
        return (
          <div key={bIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
                const heading = trimmed.replace(/^#{2,3}\s+/, '');
                return (
                  <h4 key={lIdx} className="text-xs font-bold text-white pt-1">
                    {renderInlineSegments(heading, `${bIdx}-${lIdx}`)}
                  </h4>
                );
              }

              if (/^[-*]\s+/.test(trimmed)) {
                const itemText = trimmed.replace(/^[-*]\s+/, '');
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-0.5">
                    <span className="text-indigo-400 shrink-0 mt-0.5">›</span>
                    <span>{renderInlineSegments(itemText, `${bIdx}-${lIdx}`)}</span>
                  </div>
                );
              }

              const numMatch = trimmed.match(/^(\d+\.)\s+(.*)$/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-0.5">
                    <span className="font-mono text-[11px] text-indigo-400 shrink-0 mt-0.5">
                      {numMatch[1]}
                    </span>
                    <span>{renderInlineSegments(numMatch[2], `${bIdx}-${lIdx}`)}</span>
                  </div>
                );
              }

              return <p key={lIdx}>{renderInlineSegments(trimmed, `${bIdx}-${lIdx}`)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  onClose,
  simulationContext,
  messages,
  onMessagesChange,
}) => {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const meta = ARCHITECTURE_METADATA[simulationContext.architecture];
  const starters = useMemo(() => buildStarterPrompts(simulationContext), [simulationContext]);

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el && shouldAutoScrollRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 48;
  };

  const sendMessage = async (rawPrompt: string) => {
    const trimmed = rawPrompt.trim();
    if (!trimmed || isStreaming) return;

    const userMsgId = `u-${Date.now()}`;
    const assistantMsgId = `m-${Date.now() + 1}`;

    const historySnapshot = messages
      .filter((m) => !m.error && m.text.trim().length > 0)
      .map((m) => ({ role: m.role, text: m.text }));

    shouldAutoScrollRef.current = true;
    setInput('');
    setIsStreaming(true);

    onMessagesChange((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', text: trimmed },
      { id: assistantMsgId, role: 'model', text: '' },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: trimmed,
          history: historySnapshot,
          context: simulationContext,
        }),
      });

      if (!response.ok || !response.body) {
        let errorText = `Request failed (${response.status})`;
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload?.error) errorText = payload.error;
        } catch {
          // ignore non-JSON body
        }
        throw new Error(errorText);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = 'message';
      let receivedText = false;

      const processLine = (line: string) => {
        if (!line) {
          currentEvent = 'message';
          return;
        }
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          const rawData = line.slice(5).trim();
          if (!rawData) return;
          try {
            const parsed = JSON.parse(rawData) as {
              text?: string;
              model?: string;
              complexity?: 'fast' | 'balanced' | 'analytical' | 'deep';
              message?: string;
            };
            if (currentEvent === 'meta' && parsed.model) {
              onMessagesChange((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, modelUsed: parsed.model, complexityTier: parsed.complexity }
                    : m
                )
              );
            } else if (currentEvent === 'delta' && parsed.text) {
              receivedText = true;
              onMessagesChange((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, text: m.text + parsed.text } : m
                )
              );
            } else if (currentEvent === 'error') {
              throw new Error(parsed.message || 'Gemini failed to respond.');
            }
          } catch (innerErr) {
            if (currentEvent === 'error') {
              throw innerErr;
            }
          }
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          processLine(line.trimEnd());
        }
      }

      if (buffer.trim()) {
        processLine(buffer.trimEnd());
      }

      if (!receivedText) {
        throw new Error('No response received from Gemini. Please try again.');
      }
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') {
        onMessagesChange((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId && !m.text
              ? { ...m, text: '_Generation stopped._' }
              : m
          )
        );
      } else {
        const errMessage =
          err instanceof Error ? err.message : 'Unable to reach Gemini right now.';
        onMessagesChange((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, error: errMessage, failedPrompt: trimmed }
              : m
          )
        );
      }
    } finally {
      abortRef.current = null;
      setIsStreaming(false);
    }
  };

  const handleRetry = (failedMsg: ChatMessage) => {
    if (!failedMsg.failedPrompt || isStreaming) return;
    const promptToRetry = failedMsg.failedPrompt;
    onMessagesChange((prev) => {
      const idx = prev.findIndex((m) => m.id === failedMsg.id);
      if (idx === -1) return prev;
      // Remove the failed placeholder and the paired preceding user message before resending
      const prevUserIdx = idx > 0 && prev[idx - 1].role === 'user' ? idx - 1 : idx;
      return prev.filter((_, i) => i < prevUserIdx || i > idx);
    });
    void sendMessage(promptToRetry);
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleClear = () => {
    if (isStreaming) {
      abortRef.current?.abort();
    }
    onMessagesChange([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className="w-full sm:w-[460px] lg:w-[500px] max-w-full bg-slate-900 border-l border-slate-800 text-slate-100 select-text"
        aria-label="NeuralSight AI Tutor"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-sm font-bold text-white truncate">
                  NeuralSight AI Tutor
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-400 leading-snug">
                  ML, DL, math &amp; live simulation
                </SheetDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Clear conversation"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close AI Tutor"
                title="Close AI Tutor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0"
        >
          {messages.length === 0 ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1.5">
                <p className="text-xs font-semibold text-white">
                  Ask anything about ML, deep learning, or this simulation
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatically adapts to explain concepts, derive equations, or debug your live{' '}
                  <span className="text-slate-300 font-medium">{simulationContext.architecture}</span>{' '}
                  metrics and failure modes.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  Suggested Prompts
                </span>
                {starters.map((starter) => (
                  <button
                    key={starter.label}
                    onClick={() => void sendMessage(starter.prompt)}
                    className="w-full text-left p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer space-y-1"
                  >
                    <span className="text-xs font-semibold text-slate-100 block">
                      {starter.label}
                    </span>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {starter.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-indigo-600/20 border border-indigo-500/30 px-3.5 py-2.5 text-xs text-slate-100 leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex flex-col items-start gap-1.5">
                  <div className="w-full rounded-2xl rounded-tl-sm bg-slate-950/70 border border-slate-800 px-3.5 py-3">
                    {msg.error ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-xs text-rose-300">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{msg.error}</span>
                        </div>
                        {msg.failedPrompt && (
                          <button
                            onClick={() => handleRetry(msg)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}
                      </div>
                    ) : msg.text ? (
                      <FormattedMessageBody text={msg.text} />
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">
                        Thinking...
                      </span>
                    )}
                  </div>

                  {!msg.error && (msg.modelUsed || (isStreaming && isLast)) && (
                    <div className="flex items-center gap-2 px-1 text-[11px] font-mono text-slate-500">
                      {msg.modelUsed && (
                        <span>
                          {msg.modelUsed}
                          {msg.complexityTier
                            ? ` · ${msg.complexityTier.charAt(0).toUpperCase()}${msg.complexityTier.slice(1)}`
                            : ''}
                        </span>
                      )}
                      {msg.modelUsed && isStreaming && isLast && <span aria-hidden="true">·</span>}
                      {isStreaming && isLast && <span className="text-indigo-400">Streaming</span>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Composer Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-end gap-2 bg-slate-950 border border-slate-800 focus-within:border-indigo-500/60 rounded-xl p-2 transition-colors">
            <textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${meta?.title || simulationContext.architecture}, ML/DL theory, or math...`}
              aria-label="Ask NeuralSight AI Tutor"
              className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 resize-none focus:outline-none px-1.5 py-1 max-h-28 leading-relaxed"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="p-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 transition-colors cursor-pointer shrink-0"
                aria-label="Stop generating"
                title="Stop generating"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void sendMessage(input)}
                disabled={!input.trim()}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
                aria-label="Send message"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 px-0.5">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
