import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hyperparameters, Mode, DataSource } from '../../types';
import { PREDEFINED_PROMPTS } from '../../lib/prompts';
import { TransformerDataIngestion } from './TransformerDataIngestion';
import { TransformerConceptA } from './TransformerConceptA';
import { TransformerConceptB } from './TransformerConceptB';
import { TransformerGuideModal } from './TransformerGuideModal';
import { Compass, Layers, BookOpen } from 'lucide-react';

interface TransformerVisualizerProps {
  hyperparams: Hyperparameters;
  step: number;
  mode: Mode;
  dataSource: DataSource;
}

type ConceptView = 'concept_a' | 'concept_b';

export const TransformerVisualizer: React.FC<TransformerVisualizerProps> = ({ 
  hyperparams, 
  step, 
  mode, 
  dataSource 
}) => {
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
  const [showIngestion, setShowIngestion] = useState(true);
  const [selectedConcept, setSelectedConcept] = useState<ConceptView>('concept_a');
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Re-run ingestion when dataSource or prompt changes
  useEffect(() => {
    setShowIngestion(true);
  }, [selectedPromptIdx, dataSource]);

  const activePrompt = dataSource === 'Text Prompt' ? PREDEFINED_PROMPTS[selectedPromptIdx] : null;
  
  const defaultTextForSource = useMemo(() => {
    if (dataSource?.includes('IMDB')) return "The acting was superb and heartwarming";
    if (dataSource?.includes('Stock')) return "142.50 144.20 143.80 146.10 148.90";
    if (dataSource?.includes('Translation')) return "The quick brown fox jumps over dog";
    return "The bank of the river overflowed";
  }, [dataSource]);

  const inputText = dataSource === 'Text Prompt' ? activePrompt!.prompt : defaultTextForSource;

  const baseTokens = useMemo(() => {
    return inputText.trim().split(/\s+/).filter(Boolean);
  }, [inputText]);

  const isGeneratingCycle = mode === 'Inference' && dataSource === 'Text Prompt';
  
  const tokens = useMemo(() => {
    if (isGeneratingCycle && activePrompt) {
      return [...baseTokens, activePrompt.next];
    }
    return baseTokens;
  }, [baseTokens, isGeneratingCycle, activePrompt]);

  return (
    <div className="w-full min-h-full flex flex-col items-center justify-start p-4 relative bg-slate-950 gap-6 pb-28">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-15 pointer-events-none" />

      {/* Ingestion Animation */}
      <AnimatePresence>
        {showIngestion && (
          <TransformerDataIngestion 
            tokens={tokens} 
            onComplete={() => setShowIngestion(false)} 
          />
        )}
      </AnimatePresence>

      {/* Top Controls Header: Concept Switcher + Input Selector */}
      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 z-30">
        
        {/* Concept Switcher Segmented Control */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Select Educational Concept to Compare:
            </span>
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSelectedConcept('concept_a')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedConcept === 'concept_a'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Concept 1: Q, K, V & Attention Heatmap</span>
              </button>

              <button
                onClick={() => setSelectedConcept('concept_b')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedConcept === 'concept_b'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Concept 2: Full Architecture Flow</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowGuideModal(true)}
            className="sm:self-end px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-2 text-xs font-semibold transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>📖 Guide & Walkthrough</span>
          </button>
        </div>

        {/* Input Selector / Source info */}
        <div className="flex flex-col items-start md:items-end gap-1 w-full md:w-auto">
          {dataSource === 'Text Prompt' ? (
            <>
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Active Prompt
              </label>
              <select
                value={selectedPromptIdx}
                onChange={(e) => setSelectedPromptIdx(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 max-w-[280px] shadow-sm cursor-pointer truncate"
              >
                {PREDEFINED_PROMPTS.map((p, idx) => (
                  <option key={idx} value={idx}>{p.prompt}</option>
                ))}
              </select>
            </>
          ) : (
            <div className="flex flex-col items-start md:items-end">
              <span className="text-[10px] text-slate-400 font-mono">Dataset Stream</span>
              <span className="text-xs text-indigo-300 font-mono font-medium truncate max-w-[280px]">
                "{inputText}"
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Concept Visualization Canvas */}
      <div className="w-full flex justify-center z-20 pb-8">
        <AnimatePresence mode="wait">
          {selectedConcept === 'concept_a' ? (
            <motion.div
              key="concept_a"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="w-full flex justify-center"
            >
              <TransformerConceptA
                tokens={tokens}
                mode={mode}
                step={step}
                failureMode={hyperparams.failureMode}
                dataSource={dataSource}
                attentionHeads={hyperparams.attentionHeads || 2}
              />
            </motion.div>
          ) : (
            <motion.div
              key="concept_b"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="w-full flex justify-center"
            >
              <TransformerConceptB
                tokens={tokens}
                mode={mode}
                step={step}
                failureMode={hyperparams.failureMode}
                dataSource={dataSource}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Guide & Walkthrough Modal */}
      {showGuideModal && (
        <TransformerGuideModal
          onClose={() => setShowGuideModal(false)}
          onSelectConcept={(c) => setSelectedConcept(c)}
        />
      )}

    </div>
  );
};
