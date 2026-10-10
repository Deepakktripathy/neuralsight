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
  Play,
  BookOpen,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ArchitectureSelectionHubProps {
  selectedArchitecture: Architecture;
  onSelectArchitecture: (arch: Architecture) => void;
  onQuickLaunchStudio: () => void;
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

const ARCH_ACCENT_STYLES: Record<Architecture, {
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
  hoverShadow: string;
}> = {
  'Standard NN': {
    iconBg: 'bg-indigo-500/12 border-indigo-500/25',
    iconColor: 'text-indigo-400',
    hoverBorder: 'hover:border-indigo-500/50',
    hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.28)]',
  },
  'CNN': {
    iconBg: 'bg-sky-500/12 border-sky-500/25',
    iconColor: 'text-sky-400',
    hoverBorder: 'hover:border-sky-500/50',
    hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(14,165,233,0.28)]',
  },
  'Transformer': {
    iconBg: 'bg-violet-500/12 border-violet-500/25',
    iconColor: 'text-violet-400',
    hoverBorder: 'hover:border-violet-500/50',
    hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.28)]',
  },
  'RNN': {
    iconBg: 'bg-amber-500/12 border-amber-500/25',
    iconColor: 'text-amber-400',
    hoverBorder: 'hover:border-amber-500/50',
    hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.25)]',
  },
  'GAN': {
    iconBg: 'bg-emerald-500/12 border-emerald-500/25',
    iconColor: 'text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/50',
    hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.28)]',
  },
  'DQN': {
    iconBg: 'bg-rose-500/12 border-rose-500/25',
    iconColor: 'text-rose-400',
    hoverBorder: 'hover:border-rose-500/50',
    hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.28)]',
  },
  'Custom Model': {
    iconBg: 'bg-slate-500/15 border-slate-500/30',
    iconColor: 'text-slate-300',
    hoverBorder: 'hover:border-slate-400/50',
    hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(148,163,184,0.22)]',
  },
};

export const ArchitectureSelectionHub: React.FC<ArchitectureSelectionHubProps> = ({
  selectedArchitecture,
  onSelectArchitecture,
  onQuickLaunchStudio,
  onOpenGlossary,
}) => {
  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col overflow-y-auto bg-dot-grid relative selection:bg-indigo-500/30">
      {/* Subtle radial ambient glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-gradient-to-b from-indigo-950/25 via-slate-950/10 to-transparent" />

      {/* Top Navigation Bar (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 lg:px-12 py-4 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md shrink-0">
        {/* Zone 1: Brand Title */}
        <a
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          <BrainCircuit className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>NeuralSight</span>
        </a>

        {/* Zone 2: Step Progress Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <span className="text-white font-semibold whitespace-nowrap shrink-0">
            01. Architecture
          </span>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <button
            onClick={() => onSelectArchitecture(selectedArchitecture)}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>02. Configure</span>
          </button>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <button
            onClick={onQuickLaunchStudio}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            03. Studio
          </button>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <button
            onClick={onOpenGlossary}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Glossary</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickLaunchStudio}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-950/60 transition-all duration-150 hover:-translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Open Studio</span>
          </button>
        </div>
      </header>

      {/* Main Content Container (1440px Desktop Presence) */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-6 lg:px-12 py-10 lg:py-12 flex flex-col justify-between relative z-10">
        <div>
          {/* Hero Header */}
          <div className="max-w-3xl mb-8 lg:mb-10">
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 mb-2">
              <span>Step 1 · Architecture</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Select a neural architecture
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
              Choose a model family to configure its dataset, topology, and hyperparameters.
            </p>
          </div>

          {/* Option A: Feature Cards Grid (3-column responsive layout with soft radius, drop shadow & hover lift) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
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
                    "group relative text-left rounded-2xl p-6 bg-slate-900/90 backdrop-blur-sm border transition-all duration-200 flex flex-col justify-between cursor-pointer",
                    "shadow-[0_12px_32px_-8px_rgba(2,6,23,0.85)] hover:-translate-y-1",
                    accent.hoverBorder,
                    accent.hoverShadow,
                    isSelected
                      ? "border-indigo-500/70 ring-1 ring-indigo-500/30 bg-slate-900"
                      : "border-slate-800/90"
                  )}
                >
                  <div>
                    {/* Top Row: Icon + Unboxed Domain Metadata */}
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl border flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105",
                          accent.iconBg
                        )}
                      >
                        <IconComponent className={cn("w-6 h-6", accent.iconColor)} />
                      </div>

                      <div className="text-[11px] text-slate-400 font-medium text-right">
                        <span>{meta.domainTag}</span>
                      </div>
                    </div>

                    {/* Title & Full Name */}
                    <div className="mb-2.5">
                      <div className="flex items-baseline gap-2.5">
                        <h2 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-200 transition-colors">
                          {meta.title}
                        </h2>
                        <span className="text-xs text-slate-400 font-medium truncate">
                          {meta.fullName}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-slate-300/90 leading-relaxed mb-6">
                      {meta.summary}
                    </p>
                  </div>

                  {/* Card Footer: Unboxed Mechanism Metadata + Animated Action */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      {meta.keyMechanism}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 shrink-0">
                      <span>Configure</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quiet Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Neural Architecture Sandbox
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenGlossary}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Glossary
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={onQuickLaunchStudio}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Skip to Studio
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};
