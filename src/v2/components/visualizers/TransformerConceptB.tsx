import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, ArrowUp, Layers, Activity, Sparkles } from 'lucide-react';
import { Mode, FailureMode } from '../../types';

interface TransformerConceptBProps {
  tokens: string[];
  mode: Mode;
  step: number;
  failureMode?: FailureMode;
  dataSource?: string;
}

type BlockStage = 0 | 1 | 2 | 3 | 4 | 5; // 0: Input+PE, 1: MultiHead, 2: Add&Norm 1, 3: FFN, 4: Add&Norm 2, 5: Softmax Output

export const TransformerConceptB: React.FC<TransformerConceptBProps> = ({
  tokens,
  mode,
  step,
  failureMode,
  dataSource
}) => {
  const [activeStage, setActiveStage] = useState<BlockStage>(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedLayerInfo, setSelectedLayerInfo] = useState<string>('mha');

  // Candidate next-token predictions based on prompt / dataset
  const candidatePredictions = useMemo(() => {
    if (dataSource?.includes('IMDB')) {
      return [
        { token: 'Positive (Sentiment)', prob: 0.942, color: 'emerald' },
        { token: 'Negative (Sentiment)', prob: 0.058, color: 'rose' },
        { token: 'Neutral (Ambiguous)', prob: 0.000, color: 'slate' }
      ];
    }
    if (dataSource?.includes('Stock')) {
      return [
        { token: '149.80 (+1.8%)', prob: 0.62, color: 'emerald' },
        { token: '146.50 (-0.5%)', prob: 0.24, color: 'amber' },
        { token: '144.10 (-2.1%)', prob: 0.14, color: 'rose' }
      ];
    }
    // Default next-word completions
    return [
      { token: 'performance', prob: 0.72, color: 'emerald' },
      { token: 'direction', prob: 0.14, color: 'indigo' },
      { token: 'cinematography', prob: 0.08, color: 'indigo' },
      { token: 'script', prob: 0.04, color: 'slate' },
      { token: 'score', prob: 0.02, color: 'slate' }
    ];
  }, [dataSource]);

  // Auto-play cycling through architecture stages
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStage((prev) => ((prev + 1) % 6) as BlockStage);
    }, 2200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col gap-5">
      
      {/* Concept B Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Concept B: Full Transformer Block Flow
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                Encoder / Decoder Block Anatomy
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Follow tokens bottom-to-top through Positional Encoding, Multi-Head Attention, Residuals, FFN, and Softmax
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors border border-slate-700"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Flow' : 'Play Flow'}</span>
          </button>
          <button
            onClick={() => setActiveStage(0)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700"
            title="Reset to Input"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Step Navigator */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { id: 0, label: '1. Input & Pos. Enc.', key: 'pe' },
          { id: 1, label: '2. Multi-Head Attn', key: 'mha' },
          { id: 2, label: '3. Add & Norm (1)', key: 'norm1' },
          { id: 3, label: '4. Feed-Forward MLP', key: 'ffn' },
          { id: 4, label: '5. Add & Norm (2)', key: 'norm2' },
          { id: 5, label: '6. Next-Token Output', key: 'output' }
        ].map((st) => {
          const isActive = activeStage === st.id;
          return (
            <button
              key={st.id}
              onClick={() => {
                setActiveStage(st.id as BlockStage);
                setSelectedLayerInfo(st.key);
                setIsPlaying(false);
              }}
              className={`p-2 rounded-lg border text-left transition-all ${
                isActive
                  ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-emerald-400">Stage {st.id + 1}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
              </div>
              <span className="text-xs font-semibold block leading-tight">{st.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Architecture Diagram: Vertical Pipeline Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Architecture Pipeline Visualizer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 p-4 sm:p-6 rounded-xl border border-slate-800 relative flex flex-col justify-between min-h-[580px] overflow-hidden">
          
          {/* Glowing Background Pulse */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none" />

          {/* Top Stage: 6. Output Logits & Softmax */}
          <div 
            onClick={() => setSelectedLayerInfo('output')}
            className={`cursor-pointer rounded-xl p-3 border transition-all relative ${
              activeStage === 5 
                ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]' 
                : 'bg-slate-900/60 border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {'Next-Token Distribution: P(w_next) = Softmax(z / T)'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">Linear Head + Softmax</span>
            </div>

            {/* Candidate prediction bars */}
            <div className="space-y-1.5">
              {candidatePredictions.map((cand) => (
                <div key={cand.token} className="flex items-center gap-2 text-xs font-mono">
                  <span className="w-36 truncate text-slate-300 font-semibold">{cand.token}</span>
                  <div className="flex-1 bg-slate-800 h-3 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${cand.color === 'emerald' ? 'bg-emerald-500' : cand.color === 'rose' ? 'bg-rose-500' : 'bg-indigo-500'}`}
                      animate={{ width: `${cand.prob * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <span className="w-12 text-right text-[10px] font-bold text-slate-300">
                    {(cand.prob * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upward flow connector */}
          <div className="w-full flex justify-center py-1">
            <ArrowUp className={`w-4 h-4 transition-colors ${activeStage >= 4 ? 'text-emerald-400 animate-pulse' : 'text-slate-700'}`} />
          </div>

          {/* Stage 5: Add & Norm (Residual 2) */}
          <div
            onClick={() => setSelectedLayerInfo('norm2')}
            className={`cursor-pointer rounded-lg p-2.5 border text-center transition-all ${
              activeStage === 4 
                ? 'bg-indigo-950/40 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]' 
                : 'bg-slate-900/60 border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-300">Add & Norm (2)</span>
              <span className="text-[10px] font-mono text-slate-400">
                {'LayerNorm(x + FFN(x))'}
              </span>
            </div>
          </div>

          {/* Upward flow connector with Residual Bypass Wire */}
          <div className="w-full flex justify-center py-1 relative">
            <ArrowUp className={`w-4 h-4 transition-colors ${activeStage >= 3 ? 'text-emerald-400 animate-pulse' : 'text-slate-700'}`} />
            {/* Residual skip wire graphic */}
            <div className="absolute right-3 top-[-10px] bottom-[-10px] w-6 border-r-2 border-dashed border-indigo-500/40 pointer-events-none rounded-r-lg flex items-center justify-end">
              <span className="text-[8px] font-mono text-indigo-400 bg-slate-950 px-1 py-0.5 rounded border border-indigo-500/30">Skip Wire</span>
            </div>
          </div>

          {/* Stage 4: Position-Wise Feed-Forward Network (FFN / MLP) */}
          <div
            onClick={() => setSelectedLayerInfo('ffn')}
            className={`cursor-pointer rounded-xl p-3 border transition-all ${
              activeStage === 3 
                ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]' 
                : 'bg-slate-900/60 border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-300">
                Feed-Forward Network (FFN / MLP)
              </span>
              <span className="text-[10px] font-mono text-amber-400">
                {'max(0, xW_1 + b_1)W_2 + b_2'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                <span className="text-slate-500 block">Linear 1</span>
                <span className="text-slate-200">512 → 2048</span>
              </div>
              <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                <span className="text-slate-500 block">Activation</span>
                <span className="text-amber-300 font-bold">GELU / ReLU</span>
              </div>
              <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                <span className="text-slate-500 block">Linear 2</span>
                <span className="text-slate-200">2048 → 512</span>
              </div>
            </div>
          </div>

          {/* Upward flow connector */}
          <div className="w-full flex justify-center py-1">
            <ArrowUp className={`w-4 h-4 transition-colors ${activeStage >= 2 ? 'text-emerald-400 animate-pulse' : 'text-slate-700'}`} />
          </div>

          {/* Stage 3: Add & Norm (Residual 1) */}
          <div
            onClick={() => setSelectedLayerInfo('norm1')}
            className={`cursor-pointer rounded-lg p-2.5 border text-center transition-all ${
              activeStage === 2 
                ? 'bg-indigo-950/40 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]' 
                : 'bg-slate-900/60 border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-300">Add & Norm (1)</span>
              <span className="text-[10px] font-mono text-slate-400">
                {'LayerNorm(x + MultiHead(x))'}
              </span>
            </div>
          </div>

          {/* Upward flow connector with Residual Bypass Wire */}
          <div className="w-full flex justify-center py-1 relative">
            <ArrowUp className={`w-4 h-4 transition-colors ${activeStage >= 1 ? 'text-emerald-400 animate-pulse' : 'text-slate-700'}`} />
            {/* Residual skip wire graphic */}
            <div className="absolute left-3 top-[-10px] bottom-[-10px] w-6 border-l-2 border-dashed border-indigo-500/40 pointer-events-none rounded-l-lg flex items-center justify-start">
              <span className="text-[8px] font-mono text-indigo-400 bg-slate-950 px-1 py-0.5 rounded border border-indigo-500/30">Skip Wire</span>
            </div>
          </div>

          {/* Stage 2: Multi-Head Self-Attention */}
          <div
            onClick={() => setSelectedLayerInfo('mha')}
            className={`cursor-pointer rounded-xl p-3 border transition-all ${
              activeStage === 1 
                ? 'bg-indigo-950/50 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                : 'bg-slate-900/60 border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-300">
                {'Multi-Head Self-Attention (h = 4)'}
              </span>
              <span className="text-[10px] font-mono text-indigo-400">
                {'Concat(head_1, ..., head_4) · W^O'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((h) => (
                <div key={h} className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-indigo-400 block font-semibold">Head {h}</span>
                  <span className="text-[8px] text-slate-500">Softmax(QKᵀ/√d)V</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upward flow connector */}
          <div className="w-full flex justify-center py-1">
            <ArrowUp className={`w-4 h-4 transition-colors ${activeStage >= 0 ? 'text-emerald-400 animate-pulse' : 'text-slate-700'}`} />
          </div>

          {/* Stage 1 (Bottom): Input Tokens + Sinusoidal Positional Encoding */}
          <div
            onClick={() => setSelectedLayerInfo('pe')}
            className={`cursor-pointer rounded-xl p-3 border transition-all ${
              activeStage === 0 
                ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]' 
                : 'bg-slate-900/60 border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-300">
                {'Input Tokens + Positional Encoding (sin / cos)'}
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {'x_i = Embedding(w_i) + PE(i)'}
              </span>
            </div>

            {/* Token chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {tokens.map((tok, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-200 shrink-0 flex items-center gap-1"
                >
                  <span className="text-[9px] text-cyan-400 font-bold">{idx}:</span>
                  <span>{tok}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Detailed Layer Inspector / Pedagogical Deep Dive (4 cols) */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between text-left">
          
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                Architectural Block Inspector
              </h4>
            </div>

            {/* Dynamic Content based on selected layer */}
            {selectedLayerInfo === 'pe' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">
                    {'Positional Encoding (sin / cos)'}
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Unlike RNNs, Transformers process all words in parallel with no inherent notion of sequence order. Positional encodings add sinusoidal frequency signals so the network knows word 0 comes before word 1!
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1">
                  <div>{'PE(pos, 2i) = sin(pos / 10000^(2i/d))'}</div>
                  <div>{'PE(pos, 2i+1) = cos(pos / 10000^(2i/d))'}</div>
                </div>
              </div>
            )}

            {selectedLayerInfo === 'mha' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold block mb-1">
                    Multi-Head Self-Attention
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Multiple parallel attention heads allow the model to jointly attend to information from different representation subspaces at different positions (e.g. one head tracks syntax, another tracks sentiment, another tracks long-range coreference).
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] text-indigo-300">
                  {'MultiHead(Q, K, V) = Concat(head_1, ..., head_h) · W^O'}
                </div>
              </div>
            )}

            {(selectedLayerInfo === 'norm1' || selectedLayerInfo === 'norm2') && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold block mb-1">
                    Residual Connection + LayerNorm
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    The skip wire adds the input directly to the block output. This prevents vanishing gradients in deep networks (like 12 to 96 layers) and guarantees gradient highways during backpropagation.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300">
                  {'LayerNorm(z) = ((z - μ) / √(σ² + ε)) · γ + β'}
                </div>
              </div>
            )}

            {selectedLayerInfo === 'ffn' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mb-1">
                    Feed-Forward Network (FFN)
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    While attention mixes tokens across time, the FFN operates on each position independently. It projects embeddings into a high-dimensional intermediate space (typically 4x d_model), applies non-linear activation (GELU), and projects back.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] text-amber-300">
                  {'FFN(x) = max(0, xW_1 + b_1)W_2 + b_2'}
                </div>
              </div>
            )}

            {selectedLayerInfo === 'output' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">
                    Linear Head & Softmax Probability
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    The final hidden states are projected onto the full vocabulary size |V| via an un-embedded projection matrix. Softmax transforms raw logits into a rigorous normalized probability distribution over candidate words.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] text-emerald-300">
                  {'P(w_i) = exp(z_i / T) / Σ_j exp(z_j / T)'}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400">
            Click any block on the left to inspect its parameters, dimensions, and equations.
          </div>
        </div>

      </div>

    </div>
  );
};
