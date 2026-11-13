import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Sparkles, Layers, TrendingDown, AlertTriangle, ArrowRight, X } from 'lucide-react';
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
import { Dialog, SheetContent, SheetDescription, SheetTitle } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

interface GlossaryPanelProps {
  onClose: () => void;
  architecture?: Architecture | string;
  initialTab?: 'docs' | 'tldr' | 'glossary';
}

type PanelTab = 'docs' | 'tldr' | 'glossary';

export const GlossaryPanel: React.FC<GlossaryPanelProps> = ({
  onClose,
  architecture = 'CNN',
  initialTab = 'docs',
}) => {
  const currentArch = (architecture as Architecture) || 'CNN';
  const meta = ARCHITECTURE_METADATA[currentArch];

  const [activeTab, setActiveTab] = useState<PanelTab>(initialTab);
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        aria-describedby={undefined}
        className="font-sans text-slate-100 select-text"
      >
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as PanelTab)}
          className="flex h-full min-h-0 flex-col"
        >
          <div className="shrink-0 border-b border-slate-800 bg-slate-900/90 p-4 pr-14 sm:p-5 sm:pr-14">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="shrink-0 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <SheetDescription className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                  Training companion &amp; docs
                </SheetDescription>
                <SheetTitle className="truncate text-sm">
                  {meta?.title || currentArch}
                </SheetTitle>
              </div>
            </div>

            <TabsList>
              <TabsTrigger value="docs">
                <Layers className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Architecture</span>
              </TabsTrigger>
              <TabsTrigger value="tldr">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">TLDR</span>
              </TabsTrigger>
              <TabsTrigger value="glossary">
                <Search className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Glossary</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {/* TAB 1: ARCHITECTURE DOCS */}
            <TabsContent value="docs" className="mt-0 space-y-4">
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5">
                <span className="mb-1 block font-mono text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                  Architecture overview
                </span>
                <p className="text-xs leading-relaxed text-slate-300">
                  {meta?.summary || 'Deep learning neural network architecture with interactive parameter exploration and real-time visualization.'}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {meta?.domainTag && (
                    <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-[11px] text-indigo-300">
                      {meta.domainTag}
                    </span>
                  )}
                  {meta?.keyMechanism && (
                    <span className="rounded border border-slate-700/60 bg-slate-800/80 px-2 py-0.5 font-mono text-[11px] text-slate-300">
                      {meta.keyMechanism}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-0.5 text-xs text-slate-400">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-200">
                    Pipeline stages &amp; mechanics
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">{archDocs.length} stages</span>
                </div>

                {archDocs.map((stage) => (
                  <div
                    key={stage.step}
                    className="space-y-2.5 rounded-xl border border-slate-800/80 bg-slate-950/30 p-4 transition-colors hover:border-slate-700/80"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 font-mono text-[11px] font-bold text-indigo-400">
                        {stage.step}
                      </span>
                      <div className="min-w-0">
                        <h4 className="truncate text-xs font-bold text-slate-100">{stage.title}</h4>
                        {stage.subtitle && (
                          <span className="block font-mono text-[11px] text-indigo-300">{stage.subtitle}</span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-300">{stage.body}</p>

                    {stage.formula && <MathFormula formula={stage.formula} />}

                    {stage.highlights && stage.highlights.length > 0 && (
                      <ul className="space-y-1 border-t border-slate-800/60 pt-1">
                        {stage.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                            <span className="shrink-0 text-emerald-400">›</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 2: TRAINING TLDR NOTES */}
            <TabsContent value="tldr" className="mt-0 space-y-4">
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">{trainingExpectation.title}</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-300">{trainingExpectation.summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/30 p-3">
                  <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    <ArrowRight className="h-3 w-3" /> Forward pass
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Tensors stream from input to output calculating layer activations and loss.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/30 p-3">
                  <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-rose-400">
                    <TrendingDown className="h-3 w-3" /> Backprop
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Error gradients propagate backward via chain rule, updating layer weights.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="block px-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-200">
                  Training phases &amp; visual cues
                </span>

                {trainingExpectation.phases.map((phase, idx) => (
                  <div key={idx} className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/30 p-3.5">
                    <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-300">
                      {phase.phase}
                    </span>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="mb-0.5 block font-mono text-[11px] font-semibold uppercase text-slate-400">
                          Metrics pattern
                        </span>
                        <p className="leading-relaxed text-slate-300">{phase.metricsExpectation}</p>
                      </div>

                      <div className="border-t border-slate-800/60 pt-1">
                        <span className="mb-0.5 block font-mono text-[11px] font-semibold uppercase text-emerald-400">
                          Watch on canvas
                        </span>
                        <p className="leading-relaxed text-slate-300">{phase.visualWhatToWatch}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Watchouts &amp; red flags
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {trainingExpectation.keyWatchouts.map((watchout, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="shrink-0 font-bold text-amber-400">!</span>
                      <span className="leading-relaxed">{watchout}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            {/* TAB 3: GLOSSARY CONTEXT */}
            <TabsContent value="glossary" className="mt-0 space-y-3.5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search terminology, definitions, formulas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-8.5 pr-8 text-xs text-slate-200 transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-slate-500 hover:text-white"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {([
                  ['all', 'All terms'],
                  ['specific', `${currentArch} specific`],
                  ['general', 'Fundamentals'],
                ] as const).map(([scope, label]) => (
                  <button
                    key={scope}
                    onClick={() => setGlossaryScope(scope)}
                    aria-pressed={glossaryScope === scope}
                    className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] transition-colors ${
                      glossaryScope === scope
                        ? 'bg-indigo-600 font-medium text-white'
                        : 'border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {displayedTerms.length > 0 ? (
                  displayedTerms.map((item) => (
                    <div
                      key={item.term}
                      className="space-y-1.5 rounded-xl border border-slate-800/80 bg-slate-950/30 p-3.5 transition-colors hover:border-slate-700/80"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-100">{item.term}</h4>
                        {item.category && (
                          <span className="shrink-0 rounded border border-slate-700/60 bg-slate-800/80 px-2 py-0.5 font-mono text-[11px] text-slate-400">
                            {item.category}
                          </span>
                        )}
                      </div>

                      <p className="text-xs leading-relaxed text-slate-300">{item.definition}</p>

                      {item.formula && <MathFormula formula={item.formula} className="mt-2" />}

                      {item.tldrCues && item.tldrCues.length > 0 && (
                        <div className="mt-2 border-t border-slate-800/60 pt-1.5">
                          <span className="mb-1 block font-mono text-[11px] font-semibold uppercase text-emerald-400">
                            Live training cue
                          </span>
                          <ul className="space-y-0.5">
                            {item.tldrCues.map((cue, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                                <span className="shrink-0 text-emerald-400">›</span>
                                <span>{cue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="space-y-2 rounded-xl border border-slate-800/60 bg-slate-950/20 p-8 text-center text-slate-500">
                    <Search className="mx-auto h-6 w-6 text-slate-600" />
                    <p className="text-xs">No matching glossary terms found.</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="cursor-pointer text-xs text-indigo-400 underline hover:text-indigo-300"
                    >
                      Clear search query
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-slate-800 bg-slate-900/90 px-4 py-2.5 font-mono text-xs text-slate-500 sm:px-5">
            <span className="text-[11px]">
              {activeTab === 'docs'
                ? `${archDocs.length} architecture stages`
                : activeTab === 'tldr'
                ? `${trainingExpectation.phases.length} training phases`
                : `${displayedTerms.length} terms available`}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-600">
              Training companion
            </span>
          </div>
        </Tabs>
      </SheetContent>
    </Dialog>
  );
};

// Re-export with alias for semantic clarity
export { GlossaryPanel as TrainingDocsDrawer };