import React, { useState } from 'react';
import { X, BookOpen, Layers, Compass, ArrowRight, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

const concept1Img = '/src/assets/images/transformer_concept1_guide_1788703214233.jpg';
const concept2Img = '/src/assets/images/transformer_concept2_guide_1788703229127.jpg';

interface TransformerGuideModalProps {
  onClose: () => void;
  onSelectConcept?: (concept: 'concept_a' | 'concept_b') => void;
}

type DatasetTab = 'text_prompt' | 'imdb' | 'stock' | 'translation' | 'failure_mode';

export const TransformerGuideModal: React.FC<TransformerGuideModalProps> = ({ onClose, onSelectConcept }) => {
  const [activeDatasetTab, setActiveDatasetTab] = useState<DatasetTab>('text_prompt');
  const [activeViewTab, setActiveViewTab] = useState<'concepts' | 'scenarios' | 'navigation'>('concepts');

  React.useEffect(() => {
    const pill = document.getElementById('step-status-pill');
    if (pill) {
      const prev = pill.style.display;
      pill.style.display = 'none';
      return () => {
        pill.style.display = prev;
      };
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Transformer Pedagogical Guide: Concept 1 vs Concept 2
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Documentation
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                How each visualization unmasks attention mathematics and vertical architecture across real dataset scenarios
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/40 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveViewTab('concepts')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeViewTab === 'concepts'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            1. The Two Mental Models (Concept A vs B)
          </button>

          <button
            onClick={() => setActiveViewTab('scenarios')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeViewTab === 'scenarios'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            2. Dataset Scenarios & Educational Insights
          </button>

          <button
            onClick={() => setActiveViewTab('navigation')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeViewTab === 'navigation'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            3. Step-by-Step Navigation Cheatsheet
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">

          {/* TAB 1: CONCEPTS OVERVIEW */}
          {activeViewTab === 'concepts' && (
            <div className="space-y-6">
              
              <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4 text-xs text-indigo-200 leading-relaxed">
                <strong className="text-white block text-sm mb-1">Why did we build two complementary concepts?</strong>
                A Transformer is notoriously hard to teach with just one diagram. Learners need to understand two distinct scales:
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300">
                  <li><strong className="text-indigo-300">Micro-Level (Concept 1):</strong> How two specific words interact mathematically via Query, Key, and Value dot products {'(Q · K^T / √d)'}.</li>
                  <li><strong className="text-macro text-emerald-300 font-bold">Macro-Level (Concept 2):</strong> How the entire token sequence flows vertically through Positional Encodings, Multi-Head Attention, Residual skip connections, and Feed-Forward Networks to emit next-token probabilities.</li>
                </ul>
              </div>

              {/* Side by side comparison cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Concept A Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold font-mono">
                        Concept 1 (A): Q, K, V & Attention Matrix
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Micro Inspection</span>
                    </div>

                    <div className="rounded-lg overflow-hidden border border-slate-800 relative group aspect-video bg-slate-900 flex items-center justify-center">
                      <img 
                        src={concept1Img} 
                        alt="Concept 1 Self-Attention Heatmap" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <h4 className="font-semibold text-white text-sm">The Fundamental Attention Heatmap</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Displays the full $N \times N$ attention weight matrix. Shows how each row token projects a <strong>Query (Q)</strong> vector, compares against all column <strong>Key (K)</strong> vectors, and applies <strong>Softmax</strong> to produce weights that blend <strong>Value (V)</strong> vectors.
                    </p>

                    <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-[11px] font-mono text-slate-300">
                      <span className="text-indigo-400">Core Equation:</span> Attention(Q, K, V) = softmax(Q·K^T / √d) · V
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectConcept?.('concept_a');
                      onClose();
                    }}
                    className="mt-4 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Switch to Concept 1 in View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Concept B Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                        Concept 2 (B): Full Block Architecture
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Macro Pipeline</span>
                    </div>

                    <div className="rounded-lg overflow-hidden border border-slate-800 relative group aspect-video bg-slate-900 flex items-center justify-center">
                      <img 
                        src={concept2Img} 
                        alt="Concept 2 Full Transformer Block Architecture" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <h4 className="font-semibold text-white text-sm">Vertical End-to-End Execution Flow</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Follows tokens from input embedding through sinusoidal <strong>Positional Encoding</strong>, <strong>Multi-Head Attention (Heads 1-4)</strong>, <strong>Residual Add & Norm</strong> bypasses, <strong>Feed-Forward (FFN)</strong> projections, and output next-token distribution bars.
                    </p>

                    <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-[11px] font-mono text-slate-300">
                      <span className="text-emerald-400">Key Feature:</span> Click heads (1-4) to see distinct attention patterns
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectConcept?.('concept_b');
                      onClose();
                    }}
                    className="mt-4 w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Switch to Concept 2 in View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: DATASET SCENARIOS */}
          {activeViewTab === 'scenarios' && (
            <div className="space-y-4">
              
              {/* Dataset Pills */}
              <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800">
                {[
                  { id: 'text_prompt', label: '1. Text Prompt (Polysemy & Next-Word)' },
                  { id: 'imdb', label: '2. IMDB Reviews (Sentiment Focus)' },
                  { id: 'stock', label: '3. Stock Prices (Time-Series)' },
                  { id: 'translation', label: '4. Translation (Bilingual Alignment)' },
                  { id: 'failure_mode', label: '5. Failure Mode: Attention Collapse' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDatasetTab(tab.id as DatasetTab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeDatasetTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scenario 1: Text Prompt */}
              {activeDatasetTab === 'text_prompt' && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      Scenario 1: Text Prompt — Solving Ambiguity & Predicting Next Tokens
                    </h4>
                    <span className="text-[11px] font-mono text-indigo-300">Prompt: "The bank of the river overflowed"</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>The Educational Challenge:</strong> Traditional RNNs struggled with words having multiple meanings (polysemy), like "bank" (a financial institution vs a river slope). How does a Transformer determine which meaning applies?
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
                      <strong className="text-indigo-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                        In Concept 1 (Attention Heatmap):
                      </strong>
                      <p className="text-slate-400 leading-relaxed">
                        Hover over the word <strong>"bank"</strong> in the matrix. Look at row <strong>"bank"</strong>: its Query vector attends heavily to column <strong>"river"</strong> (0.68) and <strong>"overflowed"</strong> (0.75). The dot product produces a blended Value vector that encodes "riverbank", disambiguating it instantly!
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
                      <strong className="text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        In Concept 2 (Full Architecture):
                      </strong>
                      <p className="text-slate-400 leading-relaxed">
                        Watch tokens enter with sinusoidal Positional Encoding waves (position 0 to 5). In the top Softmax projection, see the candidate next words: <strong>"yesterday" (72%)</strong>, <strong>"rapidly" (18%)</strong>. Switch between <strong>Head 1</strong> (syntactic subject-verb) and <strong>Head 2</strong> (semantic context) to see specialized attention maps!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Scenario 2: IMDB */}
              {activeDatasetTab === 'imdb' && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      Scenario 2: IMDB Movie Reviews — Sentiment Salience & Routing
                    </h4>
                    <span className="text-[11px] font-mono text-indigo-300">Review: "The acting was superb and heartwarming"</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>The Educational Challenge:</strong> For sentiment classification, filler words like "The", "was", "and" carry zero emotional signal. How does the model focus only on decisive sentiment adjectives and link them to their target?
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
                      <strong className="text-indigo-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                        In Concept 1 (Attention Heatmap):
                      </strong>
                      <p className="text-slate-400 leading-relaxed">
                        Notice the intense glowing diagonal and cross-links between <strong>"acting"</strong>, <strong>"superb"</strong>, and <strong>"heartwarming"</strong> (weights {'>'} 0.70), while stop-words like "was" have negligible attention weights ({'<'} 0.12). The matrix clearly demonstrates <em>feature saliency routing</em>.
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
                      <strong className="text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        In Concept 2 (Full Architecture):
                      </strong>
                      <p className="text-slate-400 leading-relaxed">
                        At the top output layer, the final representation is pooled into classification logits: <strong>Positive Review (94.2%)</strong> vs <strong>Negative Review (5.8%)</strong>. The Residual connection ensures the raw adjective embeddings aren't crushed during deep feed-forward projection.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Scenario 3: Stock Prices */}
              {activeDatasetTab === 'stock' && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      Scenario 3: Stock Prices — Time-Series Attention & Temporal Ordering
                    </h4>
                    <span className="text-[11px] font-mono text-indigo-300">Prices: "142.50 144.20 143.80 146.10 148.90"</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>The Educational Challenge:</strong> Why use Transformers for numbers? Because unlike CNNs (which only see local windows) or RNNs (which forget distant trends), Attention allows step $T=5$ (148.90) to selectively attend to key breakout moments anywhere in the history!
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
                      <strong className="text-indigo-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                        In Concept 1 (Attention Heatmap):
                      </strong>
                      <p className="text-slate-400 leading-relaxed">
                        Look at the row for the latest price <strong>148.90</strong>. It assigns high attention to the prior resistance breakout at <strong>146.10</strong> and the base at <strong>142.50</strong>, effectively identifying the support and trendline mathematically!
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
                      <strong className="text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        In Concept 2 (Full Architecture):
                      </strong>
                      <p className="text-slate-400 leading-relaxed">
                        Notice the <strong>Positional Encodings</strong> at the bottom! Without positional encodings, a Transformer treats numbers as an unordered "bag of scalars" where order is lost. The sinusoidal frequencies provide time stamps so the network knows 148.90 happened <em>after</em> 142.50.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Scenario 4: Translation */}
              {activeDatasetTab === 'translation' && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      Scenario 4: Language Translation — Cross-Token Syntax & Word Reordering
                    </h4>
                    <span className="text-[11px] font-mono text-indigo-300">Source: "The quick brown fox jumps over dog"</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>The Educational Challenge:</strong> Languages do not share grammatical word orders (e.g. German puts verbs at the end of clauses). Self-attention allows any word to attend directly to any other word regardless of distance!
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
                      <strong className="text-indigo-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                        In Concept 1 (Attention Heatmap):
                      </strong>
                      <p className="text-slate-400 leading-relaxed">
                        Notice how adjectives like <strong>"quick"</strong> and <strong>"brown"</strong> bind tightly to the animal noun <strong>"fox"</strong>. In cross-attention, these bound representations map onto the target language compound nouns seamlessly.
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
                      <strong className="text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        In Concept 2 (Full Architecture):
                      </strong>
                      <p className="text-slate-400 leading-relaxed">
                        Cycle through <strong>Head 1, Head 2, and Head 3</strong>. Notice how Head 1 tracks immediate neighboring tokens, while Head 3 tracks long-range grammatical connections (e.g. subject <em>fox</em> $\to$ verb <em>jumps</em>).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Scenario 5: Failure Mode */}
              {activeDatasetTab === 'failure_mode' && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-rose-400 font-bold text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      Scenario 5: Failure Mode — "Attention Collapse" (Pathology Simulation)
                    </h4>
                    <span className="text-[11px] font-mono text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/40">
                      Simulated Defect
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>What is Attention Collapse?</strong> When gradients vanish or the Softmax temperature {'√(d_k)'} fails, the Query-Key dot products produce zero variance. Every token attends equally to every other token (1/N).
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-rose-900/30 space-y-2">
                      <strong className="text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        What You See in Concept 1:
                      </strong>
                      <p className="text-slate-400 leading-relaxed">
                        Every single cell in the matrix turns an identical uniform dull color with identical weights (e.g. <strong>0.17</strong>). There are no peaks, no hot spots, and no focus. The model has become functionally blind to context!
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-lg border border-rose-900/30 space-y-2">
                      <strong className="text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        What You See in Concept 2:
                      </strong>
                      <p className="text-slate-400 leading-relaxed">
                        The Multi-Head attention webs become a uniform gray blur. The final Softmax distribution collapses into flat, uniform maximum-entropy noise (all candidate tokens have identical ~16% probability).
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: STEP-BY-STEP NAVIGATION */}
          {activeViewTab === 'navigation' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">How to Navigate Through the Visualizer Step-by-Step</h4>
              
              <div className="space-y-3 text-xs">
                
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-white block">Select Your Concept at the Top</strong>
                    <span className="text-slate-400">
                      Use the top pill switcher to toggle between <strong>Concept A (Q, K, V & Attention Matrix)</strong> and <strong>Concept B (Full Architecture Flow)</strong>. This lets you inspect the same dataset sample from two complementary angles.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-white block">Switch Prompts or Datasets</strong>
                    <span className="text-slate-400">
                      In the top-right dropdown, test different prompts (e.g., polysemy <em>"The bank of the river..."</em>, storytelling <em>"The astronaut stepped onto..."</em>). Or change the <strong>Dataset</strong> dropdown in the left sidebar to <strong>IMDB Movie Reviews</strong> or <strong>Stock Price Trends</strong>.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-white block">Hover Over Matrix Cells in Concept A</strong>
                    <span className="text-slate-400">
                      In Concept A, hover your cursor over any matrix cell [i, j]. The sidebar instantly computes the exact dot product Q_i · K_j, shows the scaled division by {'√(d_k)'}, and highlights where the weight is mapped on the Softmax curve.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </div>
                  <div>
                    <strong className="text-white block">Cycle Through Attention Heads in Concept B</strong>
                    <span className="text-slate-400">
                      In Concept B, click on <strong>Head 1, Head 2, Head 3, and Head 4</strong>. Notice how Head 1 focuses on adjacent grammar, Head 2 focuses on sentiment, and Head 3 focuses on long-range dependencies. This demonstrates why Multi-Head Attention is fundamentally superior to single-head attention!
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    5
                  </div>
                  <div>
                    <strong className="text-white block">Trigger the "Attention Collapse" Failure Mode</strong>
                    <span className="text-slate-400">
                      In the left sidebar under <strong>Failure Modes</strong>, select <strong>"Attention Collapse"</strong>. Observe both Concept A and B immediately degenerate into uniform flat probabilities, providing an unmistakable visual lesson on model degeneration.
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Designed for interactive neural network pedagogy
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
