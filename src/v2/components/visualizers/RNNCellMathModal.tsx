import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Binary, Sigma, Cpu } from 'lucide-react';

interface RNNCellMathModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  stepIndex: number;
  prevHidden: number[];
  inputVector: number[];
  newHidden: number[];
  failureMode?: string;
}

export const RNNCellMathModal: React.FC<RNNCellMathModalProps> = ({
  isOpen,
  onClose,
  token,
  stepIndex,
  prevHidden,
  inputVector,
  newHidden,
  failureMode,
}) => {
  if (!isOpen) return null;

  // Calculate pre-activation z values (before tanh)
  const zValues = newHidden.map(h => {
    // inverted tanh: atanh(h), clamped to [-3, 3] for visualization
    const clamped = Math.max(-0.99, Math.min(0.99, h));
    return 0.5 * Math.log((1 + clamped) / (1 - clamped));
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  RNN Cell Internal Math: <span className="font-mono text-indigo-400 text-sm">Step {stepIndex} (token: "{token}")</span>
                </h3>
                <p className="text-xs text-slate-400">
                  How a recurrent neuron updates its continuous memory vector
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

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Fundamental Equation Banner */}
            <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-semibold mb-1">
                The Recurrence Formulation
              </span>
              <div className="text-lg sm:text-xl font-mono text-white tracking-wide">
                h<sub>t</sub> = tanh( W<sub>hh</sub> · h<sub>t-1</sub> + W<sub>xh</sub> · x<sub>t</sub> + b )
              </div>
              <p className="text-xs text-indigo-200/80 mt-2 max-w-lg">
                The new hidden state combines prior memories (<span className="font-mono text-indigo-300">h<sub>t-1</sub></span>) with the current token embedding (<span className="font-mono text-emerald-300">x<sub>t</sub></span>), passing through a nonlinear hyperbolic tangent (<span className="font-mono text-amber-300">tanh</span>) squashing function.
              </p>
            </div>

            {/* Inputs & Computation Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Input 1: Prior Memory Vector h_{t-1} */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Binary className="w-3.5 h-3.5 text-indigo-400" />
                    Previous Memory Vector (h<sub>t-1</sub>)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">dim: 4</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {prevHidden.map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-slate-900/90 border border-slate-700/70 rounded-lg p-2">
                      <span className="text-[10px] font-mono text-slate-400">h[{idx}]</span>
                      <span className="text-xs font-mono font-bold text-indigo-200">{val.toFixed(2)}</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(5, (val + 1) * 50))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input 2: Current Word Embedding Vector x_t */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Input Token Vector (x<sub>t</sub> = "{token}")
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">dim: 4</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {inputVector.map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-slate-900/90 border border-slate-700/70 rounded-lg p-2">
                      <span className="text-[10px] font-mono text-slate-400">x[{idx}]</span>
                      <span className="text-xs font-mono font-bold text-emerald-300">{val.toFixed(2)}</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(5, (val + 1) * 50))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Non-linear Activation Function: Tanh Squashing */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Sigma className="w-3.5 h-3.5 text-amber-400" />
                  Hyperbolic Tangent (tanh) Activation Curve
                </span>
                <span className="text-[10px] font-mono text-amber-400/80">Output Range: [-1.0, +1.0]</span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Why does an RNN use <span className="font-mono text-amber-300 font-semibold">tanh</span> instead of ReLU? Because in a recurrent loop, activations are multiplied across dozens of steps. <span className="font-mono">tanh</span> strictly constrains state values to [-1, 1], preventing numbers from quickly blowing up to infinity.
              </p>

              {/* Tanh Visual Representation */}
              <div className="h-32 w-full bg-slate-950 border border-slate-800 rounded-lg relative overflow-hidden flex items-center justify-center p-2">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="200" y1="0" x2="200" y2="100" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Range labels */}
                  <text x="5" y="18" fill="#64748b" fontSize="10" fontFamily="monospace">+1.0</text>
                  <text x="5" y="92" fill="#64748b" fontSize="10" fontFamily="monospace">-1.0</text>
                  <text x="195" y="95" fill="#64748b" fontSize="9" fontFamily="monospace">0</text>

                  {/* S-curve path for tanh */}
                  <path 
                    d="M 0,95 Q 120,90 180,60 T 220,40 Q 280,10 400,5" 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="2.5" 
                  />

                  {/* Current Active Output Points on the curve */}
                  {newHidden.map((val, idx) => {
                    // Map val from [-1, 1] to [95, 5]
                    const cy = 50 - val * 45;
                    // Approximate z position
                    const z = zValues[idx] || 0;
                    const cx = 200 + (z / 3) * 180;
                    return (
                      <g key={idx}>
                        <circle cx={cx} cy={cy} r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={cx + 6} y={cy - 4} fill="#a5b4fc" fontSize="9" fontFamily="monospace">
                          h[{idx}]
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Output: Resulting Memory Vector h_t */}
            <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  Updated Hidden State Vector (h<sub>t</sub>)
                </span>
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                  Transferred to Step {stepIndex + 1}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {newHidden.map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center bg-slate-900/90 border border-indigo-500/40 rounded-lg p-2.5 shadow-sm">
                    <span className="text-[10px] font-mono text-slate-400">h<sub>{stepIndex}</sub>[{idx}]</span>
                    <span className="text-sm font-mono font-bold text-white">{val.toFixed(3)}</span>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          val >= 0 ? 'bg-indigo-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.abs(val) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {failureMode === 'Vanishing Gradients' && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                <strong>Vanishing Gradients Active:</strong> Because tanh derivatives are strictly ≤ 0.25, backpropagating gradients through many recurrent steps causes exponential decay (<span className="font-mono">0.25^T → 0</span>), making the network blind to earlier tokens.
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
            >
              Done Inspecting
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
