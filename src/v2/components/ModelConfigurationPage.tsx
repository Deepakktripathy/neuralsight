import React, { useRef, useState } from 'react';
import {
  Architecture,
  Mode,
  UseCase,
  DataSource,
  Hyperparameters,
} from '../types';
import { ARCHITECTURE_METADATA } from '../lib/architectureConfig';
import { BrainCircuit, Play, Database, Eye, Check, UploadCloud, FileJson, X, BookOpen, Target, SlidersHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

interface ModelConfigurationPageProps {
  architecture: Architecture;
  mode: Mode;
  setMode: (m: Mode) => void;
  useCase: UseCase;
  setUseCase: (u: UseCase) => void;
  dataSource: DataSource;
  setDataSource: (d: DataSource) => void;
  hyperparams?: Hyperparameters;
  setHyperparams?: (h: Hyperparameters) => void;
  customModelFile: File | null;
  setCustomModelFile: (f: File | null) => void;
  onBackToArchitectures: () => void;
  onLaunchStudio: () => void;
  onPreviewDataSource: (d: DataSource) => void;
  onOpenGlossary: () => void;
}

export const ModelConfigurationPage: React.FC<ModelConfigurationPageProps> = ({
  architecture,
  mode: _mode,
  setMode: _setMode,
  useCase,
  setUseCase,
  dataSource,
  setDataSource,
  hyperparams,
  setHyperparams: _setHyperparams,
  customModelFile,
  setCustomModelFile,
  onBackToArchitectures,
  onLaunchStudio,
  onPreviewDataSource,
  onOpenGlossary,
}) => {
  const meta = ARCHITECTURE_METADATA[architecture];
  const modelInputRef = useRef<HTMLInputElement>(null);
  const [modelDragActive, setModelDragActive] = useState(false);

  const handleModelDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModelDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCustomModelFile(e.dataTransfer.files[0]);
    }
  };

  const handleModelFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCustomModelFile(e.target.files[0]);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col overflow-y-auto bg-dot-grid relative selection:bg-indigo-500/30">
      {/* Subtle top ambient gradient */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-gradient-to-b from-indigo-950/25 via-slate-950/10 to-transparent" />

      {/* Top Navigation Bar (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 lg:px-12 py-4 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md shrink-0">
        {/* Zone 1: Brand Title */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onBackToArchitectures();
          }}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          <BrainCircuit className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>NeuralSight</span>
        </a>

        {/* Zone 2: Step Progress Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={onBackToArchitectures}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            01 · Model
          </button>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <span className="text-white font-semibold whitespace-nowrap shrink-0">
            02 · Setup
          </span>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <button
            onClick={onLaunchStudio}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            03 · Studio
          </button>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <button
            onClick={onOpenGlossary}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Docs</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onLaunchStudio}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-950/60 transition-all duration-150 hover:-translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Studio</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-6 lg:px-12 py-8 lg:py-10 space-y-8 relative z-10">
        {/* Top Architecture Context Bar */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-6 shadow-[0_12px_32px_-8px_rgba(2,6,23,0.85)]">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="text-indigo-400">02 · Setup</span>
              <span className="text-slate-700" aria-hidden="true">·</span>
              <span className="text-slate-400">{meta.domainTag}</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {meta.title} Problem Setup
              </h1>
              <span className="text-sm text-slate-400 font-medium">
                {meta.fullName}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
              Pick the task objective and target dataset. Hyperparameters, layer topologies and failure diagnostics are tuned live in the Studio.
            </p>
          </div>
        </div>

        {architecture === 'Custom Model' ? (
          /* Custom Model Upload Card */
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-8 shadow-[0_12px_32px_-8px_rgba(2,6,23,0.85)] max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              <span>Upload Model Graph (.onnx or .json)</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Drop an ONNX or JSON file below, or launch Studio to inspect the built-in sample graph.
            </p>

            {!customModelFile ? (
              <div
                className={cn(
                  "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200",
                  modelDragActive
                    ? "border-indigo-400 bg-indigo-500/10"
                    : "border-slate-700/80 hover:border-indigo-500/50 hover:bg-slate-800/50"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setModelDragActive(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setModelDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setModelDragActive(false);
                }}
                onDrop={handleModelDrop}
                onClick={() => modelInputRef.current?.click()}
              >
                <UploadCloud className="w-10 h-10 text-indigo-400 mb-3" />
                <p className="text-sm font-semibold text-slate-200">
                  Drop .onnx or .json file here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Click to browse · Client-side only
                </p>
                <input
                  type="file"
                  ref={modelInputRef}
                  className="hidden"
                  accept=".onnx,.json"
                  onChange={handleModelFileInput}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileJson className="w-6 h-6 text-indigo-400 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white truncate">
                      {customModelFile.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {(customModelFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setCustomModelFile(null)}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Row 1: Use Case & Target Distribution / Dataset Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column (5 cols): Use Case & Execution Mode */}
              <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 p-6 shadow-[0_12px_32px_-8px_rgba(2,6,23,0.85)] flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-400" />
                      <span>01. Task</span>
                    </h2>
                    <span className="text-xs text-slate-400">
                      {meta.useCases.length} {meta.useCases.length === 1 ? 'mode' : 'modes'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {meta.useCases.map((uc) => {
                      const active = useCase === uc.id;
                      return (
                        <button
                          key={uc.id}
                          onClick={() => setUseCase(uc.id)}
                          className={cn(
                            "text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:-translate-y-0.5",
                            active
                              ? "bg-indigo-600/12 border-indigo-500/70 shadow-lg shadow-indigo-950/40"
                              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-semibold text-white">
                              {uc.label}
                            </span>
                            {active && (
                              <span className="text-xs font-medium text-indigo-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {uc.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): Target Distribution / Dataset / Environment */}
              <div className="lg:col-span-7 rounded-2xl bg-slate-900/90 border border-slate-800/90 p-6 shadow-[0_12px_32px_-8px_rgba(2,6,23,0.85)] flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-400" />
                      <span>02. {meta.dataSourceCategoryLabel}</span>
                    </h2>
                    <button
                      onClick={() => onPreviewDataSource(dataSource)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Dataset</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {meta.dataSources.map((ds) => {
                      const active = dataSource === ds.id;
                      return (
                        <div
                          key={ds.id}
                          className={cn(
                            "group p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between hover:-translate-y-0.5",
                            active
                              ? "bg-indigo-600/12 border-indigo-500/70 shadow-lg shadow-indigo-950/40"
                              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setDataSource(ds.id)}
                            aria-pressed={active}
                            className="w-full text-left cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h3 className="text-sm font-semibold text-white leading-snug">
                                {ds.label}
                              </h3>
                              {active && (
                                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                              )}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed mb-3">
                              {ds.description}
                            </p>
                          </button>

                          <div className="pt-2.5 border-t border-slate-800/70 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-slate-400 truncate">
                              {ds.sampleShape}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setDataSource(ds.id);
                                onPreviewDataSource(ds.id);
                              }}
                              className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 cursor-pointer"
                              aria-label={`Preview ${ds.label}`}
                            >
                              <Eye className="w-3 h-3" />
                              <span>Preview</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Compact handoff — the detailed controls live in the Studio */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-800/90 bg-slate-900/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 rounded-lg border border-indigo-500/25 bg-indigo-500/10 p-2 text-indigo-400">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Tune the rest in the Studio</h2>
                  <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-slate-400">
                    Hyperparameters, topology and failure modes run live beside the canvas, with loss and accuracy plotted as training advances.
                  </p>
                </div>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-slate-500">
                {hyperparams?.optimizer ?? 'Adam'} · lr {hyperparams?.learningRate ?? 0.01} · {hyperparams?.lossFunction ?? 'Cross-Entropy'}
              </span>
            </div>
          </>
        )}

      </main>
    </div>
  );
};
