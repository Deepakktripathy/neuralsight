import React, { useState, useRef } from 'react';
import {
  Architecture,
  Mode,
  UseCase,
  LossFunction,
  Optimizer,
  Hyperparameters,
  DataSource,
} from '../types';
import {
  Activity,
  Database,
  BrainCircuit,
  UploadCloud,
  FileJson,
  X,
  Sliders,
  LayoutGrid,
  SlidersHorizontal,
  Eye,
  Gauge,
  Network,
  Grid,
  Cpu,
  Repeat,
  Layers,
  Compass,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { InfoTooltip } from './InfoTooltip';
import { FAILURE_MODES_BY_ARCH } from '../lib/failureModes';
import { ARCHITECTURE_METADATA } from '../lib/architectureConfig';

interface SidebarProps {
  className?: string;
  architecture: Architecture;
  setArchitecture: (a: Architecture) => void;
  mode: Mode;
  setMode?: (m: Mode) => void;
  useCase: UseCase;
  setUseCase: (u: UseCase) => void;
  dataSource: DataSource;
  setDataSource: (d: DataSource) => void;
  hyperparams: Hyperparameters;
  setHyperparams: (h: Hyperparameters) => void;
  resetSimulation: () => void;
  onPreviewDataSource: (d: DataSource, file: File | null) => void;
  onClose?: () => void;
  customModelFile: File | null;
  setCustomModelFile: (f: File | null) => void;
  onOpenArchHub?: () => void;
  onOpenConfigPage?: () => void;
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

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  architecture,
  mode,
  setMode,
  useCase,
  setUseCase,
  dataSource,
  setDataSource,
  hyperparams,
  setHyperparams,
  resetSimulation,
  onPreviewDataSource,
  onClose,
  customModelFile,
  setCustomModelFile,
  onOpenArchHub,
  onOpenConfigPage,
}) => {
  const modelInputRef = useRef<HTMLInputElement>(null);
  const [modelDragActive, setModelDragActive] = useState(false);
  const [openSection, setOpenSection] = useState<'data' | 'hyperparams' | 'topology' | 'failure' | null>('hyperparams');

  const meta = ARCHITECTURE_METADATA[architecture];
  const ArchIcon = ARCH_ICONS[architecture];

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

  const toggleSection = (sec: 'data' | 'hyperparams' | 'topology' | 'failure') => {
    setOpenSection((prev) => (prev === sec ? null : sec));
  };

  return (
    <aside
      className={cn(
        "w-64 bg-slate-900/95 backdrop-blur-xl text-slate-200 p-3.5 flex flex-col h-full overflow-y-auto border-r border-slate-800/80 shadow-[8px_0_30px_-10px_rgba(2,6,23,0.8)] shrink-0 select-none",
        className
      )}
    >
      {/* Top Brand Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={onOpenArchHub}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
          title="Return to Architecture Hub"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shadow-sm group-hover:bg-indigo-500/25 transition-colors">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-base font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
            NeuralSight
          </span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Architecture Feature Card (replaces the cluttered 7-button list) */}
      <div className="rounded-2xl bg-slate-950/80 border border-slate-800/90 p-3.5 shadow-lg mb-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <ArchIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-medium text-indigo-400">
              Active Architecture
            </div>
            <div className="text-sm font-bold text-white truncate">
              {meta.title}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {meta.fullName}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onOpenArchHub}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-[11px] font-semibold bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer shadow-sm"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
            <span>Switch Model</span>
          </button>
          <button
            onClick={onOpenConfigPage}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-[11px] font-semibold bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Full Setup</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher (Train vs Inference) */}
      {architecture !== 'Custom Model' && setMode && (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/90 shadow-inner">
            {(['Train', 'Inference'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  mode === m
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Model File Inspector */}
      {architecture === 'Custom Model' && (
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-semibold text-slate-300">
            Serialized Graph (.onnx / .json)
          </label>
          {!customModelFile ? (
            <div
              className={cn(
                "border border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                modelDragActive
                  ? "border-indigo-400 bg-indigo-500/10"
                  : "border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/60"
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
              <UploadCloud className="w-6 h-6 text-indigo-400 mb-2" />
              <p className="text-xs font-medium text-slate-200">
                Drop ONNX or JSON file
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Click to browse local file
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
            <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <FileJson className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-slate-200 truncate">
                    {customModelFile.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {(customModelFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setCustomModelFile(null);
                  resetSimulation();
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Collapsible Live Tuning Sections for Non-Custom Models */}
      {architecture !== 'Custom Model' && (
        <div className="space-y-2.5 flex-1">
          {/* 1. Task & Target Distribution */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 overflow-hidden">
            <button
              onClick={() => toggleSection('data')}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Task & Dataset</span>
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                  openSection === 'data' && "rotate-180"
                )}
              />
            </button>

            {openSection === 'data' && (
              <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-slate-800/60">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium text-slate-400">
                    Use Case
                  </label>
                  <select
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value as UseCase)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {meta.useCases.map((uc) => (
                      <option key={uc.id} value={uc.id}>
                        {uc.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-medium text-slate-400">
                      {meta.dataSourceCategoryLabel}
                    </label>
                    <button
                      onClick={() => onPreviewDataSource(dataSource, null)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                  <select
                    value={dataSource}
                    onChange={(e) => setDataSource(e.target.value as DataSource)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {meta.dataSources.map((ds) => (
                      <option key={ds.id} value={ds.id}>
                        {ds.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 2. Hyperparameters */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 overflow-hidden">
            <button
              onClick={() => toggleSection('hyperparams')}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                <span>Hyperparameters</span>
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                  openSection === 'hyperparams' && "rotate-180"
                )}
              />
            </button>

            {openSection === 'hyperparams' && (
              <div className="px-3.5 pb-3.5 pt-2 space-y-3.5 border-t border-slate-800/60">
                {/* Learning Rate */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-300 flex items-center">
                    Learning Rate
                    <InfoTooltip content="Step size at each iteration while moving toward a minimum of the loss function." />
                  </label>
                  <select
                    value={hyperparams.learningRate}
                    onChange={(e) =>
                      setHyperparams({
                        ...hyperparams,
                        learningRate: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="0.1">0.1 (Aggressive)</option>
                    <option value="0.01">0.01 (Standard)</option>
                    <option value="0.001">0.001 (Fine-tune)</option>
                    <option value="0.0001">0.0001 (Slow)</option>
                  </select>
                </div>

                {/* Optimizer */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-300 flex items-center">
                    Optimizer
                    <InfoTooltip content="Algorithm used to update network weights from computed gradients." />
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Adam', 'SGD', 'RMSprop'] as Optimizer[]).map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setHyperparams({ ...hyperparams, optimizer: opt })
                        }
                        className={cn(
                          "py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer",
                          hyperparams.optimizer === opt
                            ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loss Function */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-300 flex items-center">
                    Loss Function
                    <InfoTooltip content="Mathematical objective measuring discrepancy between predictions and ground truth." />
                  </label>
                  <select
                    value={hyperparams.lossFunction}
                    onChange={(e) =>
                      setHyperparams({
                        ...hyperparams,
                        lossFunction: e.target.value as LossFunction,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Cross-Entropy">Cross-Entropy</option>
                    <option value="MSE">Mean Squared Error</option>
                    <option value="Huber">Huber Loss</option>
                  </select>
                </div>

                {/* Epochs / Episodes */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-medium text-slate-300 flex items-center">
                      {architecture === 'DQN' ? 'Episodes' : 'Epochs'}
                    </label>
                    <span className="text-[11px] text-indigo-400 font-mono">
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

                {/* Batch Size */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-medium text-slate-300 flex items-center">
                      Batch Size
                    </label>
                    <span className="text-[11px] text-indigo-400 font-mono">
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
            )}
          </div>

          {/* 3. Model Topology (for non-GAN) */}
          {architecture !== 'GAN' && (
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 overflow-hidden">
              <button
                onClick={() => toggleSection('topology')}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Model Topology</span>
                </span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                    openSection === 'topology' && "rotate-180"
                  )}
                />
              </button>

              {openSection === 'topology' && (
                <div className="px-3.5 pb-3.5 pt-2 space-y-3 border-t border-slate-800/60">
                  {architecture === 'Transformer' && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-medium text-slate-300">
                          Attention Heads
                        </label>
                        <span className="text-[10px] text-indigo-400 font-mono">
                          {hyperparams.attentionHeads || 2} Heads
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {([1, 2, 4] as const).map((h) => (
                          <button
                            key={h}
                            onClick={() =>
                              setHyperparams({ ...hyperparams, attentionHeads: h })
                            }
                            className={cn(
                              "py-1.5 text-[11px] font-mono rounded-lg border transition-colors text-center cursor-pointer",
                              (hyperparams.attentionHeads || 2) === h
                                ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                                : "bg-slate-900 border-slate-800 text-slate-400"
                            )}
                          >
                            {h}H
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {architecture === 'CNN' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium text-slate-300">
                            Conv Depth
                          </label>
                          <span className="text-[10px] text-indigo-400 font-mono">
                            {hyperparams.convLayers || 2} Layers
                          </span>
                        </div>
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
                                "py-1.5 text-[11px] font-mono rounded-lg border transition-colors text-center cursor-pointer",
                                (hyperparams.convLayers || 2) === l
                                  ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                                  : "bg-slate-900 border-slate-800 text-slate-400"
                              )}
                            >
                              {l} Conv
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-300">
                          Pooling Operation
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['Max', 'Average'] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() =>
                                setHyperparams({ ...hyperparams, poolingType: p })
                              }
                              className={cn(
                                "py-1.5 text-[11px] font-medium rounded-lg border transition-colors text-center cursor-pointer",
                                (hyperparams.poolingType || 'Max') === p
                                  ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                                  : "bg-slate-900 border-slate-800 text-slate-400"
                              )}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium text-slate-300">
                            Stride (S)
                          </label>
                          <span className="text-[10px] text-indigo-400 font-mono">
                            S={hyperparams.stride || 1}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {([1, 2, 3] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() =>
                                setHyperparams({ ...hyperparams, stride: s })
                              }
                              className={cn(
                                "py-1.5 text-[11px] font-mono rounded-lg border transition-colors text-center cursor-pointer",
                                (hyperparams.stride || 1) === s
                                  ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                                  : "bg-slate-900 border-slate-800 text-slate-400"
                              )}
                            >
                              {s} px
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {architecture === 'RNN' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-300">
                          Cell Architecture
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['Vanilla RNN', 'LSTM', 'GRU'] as const).map((cell) => (
                            <button
                              key={cell}
                              onClick={() =>
                                setHyperparams({ ...hyperparams, rnnCellType: cell })
                              }
                              className={cn(
                                "py-1.5 text-[11px] font-medium rounded-lg border transition-colors text-center cursor-pointer",
                                (hyperparams.rnnCellType || 'LSTM') === cell
                                  ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                                  : "bg-slate-900 border-slate-800 text-slate-400"
                              )}
                            >
                              {cell === 'Vanilla RNN' ? 'RNN' : cell}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium text-slate-300">
                            Unrolled Steps
                          </label>
                          <span className="text-[10px] text-indigo-400 font-mono">
                            {hyperparams.rnnUnrollSteps || 5} Steps
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {([3, 5, 8] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() =>
                                setHyperparams({ ...hyperparams, rnnUnrollSteps: s })
                              }
                              className={cn(
                                "py-1.5 text-[11px] font-mono rounded-lg border transition-colors text-center cursor-pointer",
                                (hyperparams.rnnUnrollSteps || 5) === s
                                  ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                                  : "bg-slate-900 border-slate-800 text-slate-400"
                              )}
                            >
                              {s} Steps
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {architecture === 'DQN' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-300">
                          Exploration Schedule (ε)
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
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
                                  "py-1.5 text-[10px] font-medium rounded-lg border transition-colors text-center truncate px-1 cursor-pointer",
                                  (hyperparams.dqnExplorationSchedule || 'Standard') ===
                                    sched
                                    ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                                    : "bg-slate-900 border-slate-800 text-slate-400"
                                )}
                              >
                                {sched.split(' ')[0]}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium text-slate-300">
                            Discount Factor (γ)
                          </label>
                          <span className="text-[10px] text-indigo-400 font-mono">
                            {hyperparams.dqnDiscountFactor ?? 0.9}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
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
                                "py-1.5 text-[11px] font-mono rounded-lg border transition-colors text-center cursor-pointer",
                                (hyperparams.dqnDiscountFactor ?? 0.9) === gamma
                                  ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                                  : "bg-slate-900 border-slate-800 text-slate-400"
                              )}
                            >
                              {gamma.toFixed(2)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {architecture === 'Standard NN' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium text-slate-300">
                            Hidden Layers
                          </label>
                          <span className="text-[10px] text-indigo-400 font-mono">
                            {Math.max(1, (hyperparams.layers || 4) - 2)} Layers
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {([1, 2, 3] as const).map((l) => (
                            <button
                              key={l}
                              onClick={() =>
                                setHyperparams({ ...hyperparams, layers: l + 2 })
                              }
                              className={cn(
                                "py-1.5 text-[11px] font-mono rounded-lg border transition-colors text-center cursor-pointer",
                                Math.max(1, (hyperparams.layers || 4) - 2) === l
                                  ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                                  : "bg-slate-900 border-slate-800 text-slate-400"
                              )}
                            >
                              {l}L
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium text-slate-300">
                            Neurons / Layer
                          </label>
                          <span className="text-[10px] text-indigo-400 font-mono">
                            {hyperparams.mlpNeuronsPerLayer || 8} Nodes
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {([4, 8, 16] as const).map((n) => (
                            <button
                              key={n}
                              onClick={() =>
                                setHyperparams({ ...hyperparams, mlpNeuronsPerLayer: n })
                              }
                              className={cn(
                                "py-1.5 text-[11px] font-mono rounded-lg border transition-colors text-center cursor-pointer",
                                (hyperparams.mlpNeuronsPerLayer || 8) === n
                                  ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                                  : "bg-slate-900 border-slate-800 text-slate-400"
                              )}
                            >
                              {n}N
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 4. Failure Sandbox */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 overflow-hidden">
            <button
              onClick={() => toggleSection('failure')}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-semibold text-rose-300 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>Failure Sandbox</span>
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                  openSection === 'failure' && "rotate-180"
                )}
              />
            </button>

            {openSection === 'failure' && (
              <div className="px-3.5 pb-3.5 pt-2 space-y-2 border-t border-slate-800/60">
                {(FAILURE_MODES_BY_ARCH[architecture] || []).map((fm) => {
                  const active = (hyperparams.failureMode || 'None') === fm.name;
                  return (
                    <button
                      key={fm.name}
                      onClick={() => {
                        setHyperparams({ ...hyperparams, failureMode: fm.name as any });
                        resetSimulation();
                      }}
                      className={cn(
                        "w-full p-2.5 rounded-xl text-left transition-all border flex justify-between items-center cursor-pointer",
                        active
                          ? "bg-rose-500/15 border-rose-500/50 text-rose-200 shadow-sm"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-semibold truncate">{fm.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {fm.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
