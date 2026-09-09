import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, RefreshCw, Cpu, Layers, Sparkles, HelpCircle } from 'lucide-react';
import { LayerTooltip } from '../LayerTooltip';

interface RNNFoldedCellProps {
  tokens: string[];
  currentTokenIdx: number;
  currentHidden: number[];
  prevHidden: number[];
  inputVector: number[];
  prediction: string;
  step: number;
  mode: string;
  onInspectMath: () => void;
  isVanishing: boolean;
  isExploding: boolean;
}

export const RNNFoldedCell: React.FC<RNNFoldedCellProps> = ({
  tokens,
  currentTokenIdx,
  currentHidden,
  prevHidden,
  inputVector,
  prediction,
  step,
  mode,
  onInspectMath,
  isVanishing,
  isExploding,
}) => {
  const currentToken = tokens[currentTokenIdx] || tokens[0];

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-6 animate-in fade-in duration-300">
      
      {/* Concept explainer callout */}
      <div className="w-full bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">The Folded (Recurrent Loop) Representation</h4>
            <p className="text-xs text-slate-300">
              Unlike deep feedforward nets, an RNN is physically just <strong className="text-indigo-300">one single cell</strong> with a cyclical feedback loop that continuously processes time sequences.
            </p>
          </div>
        </div>

        <button
          onClick={onInspectMath}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0"
        >
          <Cpu className="w-3.5 h-3.5" />
          Inspect Internal Math
        </button>
      </div>

      {/* Main Folded Diagram Canvas */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-15 pointer-events-none" />

        {/* Input Token Tape (Conveyor feeding in sequentially) */}
        <div className="w-full flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Input Token Stream:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {tokens.map((t, idx) => {
              const isActive = idx === currentTokenIdx;
              const isPast = idx < currentTokenIdx;
              return (
                <div
                  key={idx}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border transition-all duration-300 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 scale-105 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400'
                      : isPast
                      ? 'bg-slate-800/80 text-slate-400 border-slate-700/80'
                      : 'bg-slate-950 text-slate-600 border-slate-800'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 font-mono">t={idx}</span>
                  <span>"{t}"</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Central Recurrent Diagram */}
        <div className="relative flex flex-col md:flex-row items-center justify-around gap-8 py-6">

          {/* Left: Input Vector Injection */}
          <div className="flex flex-col items-center gap-2 z-10">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              Current Input x<sub>t</sub>
            </span>
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3 flex flex-col items-center gap-2 shadow-lg">
              <span className="text-sm font-mono font-bold text-white px-3 py-1 bg-emerald-900/40 border border-emerald-500/30 rounded-lg">
                "{currentToken}"
              </span>
              <div className="flex gap-1.5">
                {inputVector.map((val, i) => (
                  <div key={i} className="flex flex-col items-center text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400">x{i}</span>
                    <span className="font-semibold text-emerald-300">{val.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
              <span>Embedding Vector</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Center: The Folded Recurrent Cell with Feedback Loop */}
          <div className="relative flex flex-col items-center">
            
            {/* The Recurrent Self-Loop Arrow (SVG curves out from right, loops around top, and enters left) */}
            <svg 
              className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-24 pointer-events-none overflow-visible z-0" 
              viewBox="0 0 240 90"
            >
              <defs>
                <linearGradient id="loopGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <marker id="loopArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <polygon points="0 1, 8 4, 0 7" fill="#818cf8" />
                </marker>
              </defs>

              {/* Looping trajectory */}
              <path
                d="M 180,85 C 230,85 230,10 120,10 C 20,10 20,85 65,85"
                fill="none"
                stroke="url(#loopGradient)"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                markerEnd="url(#loopArrow)"
              />

              {/* Particle travelling along loop */}
              <motion.circle
                r="4"
                fill="#a855f7"
                filter="drop-shadow(0 0 4px #a855f7)"
                animate={{
                  offsetDistance: ['0%', '100%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'linear',
                }}
                style={{
                  offsetPath: 'path("M 180,85 C 230,85 230,10 120,10 C 20,10 20,85 65,85")',
                }}
              />
            </svg>

            {/* Loop Label Badge */}
            <div className="absolute -top-14 bg-slate-900 border border-purple-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-purple-300 shadow-lg z-20 flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-purple-400" />
              <span>Feedback Memory: h<sub>t-1</sub> → h<sub>t</sub></span>
            </div>

            {/* The Main RNN Cell Box */}
            <div 
              onClick={onInspectMath}
              className="w-64 bg-gradient-to-b from-slate-900 via-indigo-950/30 to-slate-900 border-2 border-indigo-500/60 rounded-2xl p-4 shadow-[0_0_30px_rgba(99,102,241,0.2)] relative z-10 cursor-pointer hover:border-indigo-400 transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between pb-2 border-b border-indigo-500/30">
                <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  RNN Unit (Hidden State)
                </span>
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  Step {currentTokenIdx}
                </span>
              </div>

              {/* Internal Architecture Blueprint */}
              <div className="py-3 flex flex-col gap-2">
                <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-xs font-mono">
                  <span className="text-slate-400">Concatenation:</span>
                  <span className="text-indigo-300 font-semibold">[ h<sub>t-1</sub> , x<sub>t</sub> ]</span>
                </div>

                <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-xs font-mono">
                  <span className="text-slate-400">Linear Dot Product:</span>
                  <span className="text-amber-300 font-semibold">W · [h, x] + b</span>
                </div>

                <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-xs font-mono">
                  <span className="text-slate-400">Activation:</span>
                  <span className="text-purple-300 font-semibold">tanh( · )</span>
                </div>
              </div>

              {/* Vector Output inside cell */}
              <div className="pt-2 border-t border-indigo-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-400">Memory Vector h<sub>t</sub>:</span>
                  <span className="text-[10px] font-mono text-indigo-400 group-hover:underline flex items-center gap-0.5">
                    Click to inspect math &rarr;
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {currentHidden.map((val, idx) => (
                    <div key={idx} className="bg-slate-950 border border-indigo-500/30 rounded p-1 text-center">
                      <span className="block text-[8px] text-slate-400 font-mono">h[{idx}]</span>
                      <span className="text-[11px] font-mono font-bold text-white">{val.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right: Output Prediction Head */}
          <div className="flex flex-col items-center gap-2 z-10">
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold">
              Output Token Prediction y<sub>t</sub>
            </span>
            <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3 flex flex-col items-center gap-2 shadow-lg">
              <span className="text-sm font-mono font-bold text-white px-3 py-1 bg-rose-900/40 border border-rose-500/30 rounded-lg">
                "{prediction}"
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                W<sub>hy</sub> · h<sub>t</sub> → Softmax
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
              <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Next Token Probability</span>
            </div>
          </div>

        </div>

        {/* Bottom Educational Footnote */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Notice that the weights <span className="font-mono text-indigo-300 font-semibold">W_hh</span> and <span className="font-mono text-emerald-300 font-semibold">W_xh</span> are shared across every single step!</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span>Time Complexity:</span>
            <span className="text-amber-400 font-semibold">O(N) Sequential</span>
          </div>
        </div>

      </div>

    </div>
  );
};
