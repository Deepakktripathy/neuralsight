import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Search,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingDown,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Architecture } from '../types';
import {
  GENERAL_TRAINING_GLOSSARY,
  ARCHITECTURE_SPECIFIC_GLOSSARY,
  TRAINING_EXPECTATIONS,
  ARCHITECTURE_DOCS,
  GlossaryItem,
  ArchitectureDocStage,
} from '../lib/glossaryData';
import { ARCHITECTURE_METADATA } from '../lib/architectureConfig';
import { MathFormula } from './MathFormula';

interface GlossaryPanelProps {
  onClose: () => void;
  architecture?: Architecture | string;
  initialTab?: 'docs' | 'tldr' | 'glossary';
}

export const GlossaryPanel: React.FC<GlossaryPanelProps> = ({
  onClose,
  architecture = 'CNN',
  initialTab = 'docs',
}) => {
  const currentArch = (architecture as Architecture) || 'CNN';
  const meta = ARCHITECTURE_METADATA[currentArch];

  const [activeTab, setActiveTab] = useState<'docs' | 'tldr' | 'glossary'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [glossaryScope, setGlossaryScope] = useState<'all' | 'specific' | 'general'>('all');

  const archDocs: ArchitectureDocStage[] = useMemo(() => {
    return ARCHITECTURE_DOCS[currentArch] || ARCHITECTURE_DOCS['Standard NN'];
  }, [currentArch]);

  const specificTerms: Record<string, GlossaryItem> = useMemo(() => {
    return (ARCHITECTURE_SPECIFIC_GLOSSARY[currentArch] as Record<string, GlossaryItem>) || {};
  }, [currentArch]);

  const generalTerms: Record<string, GlossaryItem> = GENERAL_TRAINING_GLOSSARY;
  const trainingExpectation = TRAINING_EXPECTATIONS[currentArch] || TRAINING_EXPECTATIONS['CNN'];

  // Filtered terms for Glossary tab
  const displayedTerms = useMemo(() => {
    let list: GlossaryItem[] = [];
    if (glossaryScope === 'all') {
      list = [...Object.values(specificTerms), ...Object.values(generalTerms)];
    } else if (glossaryScope === 'specific') {
      list = Object.values(specificTerms);
    } else {
      list = Object.values(generalTerms);
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.formula && item.formula.toLowerCase().includes(q))
    );
  }, [specificTerms, generalTerms, glossaryScope, searchQuery]);

  return (
    <>
      {/* Dimmed backdrop for click-outside dismissal */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Slide-Out Drawer */}
      <aside
        className="fixed inset-y-0 right-0 w-full sm:w-[500px] lg:w-[540px] max-w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-250 font-sans text-slate-100 select-text"
        role="dialog"
        aria-label="Training Documentation & Architecture Guide"
      >
        {/* Header Section */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-400 block">
                  Training Companion & Docs
                </span>
                <h3 className="text-sm font-bold text-white truncate">
                  {meta?.title || currentArch}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Close training guide"
              title="Close guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Symmetrical 3-Tab Segmented Switcher */}
          <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('docs')}
              className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'docs'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Architecture Docs</span>
            </button>

            <button
              onClick={() => setActiveTab('tldr')}
              className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'tldr'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Training TLDR</span>
            </button>

            <button
              onClick={() => setActiveTab('glossary')}
              className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'glossary'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Glossary</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: ARCHITECTURE DOCS */}
          {activeTab === 'docs' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Architecture Overview Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold block mb-1">
                  Architecture Overview
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {meta?.summary || 'Deep learning neural network architecture with interactive parameter exploration and real-time visualization.'}
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  {meta?.domainTag && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {meta.domainTag}
                    </span>
                  )}
                  {meta?.keyMechanism && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                      {meta.keyMechanism}
                    </span>
                  )}
                </div>
              </div>

              {/* Step-by-Step Architecture Pipeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-0.5">
                  <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
                    Pipeline Stages & Mathematical Mechanics
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {archDocs.length} Stages
                  </span>
                </div>

                {archDocs.map((stage) => (
                  <div
                    key={stage.step}
                    className="p-4 rounded-xl bg-slate-950/30 border border-slate-800/80 hover:border-slate-700/80 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                        {stage.step}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-100 truncate">
                          {stage.title}
                        </h4>
                        {stage.subtitle && (
                          <span className="text-[10px] font-mono text-indigo-300 block">
                            {stage.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {stage.body}
                    </p>

                    {stage.formula && (
                      <MathFormula formula={stage.formula} />
                    )}

                    {stage.highlights && stage.highlights.length > 0 && (
                      <ul className="space-y-1 pt-1 border-t border-slate-800/60">
                        {stage.highlights.map((h, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                            <span className="text-emerald-400 shrink-0">›</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TRAINING TLDR NOTES */}
          {activeTab === 'tldr' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Architecture TLDR Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {trainingExpectation.title}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {trainingExpectation.summary}
                </p>
              </div>

              {/* Forward vs. Backprop Concept */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-400 text-[11px] uppercase tracking-wider mb-1">
                    <ArrowRight className="w-3 h-3" /> Forward Pass
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Tensors stream from input to output calculating layer activations and loss.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 font-bold text-rose-400 text-[11px] uppercase tracking-wider mb-1">
                    <TrendingDown className="w-3 h-3" /> Backpropagation
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Error gradients propagate backward via chain rule, updating layer weights.
                  </p>
                </div>
              </div>

              {/* Training Phases */}
              <div className="space-y-2.5">
                <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] font-mono block px-0.5">
                  Training Phases & Visual Cues
                </span>

                {trainingExpectation.phases.map((ph, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/30 border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {ph.phase}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block mb-0.5">
                          Metrics Pattern
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {ph.metricsExpectation}
                        </p>
                      </div>

                      <div className="pt-1 border-t border-slate-800/60">
                        <span className="text-[10px] uppercase font-mono font-semibold text-emerald-400 block mb-0.5">
                          What to Watch on Canvas
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {ph.visualWhatToWatch}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Red Flags & Watchouts */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs font-mono uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Key Watchouts & Red Flags
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {trainingExpectation.keyWatchouts.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold shrink-0">!</span>
                      <span className="leading-relaxed">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: GLOSSARY CONTEXT */}
          {activeTab === 'glossary' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search terminology, definitions, formulas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8.5 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-500 hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Scope Switcher */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setGlossaryScope('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                    glossaryScope === 'all'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  All Terms
                </button>
                <button
                  onClick={() => setGlossaryScope('specific')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                    glossaryScope === 'specific'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {currentArch} Specific
                </button>
                <button
                  onClick={() => setGlossaryScope('general')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                    glossaryScope === 'general'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Fundamentals
                </button>
              </div>

              {/* Term Cards List */}
              <div className="space-y-2.5">
                {displayedTerms.length > 0 ? (
                  displayedTerms.map((item) => (
                    <div
                      key={item.term}
                      className="p-3.5 rounded-xl bg-slate-950/30 border border-slate-800/80 hover:border-slate-700/80 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-100">
                          {item.term}
                        </h4>
                        {item.category && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 shrink-0">
                            {item.category}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.definition}
                      </p>

                      {item.formula && (
                        <MathFormula formula={item.formula} className="mt-2" />
                      )}

                      {item.tldrCues && item.tldrCues.length > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-slate-800/60">
                          <span className="text-[10px] uppercase font-mono font-semibold text-emerald-400 block mb-1">
                            Live Training Cue:
                          </span>
                          <ul className="space-y-0.5">
                            {item.tldrCues.map((cue, idx) => (
                              <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                                <span className="text-emerald-400 shrink-0">›</span>
                                <span>{cue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center rounded-xl bg-slate-950/20 border border-slate-800/60 text-slate-500 space-y-2">
                    <Search className="w-6 h-6 mx-auto text-slate-600" />
                    <p className="text-xs">No matching glossary terms found.</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      Clear search query
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="py-2.5 px-4 sm:px-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-500 shrink-0 font-mono">
          <span className="text-[11px]">
            {activeTab === 'docs'
              ? `${archDocs.length} Architecture Stages`
              : activeTab === 'tldr'
              ? `${trainingExpectation.phases.length} Training Phases`
              : `${displayedTerms.length} Terms Available`}
          </span>
          <span className="text-[10px] text-slate-600 uppercase tracking-wider font-mono">
            Training Companion
          </span>
        </div>
      </aside>
    </>
  );
};

// Re-export with alias for semantic clarity
export { GlossaryPanel as TrainingDocsDrawer };
