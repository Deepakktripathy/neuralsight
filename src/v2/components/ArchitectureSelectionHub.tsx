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

const ARCH_ACCENT_STYLES: Record<
  Architecture,
  {
    iconBg: string;
    iconColor: string;
    hoverBorder: string;
  }
> = {
  'Standard NN': {
    iconBg: 'bg-indigo-500/12 border-indigo-500/25',
    iconColor: 'text-indigo-400',
    hoverBorder: 'hover:border-indigo-500/50',
  },
  'CNN': {
    iconBg: 'bg-indigo-500/12 border-indigo-500/25',
    iconColor: 'text-indigo-300',
    hoverBorder: 'hover:border-indigo-500/50',
  },
  'Transformer': {
    iconBg: 'bg-indigo-500/12 border-indigo-500/25',
    iconColor: 'text-indigo-400',
    hoverBorder: 'hover:border-indigo-500/50',
  },
  'RNN': {
    iconBg: 'bg-amber-500/12 border-amber-500/25',
    iconColor: 'text-amber-400',
    hoverBorder: 'hover:border-amber-500/50',
  },
  'GAN': {
    iconBg: 'bg-emerald-500/12 border-emerald-500/25',
    iconColor: 'text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/50',
  },
  'DQN': {
    iconBg: 'bg-rose-500/12 border-rose-500/25',
    iconColor: 'text-rose-400',
    hoverBorder: 'hover:border-rose-500/50',
  },
  'Custom Model': {
    iconBg: 'bg-slate-500/15 border-slate-500/30',
    iconColor: 'text-slate-300',
    hoverBorder: 'hover:border-slate-400/50',
  },
};

export const ArchitectureSelectionHub: React.FC<ArchitectureSelectionHubProps> = ({
  selectedArchitecture,
  onSelectArchitecture,
  onOpenGlossary,
}) => {
  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col overflow-y-auto bg-dot-grid relative selection:bg-indigo-500/30">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-gradient-to-b from-indigo-950/20 via-slate-950/10 to-transparent" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-6 lg:px-10 py-3.5 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md shrink-0">
        <a
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          <BrainCircuit className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>NeuralSight</span>
        </a>

        <nav
          aria-label="Workflow progress"
          className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-400"
        >
          <span className="text-white font-semibold whitespace-nowrap shrink-0">
            01. Architecture
          </span>
          <span className="text-slate-700" aria-hidden="true">
            /
          </span>
          <span className="text-slate-400 whitespace-nowrap shrink-0">02. Configure</span>
          <span className="text-slate-700" aria-hidden="true">
            /
          </span>
          <span className="text-slate-400 whitespace-nowrap shrink-0">03. Studio</span>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenGlossary}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Docs &amp; Glossary</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-6 lg:py-8 flex flex-col justify-between relative z-10">
        <div>
          <div className="max-w-3xl mb-6">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Select a neural architecture
            </h1>
            <p className="mt-1.5 text-sm text-slate-400 leading-relaxed max-w-2xl">
              Choose a model family to configure its dataset, topology, and training hyperparameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
            {ORDERED_ARCHITECTURES.map((archId) => {
              const meta = ARCHITECTURE_METADATA[archId];
              const IconComponent = ARCH_ICONS[archId];
              const accent = ARCH_ACCENT_STYLES[archId];
              const isSelected = selectedArchitecture === archId;

              return (
                <button
                  key={archId}
                  onClick={() => onSelectArchitecture(archId)}
                  className={cn(
                    'group relative text-left rounded-2xl p-5 bg-slate-900/90 border transition-all duration-150 flex flex-col justify-between cursor-pointer',
                    'shadow-[0_10px_28px_-10px_rgba(2,6,23,0.8)] hover:-translate-y-0.5',
                    accent.hoverBorder,
                    isSelected
                      ? 'border-indigo-500/70 ring-1 ring-indigo-500/30 bg-slate-900'
                      : 'border-slate-800/90'
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl border flex items-center justify-center shrink-0',
                          accent.iconBg
                        )}
                      >
                        <IconComponent className={cn('w-5 h-5', accent.iconColor)} />
                      </div>

                      <span className="text-xs text-slate-400 font-medium text-right">
                        {meta.domainTag}
                      </span>
                    </div>

                    <div className="mb-2">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-white tracking-tight group-hover:text-indigo-200 transition-colors">
                          {meta.title}
                        </h2>
                        <span className="text-xs text-slate-400 font-medium truncate">
                          {meta.fullName}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300/90 leading-relaxed mb-4">
                      {meta.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400 truncate">
                      {meta.keyMechanism}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 shrink-0">
                      <span>Configure</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="mt-8 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span>NeuralSight · Interactive Neural Architecture Sandbox</span>
          <span className="hidden sm:inline text-slate-400">Step 1 of 3</span>
        </footer>
      </main>
    </div>
  );
};
