import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Calculator, Target, Zap, ArrowRight, HelpCircle } from 'lucide-react';

interface DQNMathModalProps {
  isOpen: boolean;
  onClose: () => void;
  stateDesc: string;
  actionDesc: string;
  reward: number;
  nextStateDesc: string;
  qValues: { action: string; value: number }[];
  nextMaxQ: number;
  gamma?: number;
  alpha?: number;
  failureMode?: string;
}

export const DQNMathModal: React.FC<DQNMathModalProps> = ({
  isOpen,
  onClose,
  stateDesc,
  actionDesc,
  reward,
  nextStateDesc,
  qValues,
  nextMaxQ,
  gamma = 0.95,
  alpha = 0.1,
  failureMode
}) => {
  if (!isOpen) return null;

  const currentQ = qValues.find(q => q.action === actionDesc)?.value ?? 0.5;
  const discountedFuture = gamma * nextMaxQ;
  const targetY = reward + discountedFuture;
  const tdError = targetY - currentQ;
  const updatedQ = currentQ + alpha * tdError;
  const loss = 0.5 * Math.pow(tdError, 2);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Bellman Optimality & Temporal Difference (TD) Math
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    DQN Core Equation
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Step-by-step algebraic evaluation of current transition (s, a, r, s')
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">

            {/* Core Master Bellman Equation */}
            <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-xl">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold mb-1 block">
                The Bellman Optimality Equation
              </span>
              <div className="font-mono text-xs sm:text-sm text-amber-200 bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-center shadow-inner overflow-x-auto">
                <code>Q*(s, a) = E [ r + γ · maxₐ Q*(s', a') | s, a ]</code>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                The value of taking action <span className="text-amber-300 font-mono">a</span> in state <span className="text-indigo-300 font-mono">s</span> equals the immediate reward <span className="text-emerald-300 font-mono">r</span> plus the discounted maximum future reward expected from next state <span className="text-indigo-300 font-mono">s'</span>.
              </p>
            </div>

            {/* Step-by-Step Transition Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" />
                Current Step Values (s, a, r, s')
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Current State (s)</span>
                  <div className="text-sm font-bold text-indigo-300 font-mono mt-1 truncate">{stateDesc}</div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Selected Action (a)</span>
                  <div className="text-sm font-bold text-amber-300 font-mono mt-1 truncate">{actionDesc}</div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Observed Reward (r)</span>
                  <div className={`text-sm font-bold font-mono mt-1 ${reward > 0 ? 'text-emerald-400' : reward < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {reward > 0 ? `+${reward.toFixed(2)}` : reward.toFixed(2)}
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Next State (s')</span>
                  <div className="text-sm font-bold text-indigo-300 font-mono mt-1 truncate">{nextStateDesc}</div>
                </div>
              </div>
            </div>

            {/* Calculation Walkthrough Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Target Computation & Temporal Difference Error
              </h4>

              <div className="space-y-2.5">
                
                {/* Step 1: Bellman Target */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">1. Bellman Target Return (y)</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      y = r + γ · maxₐ Q_target(s', a')
                    </div>
                  </div>
                  <div className="text-right sm:text-right font-mono text-xs">
                    <span className="text-slate-400">{reward.toFixed(2)} + ({gamma} × {nextMaxQ.toFixed(2)}) = </span>
                    <span className="text-emerald-400 font-bold text-sm bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                      {targetY.toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* Step 2: Online Q-Network Prediction */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">2. Online Network Current Estimate</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Q(s, a; θ)
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-amber-400 font-bold text-sm bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                      {currentQ.toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* Step 3: TD Error & Loss */}
                <div className="bg-slate-950/70 border border-indigo-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-indigo-300">3. Temporal Difference (TD) Error (δ)</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      δ = y - Q(s, a; θ) | Loss = 0.5 · δ²
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-slate-400">{targetY.toFixed(3)} - {currentQ.toFixed(3)} = </span>
                    <span className={`font-bold text-sm px-2 py-0.5 rounded border ${tdError >= 0 ? 'text-indigo-300 bg-indigo-950/60 border-indigo-500/40' : 'text-rose-300 bg-rose-950/60 border-rose-500/40'}`}>
                      δ = {tdError > 0 ? `+${tdError.toFixed(3)}` : tdError.toFixed(3)}
                    </span>
                    <span className="text-slate-500 ml-2">(Loss: {loss.toFixed(4)})</span>
                  </div>
                </div>

                {/* Step 4: Gradient Update */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">4. Parameter Update Direction</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      θ ← θ + α · δ · ∇_θ Q(s, a; θ)
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs text-slate-300">
                    {tdError > 0 
                      ? <span className="text-emerald-400 font-semibold">Increase Q({actionDesc}) towards {targetY.toFixed(2)}</span> 
                      : <span className="text-rose-400 font-semibold">Decrease Q({actionDesc}) towards {targetY.toFixed(2)}</span>}
                  </div>
                </div>

              </div>
            </div>

            {/* Educational Callouts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <span className="font-semibold text-amber-300 font-mono block mb-1">
                  Why Discount Factor γ = 0.95?
                </span>
                <p className="text-slate-400 leading-relaxed">
                  γ (gamma) models time preference. Rewards received sooner have higher present value than distant future rewards, and prevents value accumulation from blowing up in infinite loops.
                </p>
              </div>

              <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <span className="font-semibold text-indigo-300 font-mono block mb-1">
                  Why a Target Network (θ⁻)?
                </span>
                <p className="text-slate-400 leading-relaxed">
                  If the target was computed using the same network being updated, the target would shift every step ("chasing a moving goalpost"), causing severe divergence and oscillations.
                </p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
