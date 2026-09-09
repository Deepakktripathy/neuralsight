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
              <div className="mt-3 p-2.5 bg-slate-950/80 rounded-md border border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">What to watch for:</span>
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
        explanation: "The error signal gets exponentially smaller as it travels backward. The early layers never learn, freezing their weights.",
        watch: "Watch the red backprop pulses fade and shrink in the early layers (left side). The live gradient probes will drop to near zero."
      };
    case 'Exploding Gradients':
      return {
        icon: <Activity className="w-5 h-5" />,
        explanation: "The error signal multiplies out of control, causing massive, chaotic updates that often result in numerical instability (NaN).",
        watch: "Watch the backprop pulses become violently bright and the network connections glitch to solid white. The live probes will explode to NaN."
      };
    case 'Overfitting':
      return {
        icon: <ActivitySquare className="w-5 h-5" />,
        explanation: "The model is memorizing the exact training data, including the noise, instead of learning the general trend.",
        watch: "Keep your eyes on the graph below. Watch for the moment the Validation Loss (orange) starts climbing up while the Train Loss (blue) keeps dropping."
      };
    case 'Attention Collapse':
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        explanation: "The self-attention mechanism fails to isolate important context, instead 'blurring' its focus equally across every single word.",
        watch: "Watch the attention connection lines between tokens. Instead of forming sharp, distinct relationships, they all become a uniform grey blur."
      };
    case 'Mode Collapse':
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        explanation: "The Generator discovers it can fool the Discriminator by producing the exact same image repeatedly, ignoring the random noise input.",
        watch: "Watch the Fake Data / Generator Output nodes. Instead of flickering with diverse patterns, they will freeze into a single, repeating shape."
      };
    case 'Discriminator Overpowering':
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        explanation: "The Discriminator becomes so effective too quickly that it rejects all generated samples with near 100% certainty. The Generator receives zero usable gradient signal and ceases to learn.",
        watch: "Watch the Discriminator accuracy climb to near 100% while the Generator output remains stuck as noisy static. Gradients entering the Generator collapse to zero."
      };
    case 'Poor Exploration':
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        explanation: "The agent gets stuck repeating the exact same sub-optimal action because it stopped trying random new things too early.",
        watch: "Watch the agent's path get stuck in a tight loop on the canvas. It has found a local minimum and refuses to leave."
      };
    default:
      return null;
  }
}
