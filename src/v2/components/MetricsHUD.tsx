import React, { useState } from 'react';
import { Activity, Maximize2, Minimize2, BookOpen, AlertTriangle } from 'lucide-react';
import { MetricsChart } from './MetricsChart';
import { SandboxDiagnosticsPanel } from './SandboxDiagnosticsPanel';
import { Architecture, FailureMode, Mode } from '../types';

interface MetricsHUDProps {
  data: { step: number; loss: number; accuracy?: number; valLoss?: number; valAccuracy?: number }[];
  isOverfitting?: boolean;
  failureMode?: FailureMode;
  architecture: Architecture;
  step: number;
  mode?: Mode;
  epochs?: number;
  onOpenGlossary?: () => void;
}

export const MetricsHUD: React.FC<MetricsHUDProps> = ({
  data,
  isOverfitting,
  failureMode = 'None',
  architecture,
  step,
  mode = 'Train',
  epochs = 100,
  onOpenGlossary,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isGAN = architecture === 'GAN';

  const latest = data[data.length - 1] || {
    step: 0,
    loss: isGAN ? 2.8 : 2.5,
    accuracy: 0.1,
    valLoss: isGAN ? 0.4 : 2.5,
    valAccuracy: isGAN ? 0.95 : 0.1,
  };

  const hasActiveFault = failureMode !== 'None';

  // Derived step & status details
  const epochLabel =
    mode === 'Train'
      ? `EPOCH ${Math.min(Math.floor(step / 50) + 1, epochs)}/${epochs}`
      : `STEP ${step.toString().padStart(4, '0')}`;

  const phaseLabel = (() => {
    if (mode === 'Inference') return 'INFERENCE';
    if (isGAN) return step % 2 === 0 ? 'UPDATE D' : 'UPDATE G';
    return step % 10 < 5 ? 'FORWARD' : 'BACKPROP';
  })();

  const phaseColor = (() => {
    if (mode === 'Inference') return 'text-cyan-400';
    if (isGAN) return step % 2 === 0 ? 'text-emerald-400' : 'text-indigo-400';
    return step % 10 < 5 ? 'text-indigo-400' : 'text-rose-400';
  })();

  const statusDescription = (() => {
    if (step === 0) return `Ready for ${mode === 'Train' ? 'training' : 'inference'}.`;

    if (mode === 'Inference') {
      if (isGAN) return 'Sampling z ~ N(0, I) → G(z).';
      if (architecture === 'Transformer' || architecture === 'RNN') return 'Predicting next token...';
      if (architecture === 'CNN') return 'Scanning spatial kernels...';
      return 'Running forward pass.';
    }

    if (isGAN) {
      if (step % 4 === 0) return 'Generating fake sample G(z)...';
      if (step % 4 === 1) return 'Scoring fake sample D(G(z))...';
      if (step % 4 === 2) return 'Scoring real sample D(x)...';
      return 'Updating Generator weights...';
    }

    const isForwardPass = step % 10 < 5;
    if (isForwardPass) {
      if (architecture === 'CNN') return 'Extracting spatial features...';
      if (architecture === 'Transformer') return 'Computing multi-head attention...';
      if (architecture === 'RNN') return 'Updating recurrent hidden state...';
      return 'Computing layer activations...';
    } else {
      if (architecture === 'CNN') return 'Updating conv filter weights...';
      return 'Backpropagating error gradients...';
    }
  })();

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-30 font-mono select-none">
      {isExpanded ? (
        <div className="w-[92vw] sm:w-[520px] bg-slate-900/95 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl shadow-slate-950/70 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
          {/* Unified Dashboard Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/40 border-b border-slate-800/70">
            <div className="flex items-center gap-2 min-w-0">
              <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide truncate">
                {isGAN ? 'Adversarial Dashboard' : 'Execution & Telemetry Dashboard'}
              </span>
              {hasActiveFault && (
                <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 shrink-0 hidden sm:inline-flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                  {failureMode}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onOpenGlossary && (
                <button
                  onClick={onOpenGlossary}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800/70 transition-colors cursor-pointer"
                  title="Open Deep Learning Glossary"
                  aria-label="Open Deep Learning Glossary"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
                title="Minimize Dashboard"
                aria-label="Minimize Dashboard"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Unified Step-by-Step Status Bar Strip */}
          <div className="px-3.5 py-2 bg-slate-950/50 border-b border-slate-800/70 flex items-center justify-between gap-3 text-xs select-none">
            <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
              <span className="text-indigo-300 font-semibold">{epochLabel}</span>
              <span className="text-slate-600">·</span>
              <span className={`font-semibold ${phaseColor}`}>{phaseLabel}</span>
            </div>

            <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>

            <div className="flex-1 min-w-0 text-right sm:text-left">
              <span className="text-xs text-slate-300 font-medium truncate block">
                {statusDescription}
              </span>
            </div>
          </div>

          {/* Seamlessly Integrated Sandbox Diagnostics (when fault is active) */}
          {hasActiveFault && (
            <SandboxDiagnosticsPanel
              failureMode={failureMode}
              architecture={architecture}
              isEmbedded={true}
            />
          )}

          {/* Unified Metrics Chart Canvas */}
          <div className="p-3 h-[210px] font-mono">
            <MetricsChart
              data={data}
              isOverfitting={isOverfitting}
              architecture={architecture}
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-slate-900/90 hover:bg-slate-800/90 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 px-3.5 py-1.5 rounded-xl shadow-lg shadow-slate-950/40 flex items-center gap-2.5 cursor-pointer transition-all hover:-translate-y-0.5 group"
          title="Click to expand full telemetry & execution dashboard"
        >
          <Activity className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition-colors shrink-0" />

          {/* Unified Step & Phase Tag */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="text-indigo-300 font-semibold">{epochLabel}</span>
            <span className="text-slate-600">·</span>
            <span className={`font-semibold ${phaseColor}`}>{phaseLabel}</span>
          </div>

          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>

          {/* Active Diagnostic Status Tag in Collapsed Bar */}
          {hasActiveFault && (
            <>
              <span className="flex items-center gap-1.5 text-[11px] text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 font-sans font-medium">
                <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="truncate max-w-[90px]">{failureMode}</span>
              </span>
              <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>
            </>
          )}

          {/* Metrics numbers */}
          {isGAN ? (
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-400">
                L_G: <strong className="text-indigo-300">{latest.loss.toFixed(2)}</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">
                L_D: <strong className="text-rose-300">{(latest.valLoss ?? 0).toFixed(2)}</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">
                D(G): <strong className="text-emerald-300">{((latest.accuracy ?? 0) * 100).toFixed(0)}%</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-400">
                Loss: <strong className="text-indigo-300">{latest.loss.toFixed(3)}</strong>
              </span>
              {latest.accuracy !== undefined && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">
                    Acc: <strong className="text-emerald-300">{((latest.accuracy) * 100).toFixed(1)}%</strong>
                  </span>
                </>
              )}
            </div>
          )}

          <Maximize2 className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors ml-0.5 shrink-0" />
        </button>
      )}
    </div>
  );
};
