import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Eye, Info, Layers, Compass, HelpCircle } from 'lucide-react';
import { Mode, FailureMode } from '../../types';

interface TransformerConceptAProps {
  tokens: string[];
  mode: Mode;
  step: number;
  failureMode?: FailureMode;
  dataSource?: string;
}

type HeadType = 'syntactic' | 'sentiment' | 'positional' | 'longrange';
type ActiveTab = 'heatmap' | 'query' | 'key' | 'value' | 'output';

export const TransformerConceptA: React.FC<TransformerConceptAProps> = ({
  tokens,
  mode,
  step,
  failureMode,
  dataSource
}) => {
  const [activeHead, setActiveHead] = useState<HeadType>('sentiment');
  const [activeTab, setActiveTab] = useState<ActiveTab>('heatmap');
  const [hoveredCell, setHoveredCell] = useState<{ qIdx: number; kIdx: number } | null>(null);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(0);

  const N = tokens.length;
  const d_k = 4; // Embedding dimension for visualization

  // Simulated Q, K, V vectors per token and head with semantic differentiation and training step progression
  const vectors = useMemo(() => {
    // Training progress factor: 0.0 at step 0 (diffuse/unlearned) -> 1.0 at step 50+ (converged/sharp)
    const trainProgress = mode === 'Train' ? Math.min(1, Math.max(0.15, step / 45)) : 1.0;
    const stepJitter = mode === 'Train' && step > 0 ? ((step % 7) - 3) * 0.015 : 0;

    return tokens.map((token, i) => {
      const lower = token.toLowerCase();
      
      // Categorize tokens
      const isStopWord = ['to', 'the', 'a', 'an', 'in', 'of', 'and', 'was', 'or', 'at'].includes(lower);
      const isNegation = ['not', 'no', 'never', 'neither', 'nor'].includes(lower);
      const isSentiment = ['superb', 'heartwarming', 'bad', 'great', 'terrible', 'good', 'love', 'hate'].includes(lower);
      const isAction = ['be', 'overflowed', 'jumps', 'acting', 'rises', 'falls', 'is', 'are'].includes(lower);

      // Semantic base hash for deterministic unique token embedding
      const hash = token.split('').reduce((acc, c, idx) => acc + c.charCodeAt(0) * (idx + 1), 0);
      const dim0 = Math.sin(hash) * 0.5;
      const dim1 = Math.cos(hash * 1.3) * 0.5;
      const dim2 = Math.sin(hash * 2.1) * 0.5;
      const dim3 = Math.cos(hash * 3.7) * 0.5;

      let q = [dim0, dim1, dim2, dim3];
      let k = [dim0, dim1, dim2, dim3];
      let v = [0.5 + dim1 * 0.3, 0.4 + dim2 * 0.3, 0.3 + dim0 * 0.3, 0.6 + dim3 * 0.3];

      if (activeHead === 'sentiment') {
        // Head 1: Semantic Salience & Keywords (content words, negation, sentiment, verbs)
        const salienceScore = isSentiment ? 1.0 : isNegation ? 0.85 : isAction ? 0.70 : isStopWord ? 0.20 : 0.55;
        const contrast = 0.3 + 0.7 * trainProgress;

        q = [
          (salienceScore * 0.9 + dim0 * 0.2) * contrast + stepJitter,
          (salienceScore * 0.85 + dim1 * 0.2) * contrast,
          (isNegation ? -0.5 : 0.2) * contrast,
          (isSentiment ? 0.6 : 0.15) * contrast
        ];
        k = [
          (salienceScore * 0.85 + dim0 * 0.2) * contrast,
          (salienceScore * 0.90 + dim1 * 0.2) * contrast + stepJitter,
          (isNegation ? -0.45 : 0.25) * contrast,
          (isSentiment ? 0.55 : 0.20) * contrast
        ];
        v = [0.2 + salienceScore * 0.7, 0.3 + dim1 * 0.4, 0.1 + dim2 * 0.3, 0.4 + salienceScore * 0.5];
      } else if (activeHead === 'syntactic') {
        // Head 2: Syntactic (Next-Word / previous-token attraction)
        const posFactor = (i / Math.max(1, N - 1));
        q = [Math.sin(posFactor * Math.PI) * 0.8 * trainProgress, Math.cos(posFactor * Math.PI) * 0.7, dim0 * 0.3, 0.2];
        k = [Math.sin((posFactor + 0.2) * Math.PI) * 0.8 * trainProgress, Math.cos((posFactor + 0.2) * Math.PI) * 0.7, dim1 * 0.3, 0.2];
        v = [0.4 + posFactor * 0.4, 0.3, 0.5, 0.2];
      } else if (activeHead === 'positional') {
        // Head 3: Positional (Self & Local Neighbor Attraction)
        const phase = (i * 2 * Math.PI) / N;
        q = [Math.sin(phase) * 0.9 * trainProgress, Math.cos(phase) * 0.9 * trainProgress, 0.4, 0.3];
        k = [Math.sin(phase) * 0.9 * trainProgress, Math.cos(phase) * 0.9 * trainProgress, 0.4, 0.3];
        v = [0.3 + Math.sin(phase) * 0.3, 0.4 + Math.cos(phase) * 0.3, 0.5, 0.6];
      } else {
        // Head 4: Long-range / Coreference (boundary coupling)
        const isFirst = i === 0;
        const isLast = i === N - 1;
        q = [isFirst ? 0.95 * trainProgress : 0.2, isLast ? 0.85 * trainProgress : 0.25, dim0 * 0.3, 0.1];
        k = [isLast ? 0.95 * trainProgress : 0.25, isFirst ? 0.85 * trainProgress : 0.2, dim1 * 0.3, 0.1];
        v = [0.6, 0.7, 0.2, 0.3];
      }

      return { q, k, v };
    });
  }, [tokens, activeHead, N, step, mode]);

  // Compute N x N attention matrix with dynamic temperature and training progression
  const attentionMatrix = useMemo(() => {
    if (failureMode === 'Attention Collapse' && mode === 'Train') {
      // Uniform collapsed weights (1/N)
      const uniform = 1 / N;
      return Array.from({ length: N }, () => Array.from({ length: N }, () => uniform));
    }

    // Softmax temperature: 2.2 (diffuse, untrained) -> 0.75 (sharp, converged) as training steps advance
    const trainProgress = mode === 'Train' ? Math.min(1, Math.max(0.05, step / 50)) : 1.0;
    const temperature = mode === 'Train' ? 2.2 - trainProgress * 1.45 : 0.85;

    const matrix: number[][] = [];
    for (let i = 0; i < N; i++) {
      const rowScores: number[] = [];
      for (let j = 0; j < N; j++) {
        // Scaled dot product: (Q_i . K_j) / (sqrt(d_k) * temperature)
        let dot = 0;
        for (let d = 0; d < d_k; d++) {
          dot += vectors[i].q[d] * vectors[j].k[d];
        }

        // Add subtle live gradient pulse during active training
        const gradientPulse = mode === 'Train' && step > 0 
          ? Math.sin(step * 0.8 + i * 1.5 + j * 2.3) * 0.08 * (1 - trainProgress * 0.5)
          : 0;

        const scaled = (dot / Math.sqrt(d_k) + gradientPulse) / temperature;
        rowScores.push(scaled);
      }

      // Softmax normalization across the row
      const maxScore = Math.max(...rowScores);
      const expScores = rowScores.map(s => Math.exp(s - maxScore));
      const sumExp = expScores.reduce((a, b) => a + b, 0);
      const normalized = expScores.map(s => s / Math.max(1e-8, sumExp));
      matrix.push(normalized);
    }
    return matrix;
  }, [vectors, N, failureMode, mode, step]);

  // Active cell info for explanation
  const activeCellData = useMemo(() => {
    if (!hoveredCell) {
      // Default to attending to the strongest element of selectedTokenIdx
      const row = attentionMatrix[selectedTokenIdx] || [];
      const maxColIdx = row.reduce((maxIdx, val, idx, arr) => val > arr[maxIdx] ? idx : maxIdx, 0);
      return {
        qIdx: selectedTokenIdx,
        kIdx: maxColIdx,
        weight: row[maxColIdx] ?? 0.5
      };
    }
    return {
      qIdx: hoveredCell.qIdx,
      kIdx: hoveredCell.kIdx,
      weight: attentionMatrix[hoveredCell.qIdx]?.[hoveredCell.kIdx] ?? 0
    };
  }, [hoveredCell, selectedTokenIdx, attentionMatrix]);

  const qToken = tokens[activeCellData.qIdx] || '';
  const kToken = tokens[activeCellData.kIdx] || '';

  return (
    <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col gap-5">
      
      {/* Concept A Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Concept A: Query, Key, Value & Attention Heatmap
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
                {'Softmax(QKᵀ / √d_k) V'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Inspect how word tokens project into $Q, K, V$ vectors and calculate pairwise $N \times N$ attention weights
            </p>
          </div>
        </div>

        {/* Failure Mode Warning */}
        {failureMode === 'Attention Collapse' && mode === 'Train' && (
          <span className="px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold animate-pulse">
            ⚠️ Attention Collapse: Flat 1/N Weights
          </span>
        )}
      </div>

      {/* Head Specialization Switcher (Why Multi-Head matters) */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 px-2">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span>Multi-Head Switcher:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveHead('sentiment')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeHead === 'sentiment'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Head 1: Sentiment / Salience
          </button>
          <button
            onClick={() => setActiveHead('syntactic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeHead === 'syntactic'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Head 2: Syntactic (Next-Word)
          </button>
          <button
            onClick={() => setActiveHead('positional')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeHead === 'positional'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Head 3: Positional (Self)
          </button>
          <button
            onClick={() => setActiveHead('longrange')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeHead === 'longrange'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Head 4: Long-Range / Coreference
          </button>
        </div>
      </div>

      {/* Main Interactive Work Area: Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-3 py-1.5 rounded-t-lg text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'heatmap'
              ? 'border-indigo-500 text-indigo-300 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>1. Attention Heatmap Matrix (N×N)</span>
        </button>
        <button
          onClick={() => setActiveTab('query')}
          className={`px-3 py-1.5 rounded-t-lg text-xs font-medium border-b-2 transition-all ${
            activeTab === 'query'
              ? 'border-indigo-500 text-indigo-300 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          2. Query Vectors ($Q$)
        </button>
        <button
          onClick={() => setActiveTab('key')}
          className={`px-3 py-1.5 rounded-t-lg text-xs font-medium border-b-2 transition-all ${
            activeTab === 'key'
              ? 'border-indigo-500 text-indigo-300 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          3. Key Vectors ($K$)
        </button>
        <button
          onClick={() => setActiveTab('value')}
          className={`px-3 py-1.5 rounded-t-lg text-xs font-medium border-b-2 transition-all ${
            activeTab === 'value'
              ? 'border-indigo-500 text-indigo-300 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          4. Value Vectors ($V$)
        </button>
      </div>

      {/* Tab 1: Attention Heatmap View */}
      {activeTab === 'heatmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* N x N Matrix Grid (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span>{'Self-Attention Matrix A (N × N)'}</span>
                {mode === 'Train' && (
                  <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Learning (Step {step})</span>
                  </span>
                )}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {'Row = Query (q_i) | Column = Key (k_j)'}
              </span>
            </div>

            {/* Matrix Container */}
            <div className="overflow-x-auto w-full flex justify-center">
              <div className="inline-block">
                
                {/* Top Column Labels (Key Tokens) */}
                <div className="flex ml-20 mb-1.5 gap-1">
                  {tokens.map((token, j) => {
                    const isKeyActive = activeCellData.kIdx === j;
                    return (
                      <div
                        key={`k-hdr-${j}`}
                        className={`w-12 text-center text-[10px] font-mono truncate px-1 py-0.5 rounded ${
                          isKeyActive ? 'bg-indigo-500/30 text-indigo-200 font-bold border border-indigo-400/50' : 'text-slate-400'
                        }`}
                        title={token}
                      >
                        {token}
                      </div>
                    );
                  })}
                </div>

                {/* Matrix Rows */}
                <div className="flex flex-col gap-1">
                  {tokens.map((qTok, i) => {
                    const isQueryActive = activeCellData.qIdx === i;
                    return (
                      <div key={`q-row-${i}`} className="flex items-center gap-1">
                        
                        {/* Row Label (Query Token) */}
                        <div
                          onClick={() => setSelectedTokenIdx(i)}
                          className={`w-20 text-right text-[10px] font-mono truncate pr-2 py-1 rounded cursor-pointer transition-colors ${
                            isQueryActive ? 'bg-indigo-500/30 text-indigo-200 font-bold border border-indigo-400/50' : 'text-slate-400 hover:text-slate-200'
                          }`}
                          title={qTok}
                        >
                          {qTok}
                        </div>

                        {/* Cells for this row */}
                        <div className="flex gap-1">
                          {tokens.map((_, j) => {
                            const weight = attentionMatrix[i]?.[j] ?? 0;
                            const isCellHovered = activeCellData.qIdx === i && activeCellData.kIdx === j;

                            return (
                              <motion.div
                                key={`cell-${i}-${j}`}
                                onMouseEnter={() => setHoveredCell({ qIdx: i, kIdx: j })}
                                onMouseLeave={() => setHoveredCell(null)}
                                className={`w-12 h-10 rounded flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                                  isCellHovered 
                                    ? 'ring-2 ring-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.9)] z-20 scale-105' 
                                    : 'hover:ring-1 hover:ring-indigo-300'
                                }`}
                                style={{
                                  backgroundColor: `rgba(99, 102, 241, ${Math.max(0.08, weight * 0.9)})`,
                                  color: weight > 0.4 ? '#ffffff' : '#94a3b8'
                                }}
                              >
                                <span className="text-[10px] font-mono font-bold leading-tight">
                                  {weight.toFixed(2)}
                                </span>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between w-full mt-3 text-[10px] text-slate-500 pt-2 border-t border-slate-900">
              <span>Low Attention (0.00)</span>
              <div className="w-32 h-2 rounded bg-gradient-to-r from-slate-900 via-indigo-700 to-indigo-400 border border-slate-700" />
              <span>High Attention (1.00)</span>
            </div>
          </div>

          {/* Detailed Mathematical Breakdown Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">
                  Live Mathematical Breakdown
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {mode === 'Train' ? `Train Step ${step}` : 'Inference'}
              </span>
            </div>

            {/* Natural language explanation */}
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
              <span className="text-[11px] text-indigo-300 block font-semibold mb-1">
                Pairwise Attention Relationship:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                When evaluating Query token <strong className="text-indigo-300">"{qToken}"</strong>, the model directs{' '}
                <strong className="text-emerald-400">{(activeCellData.weight * 100).toFixed(1)}%</strong> of its attention weight to Key token{' '}
                <strong className="text-indigo-300">"{kToken}"</strong>.
              </p>
            </div>

            {/* Step-by-Step Formula */}
            <div className="space-y-2 text-[11px] font-mono bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center text-slate-400 pb-1 border-b border-slate-800">
                <span>Step 1: Dot Product ($q_i \cdot k_j$)</span>
                <span className="text-slate-200 font-semibold">
                  {(activeCellData.weight * 3.42).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pb-1 border-b border-slate-800">
                <span>Step 2: Scale by $\sqrt{d_k}$ ($\sqrt{4} = 2$)</span>
                <span className="text-slate-200 font-semibold">
                  {((activeCellData.weight * 3.42) / 2).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-indigo-300">
                <span>Step 3: Softmax across row</span>
                <span className="text-emerald-400 font-bold">
                  {activeCellData.weight.toFixed(4)}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed">
              <strong className="text-slate-300">Why scale by $\sqrt{d_k}$?</strong> In high dimensions, dot products grow large, pushing the Softmax into tiny gradient regions. Scaling keeps variance around 1.0.
            </div>
          </div>
        </div>
      )}

      {/* Tabs 2, 3, 4: Vector Projections (Q, K, V) */}
      {(activeTab === 'query' || activeTab === 'key' || activeTab === 'value') && (
        <div className="flex flex-col gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                {activeTab === 'query' ? 'Query Vectors (Q = X · W_Q)' : activeTab === 'key' ? 'Key Vectors (K = X · W_K)' : 'Value Vectors (V = X · W_V)'}
              </span>
              <span className="text-[10px] text-slate-400">
                {activeTab === 'query' 
                  ? 'Queries represent what each token is actively looking for from other tokens in the sequence.' 
                  : activeTab === 'key' 
                    ? 'Keys represent what information or semantic role each token advertises to potential queries.' 
                    : 'Values hold the actual contextual content that is extracted and aggregated.'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-indigo-400">dim = 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tokens.map((token, idx) => {
              const vec = activeTab === 'query' ? vectors[idx].q : activeTab === 'key' ? vectors[idx].k : vectors[idx].v;
              const isSelected = selectedTokenIdx === idx;

              return (
                <div
                  key={`vec-${idx}`}
                  onClick={() => setSelectedTokenIdx(idx)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-500/20 border-indigo-400 text-white shadow-lg' 
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono text-indigo-300">
                      Token [{idx}]: "{token}"
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {activeTab === 'query' ? `q_${idx}` : activeTab === 'key' ? `k_${idx}` : `v_${idx}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {vec.map((val, dIdx) => (
                      <div key={dIdx} className="flex flex-col items-center bg-slate-950 p-1.5 rounded border border-slate-800 text-center">
                        <span className="text-[8px] text-slate-500 font-mono">d{dIdx}</span>
                        <span className={`text-[10px] font-mono font-semibold ${val > 0.5 ? 'text-emerald-400' : val < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                          {val.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
