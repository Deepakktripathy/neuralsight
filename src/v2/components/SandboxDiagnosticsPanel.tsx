import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Activity, ZapOff, ActivitySquare } from 'lucide-react';
import { FailureMode, Architecture } from '../types';

interface Props {
  failureMode: FailureMode;
  architecture: Architecture;
}

export const SandboxDiagnosticsPanel: React.FC<Props> = ({ failureMode, architecture }) => {
  if (failureMode === 'None') return null;

  const content = getDiagnosticsContent(failureMode, architecture);
  if (!content) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg pointer-events-none"
      >
        <div className="bg-slate-900/95 backdrop-blur-md border border-rose-500/50 rounded-xl shadow-2xl p-4 drop-shadow-[0_0_15px_rgba(244,63,94,0.15)] pointer-events-auto">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400 mt-0.5 shrink-0">
              {content.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="text-rose-400">Diagnostic:</span> {failureMode}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {content.explanation}
              </p>
              <div className="mt-2.5 p-2 bg-slate-950/80 rounded-md border border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block mb-0.5">Watch for:</span>
                <p className="text-xs text-slate-400">{content.watch}</p>
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
