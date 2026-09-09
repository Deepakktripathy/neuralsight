import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, ArrowRightLeft, Cpu, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface RNNComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RNNComparisonModal: React.FC<RNNComparisonModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  The Paradigm Shift: Why Transformers Replaced RNNs
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Historical Analysis
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Understanding the architectural bottlenecks of Recurrence vs. Self-Attention
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

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Core Motivation Quote / Headline */}
            <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-xl">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold mb-1 block">
                The Core Problem
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                For over two decades (1995–2017), recurrent networks (RNNs, LSTMs, GRUs) were the state-of-the-art for sequence data. However, they possessed two fundamental physical bottlenecks that modern AI hardware (GPUs/TPUs) could not overcome.
              </p>
            </div>

            {/* Side-by-Side Architectural Contrast */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column: RNN Bottlenecks */}
              <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span className="text-xs font-bold text-indigo-300 uppercase font-mono">
                    RNN / LSTM / GRU
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div>
                    <div className="font-semibold text-rose-400 flex items-center gap-1 mb-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Sequential Bottleneck (No Parallelism)
                    </div>
                    <p className="text-slate-400">
                      Step <span className="font-mono text-slate-300">t</span> requires the output of step <span className="font-mono text-slate-300">t-1</span>. A 2,048-token sequence requires 2,048 sequential GPU memory operations. Modern GPUs with thousands of compute cores sit idle.
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-rose-400 flex items-center gap-1 mb-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Information Bottleneck & Forgetting
                    </div>
                    <p className="text-slate-400">
                      The entire history of preceding words is compressed into a single fixed-size vector <span className="font-mono text-indigo-300">h<sub>t</sub></span>. Because of vanishing gradients (<span className="font-mono">tanh' ≤ 0.25</span>), earlier tokens vanish after 15–20 steps.
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-slate-300 mb-0.5">Sequential Path Length:</div>
                    <span className="font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                      O(N) operations
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Transformer Solutions */}
              <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-amber-300 uppercase font-mono">
                    Transformer (Self-Attention)
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div>
                    <div className="font-semibold text-emerald-400 flex items-center gap-1 mb-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Massive GPU Parallelization
                    </div>
                    <p className="text-slate-400">
                      All tokens in the sequence are ingested simultaneously. The attention matrix <span className="font-mono text-amber-300">Softmax(QK<sup>T</sup> / √d)</span> is computed via high-throughput batched matrix multiplication (GEMM) saturating tensor cores.
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-emerald-400 flex items-center gap-1 mb-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Direct Token-to-Token Pathways
                    </div>
                    <p className="text-slate-400">
                      Token 1,000 can directly attend to token 1 in a single layer without propagating through 999 intermediate states, resolving the vanishing gradient problem over long sequences.
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-slate-300 mb-0.5">Sequential Path Length:</div>
                    <span className="font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      O(1) operations
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick-Reference Matrix Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Feature</th>
                    <th className="p-2.5 text-indigo-300">RNN</th>
                    <th className="p-2.5 text-amber-300">Transformer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="bg-slate-900/40">
                    <td className="p-2.5 font-sans font-semibold text-slate-200">Time Complexity (Seq)</td>
                    <td className="p-2.5 text-rose-300">O(N) Sequential steps</td>
                    <td className="p-2.5 text-emerald-300">O(1) Sequential steps</td>
                  </tr>
                  <tr className="bg-slate-950/40">
                    <td className="p-2.5 font-sans font-semibold text-slate-200">Maximum Path Length</td>
                    <td className="p-2.5 text-rose-300">O(N) hops between distant words</td>
                    <td className="p-2.5 text-emerald-300">O(1) direct attention link</td>
                  </tr>
                  <tr className="bg-slate-900/40">
                    <td className="p-2.5 font-sans font-semibold text-slate-200">Long-term Memory</td>
                    <td className="p-2.5 text-rose-300">Decays exponentially (Vanishing)</td>
                    <td className="p-2.5 text-emerald-300">Direct pairwise weight attribution</td>
                  </tr>
                  <tr className="bg-slate-950/40">
                    <td className="p-2.5 font-sans font-semibold text-slate-200">Hardware Scaling</td>
                    <td className="p-2.5 text-rose-300">Memory bandwidth bound</td>
                    <td className="p-2.5 text-emerald-300">Compute bound (ideal for GPUs)</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* Modal Footer */}
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
