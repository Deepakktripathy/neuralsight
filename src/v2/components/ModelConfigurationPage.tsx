import React, { useRef, useState } from 'react';
import {
  Architecture,
  Mode,
  UseCase,
  DataSource,
  Hyperparameters,
  LossFunction,
  Optimizer,
} from '../types';
import { ARCHITECTURE_METADATA } from '../lib/architectureConfig';
import { FAILURE_MODES_BY_ARCH } from '../lib/failureModes';
import {
  BrainCircuit,
  ArrowLeft,
  Play,
  Database,
  Sliders,
  Activity,
  Eye,
  Check,
  UploadCloud,
  FileJson,
  X,
  BookOpen,
  Layers,
  Target,
  Gauge,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ModelConfigurationPageProps {
  architecture: Architecture;
  mode: Mode;
  setMode: (m: Mode) => void;
  useCase: UseCase;
  setUseCase: (u: UseCase) => void;
  dataSource: DataSource;
  setDataSource: (d: DataSource) => void;
  hyperparams: Hyperparameters;
  setHyperparams: (h: Hyperparameters) => void;
  customModelFile: File | null;
  setCustomModelFile: (f: File | null) => void;
  onBackToArchitectures: () => void;
  onLaunchStudio: () => void;
  onPreviewDataSource: (d: DataSource) => void;
  onOpenGlossary: () => void;
}

export const ModelConfigurationPage: React.FC<ModelConfigurationPageProps> = ({
  architecture,
  mode,
  setMode,
  useCase,
  setUseCase,
  dataSource,
  setDataSource,
  hyperparams,
  setHyperparams,
  customModelFile,
  setCustomModelFile,
  onBackToArchitectures,
  onLaunchStudio,
  onPreviewDataSource,
  onOpenGlossary,
}) => {
  const meta = ARCHITECTURE_METADATA[architecture];
  const failureModes = FAILURE_MODES_BY_ARCH[architecture] || [];
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
            01. Architecture
          </button>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <span className="text-white font-semibold whitespace-nowrap shrink-0">
            02. Configure {meta.title}
          </span>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <button
            onClick={onLaunchStudio}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            03. Studio
          </button>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <button
            onClick={onOpenGlossary}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Glossary</span>
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
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-6 shadow-[0_12px_32px_-8px_rgba(2,6,23,0.85)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToArchitectures}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Models</span>
              </button>
              <span className="text-slate-700" aria-hidden="true">·</span>
              <span className="text-xs font-medium text-indigo-400">Step 2</span>
              <span className="text-slate-700" aria-hidden="true">·</span>
              <span className="text-xs text-slate-400">{meta.domainTag}</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {meta.title} Setup
              </h1>
              <span className="text-sm text-slate-400 font-medium">
                {meta.fullName}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
              {meta.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onBackToArchitectures}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-800 hover:text-white border border-slate-700/80 transition-all duration-150 cursor-pointer whitespace-nowrap"
            >
              Change Model
            </button>
            <button
              onClick={onLaunchStudio}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-950/70 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Studio</span>
            </button>
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

                {/* Initial Simulation Mode Selector */}
                <div className="pt-5 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Pass Mode
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
                    {(['Train', 'Inference'] as Mode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={cn(
                          "py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                          mode === m
                            ? "bg-indigo-600 text-white shadow-md"
                            : "text-slate-400 hover:text-slate-200"
                        )}
                      >
                        {m === 'Train' ? 'Train (Fwd + Back)' : 'Inference (Fwd)'}
                      </button>
                    ))}
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
                          onClick={() => setDataSource(ds.id)}
                          className={cn(
                            "group p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5",
                            active
                              ? "bg-indigo-600/12 border-indigo-500/70 shadow-lg shadow-indigo-950/40"
                              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                          )}
                        >
                          <div>
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
                          </div>

                          <div className="pt-2.5 border-t border-slate-800/70 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-slate-400 truncate">
                              {ds.sampleShape}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDataSource(ds.id);
                                onPreviewDataSource(ds.id);
                              }}
                              className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 cursor-pointer"
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

            {/* Row 2: Hyperparameters & Architecture Topology + Failure Sandbox */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column (6 cols): Training Hyperparameters */}
              <div className="lg:col-span-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 p-6 shadow-[0_12px_32px_-8px_rgba(2,6,23,0.85)] space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-indigo-400" />
                    <span>03. Hyperparameters</span>
                  </h2>
                  <span className="text-xs font-mono text-slate-400">
                    LR {hyperparams.learningRate} · {hyperparams.optimizer}
                  </span>
                </div>

                {/* Learning Rate Cards */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Learning Rate (α)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { val: 0.1, label: '0.1', desc: 'Fast' },
                      { val: 0.01, label: '0.01', desc: 'Standard' },
                      { val: 0.001, label: '0.001', desc: 'Fine' },
                      { val: 0.0001, label: '0.0001', desc: 'Slow' },
                    ].map((lrObj) => {
                      const active = hyperparams.learningRate === lrObj.val;
                      return (
                        <button
                          key={lrObj.val}
                          onClick={() =>
                            setHyperparams({ ...hyperparams, learningRate: lrObj.val })
                          }
                          className={cn(
                            "p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer hover:-translate-y-0.5",
                            active
                              ? "bg-indigo-600/15 border-indigo-500 text-white shadow-md"
                              : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                          )}
                        >
                          <div className="text-xs font-mono font-bold text-indigo-300">
                            {lrObj.label}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {lrObj.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optimizer & Loss Function */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Optimizer
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Adam', 'SGD', 'RMSprop'] as Optimizer[]).map((opt) => (
                        <button
                          key={opt}
                          onClick={() =>
                            setHyperparams({ ...hyperparams, optimizer: opt })
                          }
                          className={cn(
                            "py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                            hyperparams.optimizer === opt
                              ? "bg-indigo-600/15 border-indigo-500 text-indigo-200 shadow-sm"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Loss Function
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Cross-Entropy', 'MSE', 'Huber'] as LossFunction[]).map((loss) => (
                        <button
                          key={loss}
                          onClick={() =>
                            setHyperparams({ ...hyperparams, lossFunction: loss })
                          }
                          className={cn(
                            "py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all truncate cursor-pointer",
                            hyperparams.lossFunction === loss
                              ? "bg-indigo-600/15 border-indigo-500 text-indigo-200 shadow-sm"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          )}
                          title={loss}
                        >
                          {loss === 'Cross-Entropy' ? 'Cross-Ent' : loss}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sliders for Epochs / Episodes & Batch Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-800/80">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-slate-300">
                        {architecture === 'DQN' ? 'Episodes' : 'Epochs'}
                      </label>
                      <span className="text-xs font-mono font-semibold text-indigo-400">
                        {hyperparams.epochs || 100}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="10"
                      value={hyperparams.epochs || 100}
                      onChange={(e) =>
                        setHyperparams({
                          ...hyperparams,
                          epochs: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-slate-300">
                        Batch Size
                      </label>
                      <span className="text-xs font-mono font-semibold text-indigo-400">
                        {hyperparams.batchSize || 32}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="256"
                      step="8"
                      value={hyperparams.batchSize || 32}
                      onChange={(e) =>
                        setHyperparams({
                          ...hyperparams,
                          batchSize: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column (6 cols): Model Topology & Failure Sandbox */}
              <div className="lg:col-span-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 p-6 shadow-[0_12px_32px_-8px_rgba(2,6,23,0.85)] flex flex-col justify-between space-y-6">
                {/* Topology Controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-400" />
                      <span>04. Topology</span>
                    </h2>
                  </div>

                  {architecture === 'Standard NN' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-300">
                          Hidden Layers
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {([1, 2, 3] as const).map((l) => (
                            <button
                              key={l}
                              onClick={() =>
                                setHyperparams({ ...hyperparams, layers: l + 2 })
                              }
                              className={cn(
                                "py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer",
                                Math.max(1, (hyperparams.layers || 4) - 2) === l
                                  ? "bg-indigo-600/15 border-indigo-500 text-indigo-200 font-semibold"
                                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                              )}
                            >
                              {l}L
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-300">
                          Nodes / Layer
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {([4, 8, 16] as const).map((n) => (
                            <button
                              key={n}
                              onClick={() =>
                                setHyperparams({ ...hyperparams, mlpNeuronsPerLayer: n })
                              }
                              className={cn(
                                "py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer",
                                (hyperparams.mlpNeuronsPerLayer || 8) === n
                                  ? "bg-indigo-600/15 border-indigo-500 text-indigo-200 font-semibold"
                                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                              )}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {architecture === 'CNN' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-300">
                          Conv Blocks
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {([1, 2, 3] as const).map((l) => (
                            <button
                              key={l}
                              onClick={() =>
                                setHyperparams({
                                  ...hyperparams,
                                  convLayers: l,
                                  layers: l + 2,
                                })
                              }
                              className={cn(
                                "py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer",
                                (hyperparams.convLayers || 2) === l
                                  ? "bg-indigo-600/15 border-indigo-500 text-indigo-200 font-semibold"
                                  : "bg-slate-950/60 border-slate-800 text-slate-400"
                              )}
                            >
                              {l}x
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-300">
                          Pooling
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['Max', 'Average'] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() =>
                                setHyperparams({ ...hyperparams, poolingType: p })
                              }
                              className={cn(
                                "py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer",
                                (hyperparams.poolingType || 'Max') === p
                                  ? "bg-indigo-600/15 border-indigo-500 text-indigo-200 font-semibold"
                                  : "bg-slate-950/60 border-slate-800 text-slate-400"
                              )}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-300">
                          Stride
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {([1, 2, 3] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() =>
                                setHyperparams({ ...hyperparams, stride: s })
                              }
                              className={cn(
                                "py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer",
                                (hyperparams.stride || 1) === s
                                  ? "bg-indigo-600/15 border-indigo-500 text-indigo-200 font-semibold"
                                  : "bg-slate-950/60 border-slate-800 text-slate-400"
                              )}
                            >
                              S={s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {architecture === 'Transformer' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-slate-300">
                        Attention Heads
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {([1, 2, 4] as const).map((h) => (
                          <button
                            key={h}
                            onClick={() =>
                              setHyperparams({ ...hyperparams, attentionHeads: h })
                            }
                            className={cn(
                              "py-2.5 px-3 rounded-xl text-xs font-mono border transition-all cursor-pointer",
                              (hyperparams.attentionHeads || 2) === h
                                ? "bg-indigo-600/15 border-indigo-500 text-indigo-200 font-semibold"
                                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                            )}
                          >
                            {h} {h === 1 ? 'Head' : 'Heads'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {architecture === 'RNN' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-300">
                          Cell Gate
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['Vanilla RNN', 'LSTM', 'GRU'] as const).map((cell) => (
                            <button
                              key={cell}
                              onClick={() =>
                                setHyperparams({ ...hyperparams, rnnCellType: cell })
                              }
                              className={cn(
                                "py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer",
                                (hyperparams.rnnCellType || 'LSTM') === cell
                                  ? "bg-indigo-600/15 border-indigo-500 text-indigo-200 font-semibold"
                                  : "bg-slate-950/60 border-slate-800 text-slate-400"
                              )}
                            >
                              {cell === 'Vanilla RNN' ? 'RNN' : cell}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-300">
                          Unroll Steps
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {([3, 5, 8] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() =>
                                setHyperparams({ ...hyperparams, rnnUnrollSteps: s })
                              }
                              className={cn(
                                "py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer",
                                (hyperparams.rnnUnrollSteps || 5) === s
                                  ? "bg-indigo-600/15 border-indigo-500 text-indigo-200 font-semibold"
                                  : "bg-slate-950/60 border-slate-800 text-slate-400"
                              )}
                            >
                              T={s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {architecture === 'DQN' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-300">
                          Exploration (ε)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['Fast (Greedy)', 'Standard', 'High Exploration'] as const).map(
                            (sched) => (
                              <button
                                key={sched}
                                onClick={() =>
                                  setHyperparams({
                                    ...hyperparams,
                                    dqnExplorationSchedule: sched,
                                  })
                                }
                                className={cn(
                                  "py-2 px-1.5 rounded-xl text-[11px] font-medium border transition-all truncate cursor-pointer",
                                  (hyperparams.dqnExplorationSchedule || 'Standard') ===
                                    sched
                                    ? "bg-indigo-600/15 border-indigo-500 text-indigo-200 font-semibold"
                                    : "bg-slate-950/60 border-slate-800 text-slate-400"
                                )}
                              >
                                {sched.split(' ')[0]}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-300">
                          Discount (γ)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {([0.5, 0.9, 0.99] as const).map((gamma) => (
                            <button
                              key={gamma}
                              onClick={() =>
                                setHyperparams({
                                  ...hyperparams,
                                  dqnDiscountFactor: gamma,
                                })
                              }
                              className={cn(
                                "py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer",
                                (hyperparams.dqnDiscountFactor ?? 0.9) === gamma
                                  ? "bg-indigo-600/15 border-indigo-500 text-indigo-200 font-semibold"
                                  : "bg-slate-950/60 border-slate-800 text-slate-400"
                              )}
                            >
                              γ={gamma.toFixed(2)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {architecture === 'GAN' && (
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-center justify-between gap-4">
                      <div>
                        <span className="font-semibold text-white">
                          Adversarial Pair:
                        </span>{' '}
                        <span className="font-mono text-indigo-300">G(z)</span>{' '}
                        upsamples 16-D noise against Discriminator{' '}
                        <span className="font-mono text-emerald-300">D(x)</span>.
                      </div>
                    </div>
                  )}
                </div>

                {/* Failure Mode Sandbox Selector */}
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-400" />
                      <span>Failure Mode Sandbox</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {failureModes.map((fm) => {
                      const currentFm = hyperparams.failureMode || 'None';
                      const active = currentFm === fm.name;
                      const isHealthy = fm.name === 'None';
                      return (
                        <button
                          key={fm.name}
                          onClick={() =>
                            setHyperparams({
                              ...hyperparams,
                              failureMode: fm.name as any,
                            })
                          }
                          className={cn(
                            "p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer",
                            active
                              ? isHealthy
                                ? "bg-emerald-500/12 border-emerald-500/60 text-emerald-200"
                                : "bg-rose-500/15 border-rose-500/70 text-rose-200"
                              : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                          )}
                        >
                          <div className="text-xs font-semibold flex items-center justify-between">
                            <span>{fm.name === 'None' ? 'Healthy' : fm.name}</span>
                            {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {fm.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bottom Summary & Launch Bar */}
        <div className="rounded-2xl bg-slate-900/95 border border-indigo-500/30 p-5 shadow-[0_16px_40px_-12px_rgba(2,6,23,0.9)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-bold text-white">{meta.title}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{useCase}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-indigo-300">{dataSource}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-slate-400">
              LR {hyperparams.learningRate} / {hyperparams.optimizer}
            </span>
          </div>

          <button
            onClick={onLaunchStudio}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-950/80 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Studio</span>
          </button>
        </div>
      </main>
    </div>
  );
};
