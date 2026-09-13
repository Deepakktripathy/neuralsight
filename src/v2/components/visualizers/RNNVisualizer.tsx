import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hyperparameters, Mode, DataSource } from '../../types';
import { PREDEFINED_PROMPTS } from '../../lib/prompts';
import { RNNUnrolledSequence } from './RNNUnrolledSequence';
import { RNNFoldedCell } from './RNNFoldedCell';
import { RNNCellMathModal } from './RNNCellMathModal';
import { RNNComparisonModal } from './RNNComparisonModal';
import { RefreshCw, AlignLeft, Cpu, Zap, ArrowRightLeft, BookOpen, AlertTriangle } from 'lucide-react';

interface RNNVisualizerProps {
  hyperparams: Hyperparameters;
  step: number;
  mode: Mode;
  dataSource: DataSource;
}

type RNNViewMode = 'unrolled' | 'folded';

export const RNNVisualizer: React.FC<RNNVisualizerProps> = ({ 
  hyperparams, 
  step, 
  mode, 
  dataSource 
}) => {
  const [viewMode, setViewMode] = useState<RNNViewMode>('unrolled');
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [inspectedStepIdx, setInspectedStepIdx] = useState<number | null>(null);

  const activePrompt = dataSource === 'Text Prompt' ? PREDEFINED_PROMPTS[selectedPromptIdx] : null;
  
  const defaultTextForSource = useMemo(() => {
    if (dataSource?.includes('IMDB')) return "This movie was absolutely brilliant and captivating";
    if (dataSource?.includes('Stock')) return "142.5 144.2 143.8 146.1 148.9 147.2";
    if (dataSource?.includes('Translation')) return "The quick brown fox jumps over the dog";
    return "The river overflowed its muddy banks yesterday";
  }, [dataSource]);

  const inputText = dataSource === 'Text Prompt' ? activePrompt!.prompt : defaultTextForSource;

  const baseTokens = useMemo(() => {
    return inputText.trim().split(/\s+/).filter(Boolean);
  }, [inputText]);

  const isGeneratingCycle = mode === 'Inference' && dataSource === 'Text Prompt';
  
  const targetTokens = useMemo(() => {
    if (isGeneratingCycle && activePrompt) {
      return [...baseTokens, activePrompt.next];
    }
    return baseTokens;
  }, [baseTokens, isGeneratingCycle, activePrompt]);

  // Constrain sequence length to selected unroll steps
  const maxSteps = hyperparams.rnnUnrollSteps || 5;
  const tokens = useMemo(() => {
    return targetTokens.slice(0, maxSteps);
  }, [targetTokens, maxSteps]);

  const numTokens = tokens.length;
  
  // Sequential animation progression
  const stepsPerToken = 10;
  const sequenceSteps = numTokens * stepsPerToken;
  const cycle = step % (sequenceSteps + 20);
  
  const currentTokenIdx = Math.min(numTokens - 1, Math.floor(cycle / stepsPerToken));
  const isSequenceFinished = cycle >= sequenceSteps;

  const isVanishing = mode === 'Train' && hyperparams.failureMode === 'Vanishing Gradients';
  const isExploding = mode === 'Train' && hyperparams.failureMode === 'Exploding Gradients';

  // Deterministic 4D vector embedding for any given token
  const getInputVectorForStep = (idx: number): number[] => {
    const word = tokens[idx] || '';
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    return [
      Math.sin(hash * 0.1) * 0.8,
      Math.cos(hash * 0.2) * 0.8,
      Math.sin(hash * 0.3) * 0.8,
      Math.cos(hash * 0.4) * 0.8,
    ];
  };

  // Signal strength degradation across distance
  const getSignalStrength = (i: number) => {
    const distance = Math.max(0, currentTokenIdx - i);
    if (isVanishing) return Math.pow(0.25, distance);
    if (isExploding) return Math.min(50, Math.pow(1.8, distance));
    return Math.pow(0.88, distance);
  };

  // Recurrent hidden state calculation for step i
  const getHiddenVectorForStep = (i: number): number[] => {
    if (isExploding && i === currentTokenIdx) {
      return [999.9, 999.9, 999.9, 999.9];
    }

    const strength = getSignalStrength(i);
    const inputVec = getInputVectorForStep(i);
    const prevVec = i > 0 ? getInputVectorForStep(i - 1) : [0.1, -0.2, 0.3, -0.1];

    return inputVec.map((x, vIdx) => {
      const prevH = prevVec[vIdx];
      // tanh(0.6 * prevH + 0.7 * x)
      const raw = Math.tanh(0.6 * prevH + 0.7 * x);
      if (isVanishing && i < currentTokenIdx) {
        return raw * strength;
      }
      return raw;
    });
  };

  const currentHidden = getHiddenVectorForStep(currentTokenIdx);
  const prevHidden = currentTokenIdx > 0 ? getHiddenVectorForStep(currentTokenIdx - 1) : [0.0, 0.0, 0.0, 0.0];
  const inputVector = getInputVectorForStep(currentTokenIdx);

  const currentPrediction = currentTokenIdx < tokens.length - 1 
    ? tokens[currentTokenIdx + 1] 
    : (isGeneratingCycle && activePrompt ? activePrompt.next : 'EOS');

  return (
    <div className="w-full min-h-full flex flex-col items-center justify-start p-4 sm:p-6 relative bg-slate-950 gap-6">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-15 pointer-events-none" />

      {/* Top Header Controls: View Switcher & Dataset Config */}
      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 z-20">
        
        {/* Left: View Mode Segmented Control (Unrolled vs Folded) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Architecture View:
          </span>

          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setViewMode('unrolled')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'unrolled'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Unrolled Sequence (t = 0...T)</span>
            </button>

            <button
              onClick={() => setViewMode('folded')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'folded'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Folded Cell (Recurrent Loop)</span>
            </button>
          </div>
        </div>

        {/* Right: Dataset / Prompt Selector + Transformer Comparison Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {dataSource === 'Text Prompt' && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Prompt:</span>
              <select
                value={selectedPromptIdx}
                onChange={(e) => setSelectedPromptIdx(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono"
              >
                {PREDEFINED_PROMPTS.map((p, i) => (
                  <option key={i} value={i}>
                    Prompt {i + 1}: "{p.prompt.slice(0, 20)}..."
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setShowComparison(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showComparison
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Why Transformers Won</span>
          </button>
        </div>

      </div>

      {/* Active Failure Mode Alert Banner */}
      {(isVanishing || isExploding) && (
        <div className="w-full max-w-5xl bg-rose-950/40 border border-rose-500/50 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg z-10 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-300 uppercase font-mono tracking-wide">
                {isVanishing ? 'Failure Mode: Vanishing Gradients (Catastrophic Forgetting)' : 'Failure Mode: Exploding Gradients'}
              </span>
              <p className="text-xs text-slate-300">
                {isVanishing 
                  ? 'Notice how earlier tokens fade away. Because derivative of tanh is ≤ 0.25, backpropagating gradients decay exponentially to 0.'
                  : 'Gradients multiplied repeatedly across recurrent steps grow unboundedly, overflowing floating point precision into NaN.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport Content */}
      <div className="w-full flex justify-center z-10">
        {viewMode === 'unrolled' ? (
          <RNNUnrolledSequence
            tokens={tokens}
            currentTokenIdx={currentTokenIdx}
            isSequenceFinished={isSequenceFinished}
            getHiddenVectorForStep={getHiddenVectorForStep}
            getInputVectorForStep={getInputVectorForStep}
            getSignalStrength={getSignalStrength}
            mode={mode}
            step={step}
            isVanishing={isVanishing}
            isExploding={isExploding}
            onSelectCellToInspect={(idx) => setInspectedStepIdx(idx)}
            isGeneratingCycle={isGeneratingCycle}
            activePromptNext={activePrompt?.next}
          />
        ) : (
          <RNNFoldedCell
            tokens={tokens}
            currentTokenIdx={currentTokenIdx}
            currentHidden={currentHidden}
            prevHidden={prevHidden}
            inputVector={inputVector}
            prediction={currentPrediction}
            step={step}
            mode={mode}
            onInspectMath={() => setInspectedStepIdx(currentTokenIdx)}
            isVanishing={isVanishing}
            isExploding={isExploding}
          />
        )}
      </div>

      {/* Mathematical Inspection Modal */}
      {inspectedStepIdx !== null && (
        <RNNCellMathModal
          isOpen={true}
          onClose={() => setInspectedStepIdx(null)}
          token={tokens[inspectedStepIdx] || ''}
          stepIndex={inspectedStepIdx}
          prevHidden={inspectedStepIdx > 0 ? getHiddenVectorForStep(inspectedStepIdx - 1) : [0.0, 0.0, 0.0, 0.0]}
          inputVector={getInputVectorForStep(inspectedStepIdx)}
          newHidden={getHiddenVectorForStep(inspectedStepIdx)}
          failureMode={hyperparams.failureMode}
        />
      )}

      {/* Why Transformers Won Comparison Modal */}
      <RNNComparisonModal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />

    </div>
  );
};
