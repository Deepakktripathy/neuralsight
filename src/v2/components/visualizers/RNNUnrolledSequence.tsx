import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ArrowLeft, Cpu, Activity, AlertTriangle } from 'lucide-react';
import { LayerTooltip } from '../LayerTooltip';

interface RNNUnrolledSequenceProps {
  tokens: string[];
  currentTokenIdx: number;
  isSequenceFinished: boolean;
  getHiddenVectorForStep: (stepIdx: number) => number[];
  getInputVectorForStep: (stepIdx: number) => number[];
  getSignalStrength: (stepIdx: number) => number;
  mode: string;
  step: number;
  isVanishing: boolean;
  isExploding: boolean;
  onSelectCellToInspect: (stepIdx: number) => void;
  isGeneratingCycle: boolean;
  activePromptNext?: string;
}

export const RNNUnrolledSequence: React.FC<RNNUnrolledSequenceProps> = ({
  tokens,
  currentTokenIdx,
  isSequenceFinished,
  getHiddenVectorForStep,
  getInputVectorForStep,
  getSignalStrength,
  mode,
  step,
  isVanishing,
  isExploding,
  onSelectCellToInspect,
  isGeneratingCycle,
  activePromptNext,
}) => {
  const isBackprop = mode === 'Train' && step % 10 >= 5 && step > 0;

  return (
    <div className="w-full flex flex-col items-center gap-6 animate-in fade-in duration-300">
      
      {/* Dynamic Status Header */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
            Unrolled Sequence (t = 0 to {tokens.length - 1}):
          </span>
          <span className="text-xs text-slate-400">
            Click any cell to inspect its algebraic transition
          </span>
        </div>

        {/* Training Phase Pill */}
        <div className="flex items-center gap-2">
          {mode === 'Train' && (
            <div className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border flex items-center gap-1.5 ${
              isBackprop 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20' 
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
            }`}>
              {isBackprop ? (
                <>
                  <ArrowLeft className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>Backpropagation Through Time (BPTT)</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sequential Forward Pass</span>
                </>
              )}
            </div>
          )}

          {(isVanishing || isExploding) && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/50 text-xs font-mono text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{isVanishing ? 'Vanishing Gradients Active' : 'Exploding Gradients Active'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Unrolled Canvas */}
      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-x-auto shadow-2xl backdrop-blur-md">
        
        {/* Ambient Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-15 pointer-events-none" />

        {/* Global Connection Rail */}
        <div id="tour-rnn-hidden-state" className="absolute top-[52%] left-12 right-12 h-1 bg-slate-800/80 -z-0 rounded-full" />

        <div className="flex items-start justify-between min-w-[700px] gap-4 relative z-10 px-4 py-4">
          {tokens.map((token, i) => {
            const isProcessed = i < currentTokenIdx || isSequenceFinished;
            const isCurrent = i === currentTokenIdx && !isSequenceFinished;
            const signalStrength = getSignalStrength(i);
            const isForgotten = isVanishing && isProcessed && signalStrength < 0.15;
            const isUnstable = isExploding && isProcessed && signalStrength > 5;
            const hiddenVec = getHiddenVectorForStep(i);

            // Backprop gradient activity
            const isBpttActive = isBackprop && i <= currentTokenIdx;

            return (
              <div 
                key={i}
                id={i === 0 ? "tour-rnn-cell" : undefined}
                className={`flex-1 flex flex-col items-center gap-3 relative transition-all duration-300 ${
                  isForgotten ? 'opacity-30' : 'opacity-100'
                }`}
              >
                {/* Step Marker Badge */}
                <span className="text-[10px] font-mono text-slate-400 font-semibold">
                  t = {i}
                </span>

                {/* Input Token Box */}
                <div 
                  className={`w-full max-w-[110px] px-2.5 py-1.5 rounded-xl text-center text-xs font-mono font-medium border transition-all duration-300 shadow-sm ${
                    isCurrent 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-emerald-500/20' 
                      : isProcessed 
                      ? 'bg-slate-800/80 text-slate-300 border-slate-700' 
                      : 'bg-slate-950 text-slate-600 border-slate-800'
                  }`}
                >
                  <span className="text-[9px] text-slate-400 block font-sans">Input x<sub>{i}</sub></span>
                  <span className="font-bold truncate block">"{token}"</span>
                </div>

                {/* Input connector line */}
                <div className="h-4 flex items-center justify-center">
                  <div className={`w-0.5 h-full ${isCurrent ? 'bg-emerald-400' : isProcessed ? 'bg-slate-700' : 'bg-slate-800'}`} />
                </div>

                {/* Recurrent Cell Box */}
                <div className="relative w-full max-w-[120px]">
                  <LayerTooltip 
                    label={`RNN Cell (Step ${i})`} 
                    description={`Processes input "${token}" with previous memory. Click to inspect full matrix math.`} 
                  />

                  <div
                    onClick={() => onSelectCellToInspect(i)}
                    className={`w-full bg-slate-950 border-2 rounded-xl p-2.5 flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg group relative ${
                      isUnstable
                        ? 'border-rose-500 bg-rose-950/40 text-rose-300 shadow-rose-500/30'
                        : isCurrent
                        ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.35)]'
                        : isProcessed
                        ? 'border-indigo-500/40 bg-slate-900/90 text-slate-300 hover:border-indigo-400'
                        : 'border-slate-800 bg-slate-950 text-slate-600'
                    }`}
                  >
                    {/* Header with Cell Identifier */}
                    <div className="flex items-center justify-between w-full border-b border-slate-800/80 pb-1">
                      <span className="text-[10px] font-mono font-bold">
                        {isUnstable ? 'NaN' : <>h<sub>{i}</sub></>}
                      </span>
                      <Cpu className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    </div>

                    {/* Mini 4D Memory Vector Bars */}
                    <div className="w-full grid grid-cols-4 gap-1 py-1">
                      {hiddenVec.map((val, vIdx) => {
                        const effectiveVal = isForgotten ? 0.0 : val;
                        return (
                          <div key={vIdx} className="flex flex-col items-center">
                            <div className="w-full bg-slate-900 h-6 rounded flex items-end justify-center p-0.5 overflow-hidden border border-slate-800">
                              <div 
                                className={`w-full rounded-sm transition-all duration-300 ${
                                  isUnstable 
                                    ? 'bg-rose-500' 
                                    : effectiveVal >= 0 ? 'bg-indigo-500' : 'bg-purple-500'
                                }`}
                                style={{ height: `${Math.min(100, Math.max(10, Math.abs(effectiveVal) * 100))}%` }}
                              />
                            </div>
                            <span className="text-[8px] font-mono text-slate-400 mt-0.5">
                              {effectiveVal.toFixed(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <span className="text-[8px] font-mono text-slate-400 group-hover:text-indigo-400 transition-colors">
                      Inspect &rarr;
                    </span>
                  </div>

                  {/* Horizontal Memory Bridge Arrow (between cells) */}
                  {i < tokens.length - 1 && (
                    <div className="absolute top-1/2 -right-4 w-4 flex items-center justify-center z-0">
                      <div className={`h-0.5 w-full transition-all duration-300 ${
                        isBpttActive 
                          ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                          : isProcessed 
                          ? 'bg-indigo-400' 
                          : 'bg-slate-800'
                      }`} />
                    </div>
                  )}

                  {/* BPTT Flow Arrow (Backward pulse during train backprop) */}
                  {isBpttActive && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: -10 }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono text-rose-400 flex items-center font-bold"
                    >
                      &larr; &nabla;L
                    </motion.div>
                  )}
                </div>

                {/* Output connector line */}
                <div className="h-4 flex items-center justify-center">
                  <div className={`w-0.5 h-full ${isCurrent ? 'bg-rose-400' : isProcessed ? 'bg-slate-700' : 'bg-slate-800'}`} />
                </div>

                {/* Prediction Output Box */}
                <div 
                  className={`w-full max-w-[110px] px-2.5 py-1.5 rounded-xl text-center text-xs font-mono font-medium border transition-all duration-300 shadow-sm ${
                    isCurrent 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 ring-2 ring-rose-500/30' 
                      : isProcessed 
                      ? 'bg-slate-800/80 text-slate-300 border-slate-700' 
                      : 'bg-slate-950 text-slate-600 border-slate-800'
                  }`}
                >
                  <span className="text-[9px] text-slate-400 block font-sans">Predicted y<sub>{i}</sub></span>
                  <span className="font-bold truncate block">
                    {isCurrent ? '...' : isProcessed ? (i < tokens.length - 1 ? tokens[i+1] : (isGeneratingCycle && activePromptNext ? activePromptNext : 'END')) : '?'}
                  </span>
                </div>

              </div>
            );
          })}
        </div>

        {/* Legend / Key */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>Input Token x<sub>t</sub></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
              <span>Hidden State Memory h<sub>t</sub></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500" />
              <span>Output Prediction y<sub>t</sub></span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Click any <span className="text-indigo-400 font-semibold">h_t</span> box to open the full matrix derivation
          </div>
        </div>

      </div>

    </div>
  );
};
