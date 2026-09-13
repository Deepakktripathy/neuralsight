import React from 'react';
import { Architecture, Mode, UseCase, LossFunction, Optimizer, Hyperparameters, DataSource } from '../types';
import { Settings2, Activity, Layers, Play, Database, BrainCircuit, BoxSelect, UploadCloud, FileJson, File as FileIcon, X, Sliders } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useRef } from 'react';
import { InfoTooltip } from './InfoTooltip';
import { FAILURE_MODES_BY_ARCH } from '../lib/failureModes';

interface SidebarProps { className?: string;
  architecture: Architecture;
  setArchitecture: (a: Architecture) => void;
  mode: Mode;
  
  useCase: UseCase;
  setUseCase: (u: UseCase) => void;
  dataSource: DataSource;
  setDataSource: (d: DataSource) => void;
  hyperparams: Hyperparameters;
  setHyperparams: (h: Hyperparameters) => void;
  resetSimulation: () => void;
  onPreviewDataSource: (d: DataSource, file: File | null) => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className,
  architecture,
  setArchitecture,
  mode,
  
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
}) => {
  const architectures: Architecture[] = ['Standard NN', 'CNN', 'Transformer', 'RNN', 'DQN', 'GAN', 'Custom Model'];
  const modes: Mode[] = ['Train', 'Inference'];
  
  
  const modelInputRef = useRef<HTMLInputElement>(null);
  const [modelDragActive, setModelDragActive] = useState(false);

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setCustomModelFile(e.target.files[0]);
    }
  };

  const handleModelDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setModelDragActive(true);
    } else if (e.type === "dragleave") {
      setModelDragActive(false);
    }
  };

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

  const useCasesByArch: Record<Architecture, UseCase[]> = {
    'Standard NN': ['Classification', 'Regression'],
    'CNN': ['Classification', 'Segmentation'],
    'Transformer': ['Generation', 'Classification'],
    'RNN': ['Generation', 'Classification'],
    'DQN': ['Control'],
    'GAN': ['Generation'],
    'Custom Model': ['Custom' as any]
  };

  const dataSourcesByArch: Record<Architecture, DataSource[]> = {
    'Standard NN': ['Iris Flowers (Classification)', 'Boston Housing (Regression)', 'Customer Churn (Binary)'],
    'CNN': ['MNIST (Handwriting)', 'CIFAR-10 (Objects/Animals)', 'Medical Scans (X-Rays)'],
    'Transformer': ['Language Translation (En -> Fr)', 'IMDB Sentiment Reviews', 'Stock Price History', 'Text Prompt'],
    'RNN': ['Language Translation (En -> Fr)', 'IMDB Sentiment Reviews', 'Stock Price History', 'Text Prompt'],
    'DQN': ['Gridworld Maze', 'CartPole', 'Market Trading'],
    'GAN': ['Celebrity Faces (CelebA)', 'MNIST (Handwriting)', 'Art Landscapes'],
    'Custom Model': ['Text Prompt']
  };

  const getDataSourceLabel = (arch: Architecture) => {
    switch (arch) {
      case 'DQN': return 'Environment';
      case 'Transformer':
      case 'RNN': return 'Sequence Data';
      case 'CNN': return 'Image Dataset';
      case 'GAN': return 'Target Distribution';
      default: return 'Tabular Dataset';
    }
  };

  const handleArchChange = (newArch: Architecture) => {
    setArchitecture(newArch);
    setUseCase(useCasesByArch[newArch][0]);
    setDataSource(dataSourcesByArch[newArch][0]);
    setHyperparams({ ...hyperparams, failureMode: 'None' });
    resetSimulation();
  };

  return (
    <div className={cn("w-56 bg-slate-900 text-slate-200 p-2 flex flex-col h-full overflow-y-auto border-r border-slate-800 shrink-0", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          <a href="/" className="text-lg font-bold tracking-tight text-white hover:text-indigo-300 transition-colors">NeuralSight</a>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Architecture */}
        <section className="space-y-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" /> Architecture Setup
          </h2>
          
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="block text-[11px] font-medium text-slate-300">Model Architecture</label>
            </div>
            
            <div className="grid grid-cols-1 gap-1.5 mt-2">
              {architectures.map((arch) => {
                return (
                  <button
                    key={arch}
                    onClick={() => handleArchChange(arch)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-[11px] font-medium transition-all text-left flex items-center justify-between",
                      architecture === arch
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {arch}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {architecture === 'Custom Model' && (
            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-medium text-slate-300">Upload Architecture JSON</label>
              {!customModelFile ? (
                <div 
                  className={cn(
                    "border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
                    modelDragActive ? "border-indigo-400 bg-indigo-500/10" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800"
                  )}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setModelDragActive(true); }}
                  onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setModelDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setModelDragActive(false); }}
                  onDrop={handleModelDrop}
                  onClick={() => modelInputRef.current?.click()}
                >
                  <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                  <p className="text-xs font-medium text-slate-300">Drag JSON here or click to browse</p>
                  <p className="text-[10px] text-slate-500 mt-1">Exported from Custom Model builder</p>
                  <input type="file" ref={modelInputRef} className="hidden" accept=".json" onChange={handleModelFileInput} />
                </div>
              ) : (
                <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileJson className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-slate-200 truncate">{customModelFile.name}</span>
                      <span className="text-[10px] text-slate-500">{(customModelFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setCustomModelFile(null); resetSimulation(); }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-md transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {architecture !== 'Custom Model' && (
            <>
              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-medium text-slate-300">Use Case</label>
                <select 
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value as UseCase)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {useCasesByArch[architecture].map((uc) => (
                    <option key={uc} value={uc}>{uc}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-medium text-slate-300">{getDataSourceLabel(architecture)}</label>
                    <button 
                      onClick={() => onPreviewDataSource(dataSource, null)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Preview
                    </button>
                </div>
                <select 
                  value={dataSource}
                  onChange={(e) => setDataSource(e.target.value as DataSource)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {dataSourcesByArch[architecture].map((ds) => (
                    <option key={ds} value={ds}>{ds}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {architecture !== 'Custom Model' && (
            <>
              <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] font-medium text-slate-300 flex items-center">
                    {architecture === 'DQN' ? 'Episodes' : 'Epochs'}
                    <InfoTooltip content={
                      architecture === 'DQN' ? "One episode is one complete playthrough of the environment until a terminal state is reached." :
                      "One epoch is one complete pass of the training dataSource through the algorithm. More epochs mean more learning, but can lead to overfitting."
                    } />
                  </label>
                  <span className="text-[10px] text-indigo-400 font-mono">{hyperparams.epochs || 100}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={hyperparams.epochs || 100}
                  onChange={(e) => {
                    setHyperparams({ ...hyperparams, epochs: parseInt(e.target.value) });
                  }}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] font-medium text-slate-300 flex items-center">
                    Batch Size
                    <InfoTooltip content="Number of training examples utilized in one iteration. Larger batch sizes train faster but require more memory and might generalize worse." />
                  </label>
                  <span className="text-[10px] text-indigo-400 font-mono">{hyperparams.batchSize || 32}</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="256"
                  step="8"
                  value={hyperparams.batchSize || 32}
                  onChange={(e) => {
                    setHyperparams({ ...hyperparams, batchSize: parseInt(e.target.value) });
                  }}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </>
          )}

          {architecture !== 'Custom Model' && (
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
              <label className="text-[11px] font-medium text-slate-300 flex items-center mb-1">
                Learning Rate
                <InfoTooltip content="Determines step size at each iteration while moving toward a minimum of a loss function. A high rate learns faster but might overshoot, a low rate is precise but slow." />
              </label>
              <select
                value={hyperparams.learningRate}
                onChange={(e) => setHyperparams({ ...hyperparams, learningRate: parseFloat(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              >
                <option value="0.1">0.1 (Aggressive)</option>
                <option value="0.01">0.01 (Standard)</option>
                <option value="0.001">0.001 (Fine-tune)</option>
                <option value="0.0001">0.0001 (Slow)</option>
              </select>
            </div>
          )}

          {architecture !== 'Custom Model' && (
            <>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-slate-300 flex items-center mb-1">
                  Loss Function
                  <InfoTooltip content="The mathematical method used to measure how far the model's predictions are from the actual values. The model tries to minimize this value." />
                </label>
                <select
                  value={hyperparams.lossFunction}
                  onChange={(e) => setHyperparams({ ...hyperparams, lossFunction: e.target.value as LossFunction })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Cross-Entropy">Cross-Entropy</option>
                  <option value="MSE">Mean Squared Error</option>
                  <option value="Huber">Huber Loss</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-slate-300 flex items-center mb-1">
                  Optimizer
                  <InfoTooltip content="The algorithm used to change the attributes of the neural network such as weights and learning rate to reduce the losses. Adam is usually best overall." />
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['Adam', 'SGD', 'RMSprop'] as Optimizer[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setHyperparams({ ...hyperparams, optimizer: opt })}
                      className={cn(
                        "px-2.5 py-1 rounded text-[10px] font-medium border transition-colors",
                        hyperparams.optimizer === opt
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                          : "border-slate-700 text-slate-400 hover:border-slate-500"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Architecture Structural Knobs (Dynamic per model architecture) */}
          {architecture !== 'Custom Model' && architecture !== 'GAN' && (
            <div className="space-y-3 mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Model Topology
                </label>
              </div>

              {/* Transformer: Attention Heads */}
              {architecture === 'Transformer' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-medium text-slate-300 flex items-center">
                      Attention Heads
                      <InfoTooltip content="Determines how many independent subspaces the model projects into to attend to information simultaneously." />
                    </label>
                    <span className="text-[10px] text-indigo-400 font-mono">{hyperparams.attentionHeads || 2} Heads</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {([1, 2, 4] as const).map((h) => (
                      <button
                        key={h}
                        onClick={() => setHyperparams({ ...hyperparams, attentionHeads: h })}
                        className={cn(
                          "py-1 text-[10px] font-mono rounded border transition-colors text-center",
                          (hyperparams.attentionHeads || 2) === h
                            ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                            : "border-slate-700 text-slate-400 hover:border-slate-500"
                        )}
                      >
                        {h} {h === 1 ? 'Head' : 'Heads'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CNN: Conv Layers & Pooling */}
              {architecture === 'CNN' && (
                <div className="space-y-2.5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-slate-300 flex items-center">
                        Conv Depth
                        <InfoTooltip content="Number of sequential convolution layers. Deeper stacks extract increasingly complex semantic abstractions." />
                      </label>
                      <span className="text-[10px] text-indigo-400 font-mono">{hyperparams.convLayers || 2} Layers</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {([1, 2, 3] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setHyperparams({ ...hyperparams, convLayers: l, layers: l + 2 })}
                          className={cn(
                            "py-1 text-[10px] font-mono rounded border transition-colors text-center",
                            (hyperparams.convLayers || 2) === l
                              ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                              : "border-slate-700 text-slate-400 hover:border-slate-500"
                          )}
                        >
                          {l} Conv
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-300 flex items-center">
                      Pooling Operation
                      <InfoTooltip content="Max pooling isolates the strongest detected signal. Average pooling smooths activations across local spatial neighborhoods." />
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Max', 'Average'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setHyperparams({ ...hyperparams, poolingType: p })}
                          className={cn(
                            "py-1 text-[10px] font-medium rounded border transition-colors text-center",
                            (hyperparams.poolingType || 'Max') === p
                              ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                              : "border-slate-700 text-slate-400 hover:border-slate-500"
                          )}
                        >
                          {p} Pooling
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* RNN: Cell Type & Unroll Steps */}
              {architecture === 'RNN' && (
                <div className="space-y-2.5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-300 flex items-center">
                      Cell Architecture
                      <InfoTooltip content="Vanilla RNN passes a single recurrent hidden state. LSTM adds internal cell state and gates (forget, input, output) to conquer vanishing gradients." />
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Vanilla RNN', 'LSTM', 'GRU'] as const).map((cell) => (
                        <button
                          key={cell}
                          onClick={() => setHyperparams({ ...hyperparams, rnnCellType: cell })}
                          className={cn(
                            "py-1 text-[10px] font-medium rounded border transition-colors text-center",
                            (hyperparams.rnnCellType || 'LSTM') === cell
                              ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                              : "border-slate-700 text-slate-400 hover:border-slate-500"
                          )}
                        >
                          {cell === 'Vanilla RNN' ? 'RNN' : cell}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-slate-300 flex items-center">
                        Unrolled Steps
                        <InfoTooltip content="Number of temporal sequence steps unrolled across time for Backpropagation Through Time (BPTT)." />
                      </label>
                      <span className="text-[10px] text-indigo-400 font-mono">{hyperparams.rnnUnrollSteps || 5} Steps</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {([3, 5, 8] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setHyperparams({ ...hyperparams, rnnUnrollSteps: s })}
                          className={cn(
                            "py-1 text-[10px] font-mono rounded border transition-colors text-center",
                            (hyperparams.rnnUnrollSteps || 5) === s
                              ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                              : "border-slate-700 text-slate-400 hover:border-slate-500"
                          )}
                        >
                          {s} Steps
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* DQN: Exploration Schedule & Discount Factor */}
              {architecture === 'DQN' && (
                <div className="space-y-2.5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-300 flex items-center">
                      Exploration Schedule (ε)
                      <InfoTooltip content="Controls the balance between exploring random actions versus exploiting the highest-valued Q-action." />
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Fast (Greedy)', 'Standard', 'High Exploration'] as const).map((sched) => (
                        <button
                          key={sched}
                          onClick={() => setHyperparams({ ...hyperparams, dqnExplorationSchedule: sched })}
                          className={cn(
                            "py-1 text-[9px] font-medium rounded border transition-colors text-center truncate px-0.5",
                            (hyperparams.dqnExplorationSchedule || 'Standard') === sched
                              ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                              : "border-slate-700 text-slate-400 hover:border-slate-500"
                          )}
                          title={sched}
                        >
                          {sched.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-slate-300 flex items-center">
                        Discount Factor (γ)
                        <InfoTooltip content="Determines how heavily future rewards are weighted compared to immediate payoffs. High γ values encourage long-term planning." />
                      </label>
                      <span className="text-[10px] text-indigo-400 font-mono">{hyperparams.dqnDiscountFactor ?? 0.90}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {([0.50, 0.90, 0.99] as const).map((gamma) => (
                        <button
                          key={gamma}
                          onClick={() => setHyperparams({ ...hyperparams, dqnDiscountFactor: gamma })}
                          className={cn(
                            "py-1 text-[10px] font-mono rounded border transition-colors text-center",
                            (hyperparams.dqnDiscountFactor ?? 0.90) === gamma
                              ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                              : "border-slate-700 text-slate-400 hover:border-slate-500"
                          )}
                        >
                          {gamma.toFixed(2)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Standard NN: Hidden Layers & Neurons */}
              {architecture === 'Standard NN' && (
                <div className="space-y-2.5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-slate-300 flex items-center">
                        Hidden Layers
                        <InfoTooltip content="Number of intermediate fully-connected layers. Extra layers allow learning hierarchically complex non-linear decision boundaries." />
                      </label>
                      <span className="text-[10px] text-indigo-400 font-mono">{Math.max(1, (hyperparams.layers || 4) - 2)} Layers</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {([1, 2, 3] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setHyperparams({ ...hyperparams, layers: l + 2 })}
                          className={cn(
                            "py-1 text-[10px] font-mono rounded border transition-colors text-center",
                            Math.max(1, (hyperparams.layers || 4) - 2) === l
                              ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                              : "border-slate-700 text-slate-400 hover:border-slate-500"
                          )}
                        >
                          {l} {l === 1 ? 'Layer' : 'Layers'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-slate-300 flex items-center">
                        Neurons / Layer
                        <InfoTooltip content="Width of each hidden layer. More neurons increase model expressive capacity and risk of overfitting." />
                      </label>
                      <span className="text-[10px] text-indigo-400 font-mono">{hyperparams.mlpNeuronsPerLayer || 8} Nodes</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {([4, 8, 16] as const).map((n) => (
                        <button
                          key={n}
                          onClick={() => setHyperparams({ ...hyperparams, mlpNeuronsPerLayer: n })}
                          className={cn(
                            "py-1 text-[10px] font-mono rounded border transition-colors text-center",
                            (hyperparams.mlpNeuronsPerLayer || 8) === n
                              ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                              : "border-slate-700 text-slate-400 hover:border-slate-500"
                          )}
                        >
                          {n} Nodes
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Failure Mode Sandbox - options are architecture-specific */}
        {architecture !== 'Custom Model' && (
          <section className="space-y-3 mt-6 pt-4 border-t border-slate-800">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Failure Sandbox
            </h2>
            <div className="text-[10px] text-slate-400 mb-2">Simulate common training issues.</div>
            
            <div className="grid grid-cols-1 gap-2">
              {(FAILURE_MODES_BY_ARCH[architecture] || []).map((fm) => (
                <button
                  key={fm.name}
                  onClick={() => {
                    setHyperparams({ ...hyperparams, failureMode: fm.name as any });
                    resetSimulation();
                  }}
                  className={cn(
                    "p-2 rounded-md text-left transition-all border flex justify-between items-center",
                    hyperparams.failureMode === fm.name
                      ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                  )}
                >
                  <div>
                    <div className="text-[11px] font-medium">{fm.name}</div>
                    <div className="text-[10px] opacity-70">{fm.desc}</div>
                  </div>
                  {hyperparams.failureMode === fm.name && <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
