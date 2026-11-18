import React from 'react';
import { Sparkles, Binary, Sigma, Cpu } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { MathFormula } from '../MathFormula';

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
  // Calculate pre-activation z values (before tanh)
  const zValues = newHidden.map((h) => {
    const clamped = Math.max(-0.99, Math.min(0.99, h));
    return 0.5 * Math.log((1 + clamped) / (1 - clamped));
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 pr-12 bg-slate-950/60 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2 flex-wrap">
                RNN Cell Internal Math:{' '}
                <span className="font-mono text-indigo-400 text-sm">
                  Step {stepIndex} (token: "{token}")
                </span>
              </DialogTitle>
              <DialogDescription>
                How a recurrent neuron updates its continuous memory vector
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
          {/* Fundamental Equation Banner */}
          <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-semibold mb-1.5">
              The Recurrence Formulation
            </span>
            <MathFormula
              formula="h_t = \tanh(W_{hh} \cdot h_{t-1} + W_{xh} \cdot x_t + b)"
              displayMode={false}
              className="text-base sm:text-lg text-white"
            />
            <p className="text-xs text-indigo-200/80 mt-2.5 max-w-lg leading-relaxed">
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
                <span className="text-[11px] font-mono text-slate-400">dim: 4</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {prevHidden.map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center bg-slate-900/90 border border-slate-700/70 rounded-lg p-2">
                    <span className="text-[11px] font-mono text-slate-400">h[{idx}]</span>
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
                <span className="text-[11px] font-mono text-slate-400">dim: 4</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {inputVector.map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center bg-slate-900/90 border border-slate-700/70 rounded-lg p-2">
                    <span className="text-[11px] font-mono text-slate-400">x[{idx}]</span>
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
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Sigma className="w-3.5 h-3.5 text-amber-400" />
                Hyperbolic Tangent (tanh) Activation Curve
              </span>
              <span className="text-[11px] font-mono text-amber-300/90">Output Range: [-1.0, +1.0]</span>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Why does an RNN use <span className="font-mono text-amber-300 font-semibold">tanh</span> instead of ReLU? Because in a recurrent loop, activations are multiplied across dozens of steps. <span className="font-mono">tanh</span> strictly constrains state values to [-1, 1], preventing numbers from quickly blowing up to infinity.
            </p>

            {/* Tanh Visual Representation */}
            <div className="h-32 w-full bg-slate-950 border border-slate-800 rounded-lg relative overflow-hidden flex items-center justify-center p-2">
              <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                <line x1="0" y1="50" x2="400" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="200" y1="0" x2="200" y2="100" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

                <text x="5" y="18" fill="#94a3b8" fontSize="11" fontFamily="monospace">+1.0</text>
                <text x="5" y="92" fill="#94a3b8" fontSize="11" fontFamily="monospace">-1.0</text>
                <text x="195" y="95" fill="#94a3b8" fontSize="11" fontFamily="monospace">0</text>

                <path
                  d="M 0,95 Q 120,90 180,60 T 220,40 Q 280,10 400,5"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                />

                {newHidden.map((val, idx) => {
                  const cy = 50 - val * 45;
                  const z = zValues[idx] || 0;
                  const cx = 200 + (z / 3) * 180;
                  return (
                    <g key={idx}>
                      <circle cx={cx} cy={cy} r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                      <text x={cx + 6} y={cy - 4} fill="#a5b4fc" fontSize="11" fontFamily="monospace">
                        h[{idx}]
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Output: Resulting Memory Vector h_t */}
          <div className="bg-slate-950/70 border border-indigo-500/40 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Updated Hidden State Vector (h<sub>t</sub>)
              </span>
              <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                Transferred to Step {stepIndex + 1}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {newHidden.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center bg-slate-900/90 border border-indigo-500/40 rounded-lg p-2.5 shadow-sm">
                  <span className="text-[11px] font-mono text-slate-400">h<sub>{stepIndex}</sub>[{idx}]</span>
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
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 leading-relaxed">
              <strong>Vanishing Gradients Active:</strong> Because tanh derivatives are strictly ≤ 0.25, backpropagating gradients through many recurrent steps causes exponential decay (<span className="font-mono">0.25^T → 0</span>), making the network blind to earlier tokens.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
