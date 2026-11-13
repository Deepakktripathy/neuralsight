import React from 'react';
import { Architecture } from '../types';
import { ARCHITECTURE_METADATA, ORDERED_ARCHITECTURES } from '../lib/architectureConfig';
import {
  BrainCircuit,
  Network,
  Grid,
  Cpu,
  Repeat,
  Layers,
  Compass,
  UploadCloud,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ArchitectureSelectionHubProps {
  selectedArchitecture: Architecture;
  onSelectArchitecture: (arch: Architecture) => void;
  onOpenGlossary: () => void;
}

const ARCH_ICONS: Record<Architecture, React.ComponentType<{ className?: string }>> = {
  'Standard NN': Network,
  'CNN': Grid,
  'Transformer': Cpu,
  'RNN': Repeat,
  'GAN': Layers,
  'DQN': Compass,
  'Custom Model': UploadCloud,
};

// Deliberately small accent budget: indigo for the core families, amber for
// sequence/decision models, emerald for generative, slate for "bring your own".
const ARCH_ACCENT: Record<Architecture, { icon: string; border: string }> = {
  'Standard NN': { icon: 'bg-indigo-500/12 border-indigo-500/25 text-indigo-400', border: 'hover:border-indigo-500/40' },
  'CNN': { icon: 'bg-indigo-500/12 border-indigo-500/25 text-indigo-400', border: 'hover:border-indigo-500/40' },
  'Transformer': { icon: 'bg-indigo-500/12 border-indigo-500/25 text-indigo-400', border: 'hover:border-indigo-500/40' },
  'RNN': { icon: 'bg-amber-500/12 border-amber-500/25 text-amber-400', border: 'hover:border-amber-500/40' },
  'GAN': { icon: 'bg-emerald-500/12 border-emerald-500/25 text-emerald-400', border: 'hover:border-emerald-500/40' },
  'DQN': { icon: 'bg-amber-500/12 border-amber-500/25 text-amber-400', border: 'hover:border-amber-500/40' },
  'Custom Model': { icon: 'bg-slate-500/15 border-slate-500/30 text-slate-300', border: 'hover:border-slate-400/40' },
};

export const ArchitectureSelectionHub: React.FC<ArchitectureSelectionHubProps> = ({
  selectedArchitecture,
  onSelectArchitecture,
  onOpenGlossary,
}) => {
  const selectedMeta = ARCHITECTURE_METADATA[selectedArchitecture];

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col overflow-y-auto bg-dot-grid relative selection:bg-indigo-500/30">
      {/* Subtle radial ambient glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-gradient-to-b from-indigo-950/20 via-slate-950/5 to-transparent" />

      {/* Top Navigation Bar (brand / progress / one primary action) */}
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-6 border-b border-slate-800/80 bg-slate-950/85 px-6 py-3.5 backdrop-blur-md lg:px-10">
        <a
          href="/"
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-lg font-bold tracking-tight text-white"
        >
          <BrainCircuit className="h-5 w-5 shrink-0 text-indigo-400" />
          <span>NeuralSight</span>
        </a>

        <nav className="hidden items-center gap-5 text-xs font-medium text-slate-400 md:flex">
          <span className="whitespace-nowrap font-semibold text-white">01 · Model</span>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <button
            onClick={() => onSelectArchitecture(selectedArchitecture)}
            className="whitespace-nowrap transition-colors hover:text-slate-200"
          >
            02 · Setup
          </button>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <span className="whitespace-nowrap text-slate-600">03 · Studio</span>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <button
            onClick={onOpenGlossary}
            className="flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-slate-200"
          >
            <BookOpen className="h-3.5 w-3.5 text-slate-500" />
            <span>Docs</span>
          </button>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={() => onSelectArchitecture(selectedArchitecture)}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-950/60 transition-colors hover:bg-indigo-500"
          >
            <span>Continue with {selectedMeta.title}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-6 py-8 lg:px-10">
        <div className="mb-6 max-w-2xl">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl" style={{ textWrap: 'balance' }}>
            Choose a neural architecture
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Pick a model family to set its task and dataset. Topology, hyperparameters and failure modes are tuned live in the Studio.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ORDERED_ARCHITECTURES.map((archId) => {
            const meta = ARCHITECTURE_METADATA[archId];
            const IconComponent = ARCH_ICONS[archId];
            const accent = ARCH_ACCENT[archId];
            const isSelected = selectedArchitecture === archId;

            return (
              <button
                key={archId}
                onClick={() => onSelectArchitecture(archId)}
                className={cn(
                  'group relative flex cursor-pointer flex-col justify-between rounded-2xl border bg-slate-900/90 p-5 text-left backdrop-blur-sm transition-all duration-200',
                  'shadow-[0_10px_28px_-12px_rgba(2,6,23,0.9)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-16px_rgba(99,102,241,0.28)]',
                  accent.border,
                  isSelected
                    ? 'border-indigo-500/70 bg-slate-900 ring-1 ring-indigo-500/30'
                    : 'border-slate-800/90'
                )}
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition-transform duration-200 group-hover:scale-105',
                        accent.icon
                      )}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span className="text-right text-[11px] font-medium text-slate-500">
                      {meta.domainTag}
                    </span>
                  </div>

                  <h2 className="text-base font-bold tracking-tight text-white transition-colors group-hover:text-indigo-200">
                    {meta.title}
                  </h2>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">{meta.fullName}</p>

                  <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-slate-400">
                    {meta.summary}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
                  <span className="truncate font-mono text-[11px] text-slate-500">
                    {meta.keyMechanism}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-indigo-400 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}

          {/* Fills the 8th grid slot and explains the flow without another CTA */}
          <div className="flex flex-col justify-between rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-5">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                How it works
              </span>
              <ol className="mt-3.5 space-y-3">
                {[
                  ['01', 'Model', 'Pick a model family'],
                  ['02', 'Setup', 'Choose task and dataset'],
                  ['03', 'Studio', 'Tune, play and inspect'],
                ].map(([step, label, hint]) => (
                  <li key={step} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 font-mono text-[10px] text-slate-400">
                      {step}
                    </span>
                    <span className="text-xs leading-snug text-slate-300">
                      <strong className="font-semibold text-slate-200">{label}</strong>
                      <span className="block text-[11px] text-slate-500">{hint}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="mt-4 border-t border-slate-900 pt-3 font-mono text-[11px] leading-relaxed text-slate-500">
              Runs fully in the browser · no account needed
            </p>
          </div>
        </div>

        <footer className="mt-auto flex flex-col items-center justify-between gap-3 border-t border-slate-900 pt-5 text-xs text-slate-500 sm:flex-row">
          <span>Neural Architecture Sandbox · {ORDERED_ARCHITECTURES.length} model families</span>
          <button
            onClick={onOpenGlossary}
            className="cursor-pointer transition-colors hover:text-slate-300"
          >
            Open the training companion
          </button>
        </footer>
      </main>
    </div>
  );
};