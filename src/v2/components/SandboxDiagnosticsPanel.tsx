import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Activity, ZapOff, ActivitySquare } from 'lucide-react';
import { FailureMode, Architecture } from '../types';

interface Props {
  failureMode: FailureMode;
  architecture: Architecture;
  isEmbedded?: boolean;
}

export const SandboxDiagnosticsPanel: React.FC<Props> = ({ 
  failureMode, 
  architecture,
  isEmbedded = true 
}) => {
  if (failureMode === 'None') return null;

  const content = getDiagnosticsContent(failureMode, architecture);
  if (!content) return null;

  if (isEmbedded) {
    return (
      <div className="bg-slate-950/40 border-b border-slate-800/70 p-3 select-none">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg shrink-0 mt-0.5 border border-rose-500/20">
            {content.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-rose-400">
                Diagnostic Fault
              </span>
              <span className="text-slate-600">·</span>
              <h4 className="text-xs font-bold text-slate-100">
                {failureMode}
              </h4>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {content.explanation}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider shrink-0">
                Watch for:
              </span>
              <span className="truncate">{content.watch}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full"
      >
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 shadow-xl">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg shrink-0 mt-0.5 border border-rose-500/20">
              {content.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-rose-400">
                  Diagnostic:
                </span>
                <h4 className="text-xs font-bold text-slate-100">{failureMode}</h4>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {content.explanation}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider shrink-0">
                  Watch for:
                </span>
                <span>{content.watch}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

function getDiagnosticsContent(failureMode: FailureMode, architecture: Architecture) {
  switch (failureMode) {
    case 'Vanishing Gradients':
      return {
        icon: <ZapOff className="w-5 h-5" />,
        explanation: "Gradients shrink exponentially backward, freezing early layers.",
        watch: "Red backprop pulses fade on the left; early gradients drop near 0."
      };
    case 'Exploding Gradients':
      return {
        icon: <Activity className="w-5 h-5" />,
        explanation: "Gradients multiply uncontrollably, overflowing weights to NaN.",
        watch: "Pulses flash bright white and probes spike to NaN."
      };
    case 'Overfitting':
      return {
        icon: <ActivitySquare className="w-5 h-5" />,
        explanation: "Model memorizes training noise instead of general patterns.",
        watch: "Validation Loss (orange) climbs while Train Loss (blue) drops."
      };
    case 'Attention Collapse':
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        explanation: "Self-attention blurs equally across all tokens, losing context focus.",
        watch: "Attention lines turn into a uniform grey web."
      };
    case 'Mode Collapse':
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        explanation: "Generator repeats a single output image regardless of noise z.",
        watch: "Generator outputs freeze into one repeating pattern."
      };
    case 'Discriminator Overpowering':
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        explanation: "Discriminator rejects all fakes with ~100% certainty, starving G of gradients.",
        watch: "D accuracy hits ~100% while G gradients collapse to 0."
      };
    case 'Poor Exploration':
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        explanation: "Agent repeats one suboptimal action after stopping random exploration too early.",
        watch: "Agent path loops endlessly near the start."
      };
    default:
      return null;
  }
}
