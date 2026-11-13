import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { PlaybackControls } from './components/PlaybackControls';
import { MetricsHUD } from './components/MetricsHUD';
import { CNNVisualizer } from './components/visualizers/CNNVisualizer';
import { TransformerVisualizer } from './components/visualizers/TransformerVisualizer';
import { RLVisualizer } from './components/visualizers/RLVisualizer';
import { StandardNNVisualizer } from './components/visualizers/StandardNNVisualizer';
import { GANVisualizer } from './components/visualizers/GANVisualizer';
import { RNNVisualizer } from './components/visualizers/RNNVisualizer';
import { CustomModelVisualizer } from './components/visualizers/CustomModelVisualizer';
import { Architecture, Mode, UseCase, Hyperparameters, DataSource } from './types';
import {
  HelpCircle,
  Code2,
  Eye,
  BookOpen,
  PanelLeftOpen,
  ChevronDown,
} from 'lucide-react';
import { cn } from './lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { DatasetPreviewModal } from './components/DatasetPreviewModal';
import { CodeExportModal } from './components/CodeExportModal';
import { WelcomeTour } from './components/WelcomeTour';
import { GlossaryPanel } from './components/GlossaryPanel';
import { SpotlightTour, TourStep } from './components/SpotlightTour';
import { ArchitectureSelectionHub } from './components/ArchitectureSelectionHub';
import { ModelConfigurationPage } from './components/ModelConfigurationPage';
import { ARCHITECTURE_METADATA } from './lib/architectureConfig';

// Rough relative convergence speed by architecture, purely for illustrating
// *why* different architectures learn at different rates in Comparison Mode -
// not derived from any real benchmark. 1.0 = baseline (Standard NN).
const CONVERGENCE_FACTOR: Record<Architecture, number> = {
  'Standard NN': 1.0,
  'CNN': 0.9,
  'Transformer': 0.75,
  'RNN': 0.55,
  'GAN': 0.5,
  'DQN': 0.6,
  'Custom Model': 1.0,
};

const WELCOME_SEEN_KEY = 'neuralsight_welcome_seen';

const TOUR_STEPS: Partial<Record<Architecture, TourStep[]>> = {
  'Standard NN': [
    { id: 'tour-neuron', title: 'This is a Neuron', description: 'It receives inputs, multiplies them by weights, adds a bias, and passes the result through an activation function.' },
    { id: 'tour-weight', title: 'This is a Weight', description: 'The connections between neurons. Thicker or brighter lines mean the model has learned a stronger relationship.' },
    { id: 'tour-layer-gap', title: 'Fully Connected Layer', description: 'Notice how every neuron in a layer connects to every neuron in the next. This dense web helps standard neural networks learn complex functions.' }
  ],
  'CNN': [
    { id: 'tour-cnn-filter', title: 'Convolutional Filter/Kernel', description: 'Instead of connecting everything, a small filter slides across the image. It looks for local patterns like edges, curves, and textures.' },
    { id: 'tour-cnn-pool', title: 'Max Pooling Operation', description: 'This operation shrinks the feature maps, keeping only the strongest signals. It helps the network become robust to small shifts or distortions.' }
  ],
  'Transformer': [
    { id: 'tour-transformer-attention', title: 'Self-Attention Mechanism', description: 'This dense web shows how every word "looks" at every other word. Attention allows the model to understand context and relationships regardless of distance.' }
  ],
  'RNN': [
    { id: 'tour-rnn-cell', title: 'RNN Cell', description: 'Unlike standard networks, RNN cells process inputs one by one, updating their internal state at each step to maintain memory.' },
    { id: 'tour-rnn-hidden-state', title: 'Hidden State', description: 'This carries the "memory" from previous steps forward. It allows the network to remember context, but can struggle with long-term dependencies (Vanishing Gradients).' }
  ],
  'GAN': [
    { id: 'tour-gan-latent', title: 'Latent Noise Vector (z)', description: 'Continuous noise sampled from Gaussian distribution z ~ N(0, I). In Inference mode, drag the morph slider to smoothly interpolate through the latent manifold and generate new variations.' },
    { id: 'tour-gan-generator', title: 'The Generator G(z)', description: 'Uses Transposed Convolutions to synthesize images without ever seeing real photos! It learns purely through feedback from the Discriminator.' },
    { id: 'tour-gan-output', title: 'Generated Synthetic Sample & Diversity', description: 'Watch the pixels evolve from static fuzz to crisp features. In healthy training, the 2x2 batch grid shows distinct diverse outputs; in Mode Collapse, all batch tiles become identical clones.' },
    { id: 'tour-gan-discriminator', title: 'The Discriminator D(x)', description: 'A convolutional network that evaluates real images D(x) and fakes D(G(z)). Watch its real vs. fake score meters: D wants D(x)=100% and D(G(z))=0%, while G fights to push D(G(z)) up.' },
    { id: 'tour-gan-minimax', title: 'Minimax Game & 50-50 Nash Equilibrium', description: 'G and D push this tug-of-war bar back and forth. At optimal Nash Equilibrium, G matches real data perfectly, leaving D to guess at random: D(x) = D(G(z)) = 0.50 (50/50 balance)!' }
  ],
  'DQN': [
    { id: 'tour-dqn-env', title: 'The Environment', description: 'The simulated world where the agent operates. It provides the current state and gives rewards based on the agent\'s actions.' },
    { id: 'tour-dqn-qvals', title: 'Q-Values', description: 'The neural network predicts the expected future reward (Q-value) for each possible action. The agent usually picks the action with the highest Q-value.' }
  ]
};

export type ViewStage = 'select-arch' | 'configure' | 'studio';

export default function App() {
  const getInitialParam = (key: string, fallback: string) => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get(key);
      return p || fallback;
    }
    return fallback;
  };

  // Start on the Architecture Selection Hub unless deep-linked via URL params.
  // `view` wins over `arch` so ?arch=CNN&view=configure reaches Setup rather than Studio.
  const [viewStage, setViewStage] = useState<ViewStage>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'configure') {
        return 'configure';
      }
      if (view === 'studio' || params.has('arch')) {
        return 'studio';
      }
    }
    return 'select-arch';
  });

  const [architecture, setArchitecture] = useState<Architecture>(() => {
    return getInitialParam('arch', 'Standard NN') as Architecture;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });


  const [mode, setMode] = useState<Mode>('Train');

  const [useCase, setUseCase] = useState<UseCase>(() => {
    return getInitialParam('task', 'Classification') as UseCase;
  });

  const [dataSource, setDataSource] = useState<DataSource>(() => {
    return getInitialParam('dataset', 'Iris Flowers (Classification)') as DataSource;
  });

  const [customModelFile, setCustomModelFile] = useState<File | null>(null);

  const [hyperparams, setHyperparams] = useState<Hyperparameters>(() => {
    const lr = parseFloat(getInitialParam('lr', '0.01'));
    const bs = parseInt(getInitialParam('bs', '32'), 10);
    const opt = getInitialParam('opt', 'Adam');
    const loss = getInitialParam('loss', 'Cross-Entropy');
    return {
      learningRate: isNaN(lr) ? 0.01 : lr,
      batchSize: isNaN(bs) ? 32 : bs,
      epochs: 100,
      layers: 4,
      lossFunction: loss as any,
      optimizer: opt as any,
      failureMode: 'None',
      attentionHeads: 2,
      convLayers: 2,
      poolingType: 'Max',
      stride: 1,
      rnnCellType: 'LSTM',
      rnnUnrollSteps: 5,
      dqnExplorationSchedule: 'Standard',
      dqnDiscountFactor: 0.90,
      mlpNeuronsPerLayer: 8,
    };
  });

  const [showCodeExport, setShowCodeExport] = useState(false);
  const [previewDataSource, setPreviewDataSource] = useState<DataSource | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(1000);

  const [metricsData, setMetricsData] = useState<
    { step: number; loss: number; accuracy: number; valLoss?: number; valAccuracy?: number }[]
  >([]);

  const [showWelcome, setShowWelcome] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [activeSpotlightArch, setActiveSpotlightArch] = useState<Architecture | null>(null);

  const closeSpotlight = useCallback(() => {
    setActiveSpotlightArch(null);
  }, []);

  const closeWelcome = () => {
    window.localStorage.setItem(WELCOME_SEEN_KEY, '1');
    setShowWelcome(false);
  };

  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    setStep(0);
    if (architecture === 'GAN') {
      setMetricsData([{ step: 0, loss: 2.8, accuracy: 0.05, valLoss: 0.4, valAccuracy: 0.95 }]);
    } else {
      setMetricsData([{ step: 0, loss: 2.5, accuracy: 0.1, valLoss: 2.5, valAccuracy: 0.1 }]);
    }
  }, [architecture]);

  // Handler when user picks an architecture card on Stage 1
  const handleSelectArchitectureFromHub = (newArch: Architecture) => {
    const meta = ARCHITECTURE_METADATA[newArch];
    setArchitecture(newArch);
    if (meta.useCases.length > 0) {
      setUseCase(meta.useCases[0].id);
    }
    if (meta.dataSources.length > 0) {
      setDataSource(meta.dataSources[0].id);
    }
    setHyperparams((prev) => ({ ...prev, failureMode: 'None' }));
    setIsPlaying(false);
    setStep(0);
    setViewStage('configure');
  };

  // Simulation loop
  React.useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setStep((s) => {
          if (mode === 'Train') {
            const nextEpoch = Math.floor((s + 1) / 50) + 1;
            if (nextEpoch > hyperparams.epochs) {
              setIsPlaying(false);
              return s;
            }
          }
          return s + 1;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, mode, hyperparams.epochs]);

  // Metrics update
  React.useEffect(() => {
    if (step === 0) {
      if (architecture === 'GAN') {
        setMetricsData([{ step: 0, loss: 2.8, accuracy: 0.05, valLoss: 0.4, valAccuracy: 0.95 }]);
      } else {
        setMetricsData([{ step: 0, loss: 2.5, accuracy: 0.1, valLoss: 2.5, valAccuracy: 0.1 }]);
      }
      return;
    }

    setMetricsData((prev) => {
      const defaultInitial =
        architecture === 'GAN'
          ? { step: 0, loss: 2.8, accuracy: 0.05, valLoss: 0.4, valAccuracy: 0.95 }
          : { step: 0, loss: 2.5, accuracy: 0.1, valLoss: 2.5, valAccuracy: 0.1 };
      const last = prev[prev.length - 1] || defaultInitial;

      let newLoss, newAcc, newValLoss, newValAcc;
      if (mode === 'Train') {
        const lr = hyperparams.learningRate;
        const batchSize = hyperparams.batchSize || 32;
        const opt = hyperparams.optimizer || 'Adam';
        const lossFn = hyperparams.lossFunction || 'Cross-Entropy';

        const optFactor = opt === 'Adam' ? 1.2 : opt === 'RMSprop' ? 1.05 : 0.85;
        const batchNoiseScale = Math.min(0.2, 0.5 / Math.sqrt(batchSize));
        const lossScale = lossFn === 'MSE' ? 0.7 : lossFn === 'Huber' ? 0.85 : 1.0;

        const decay = lr * 5 * CONVERGENCE_FACTOR[architecture] * optFactor * lossScale;

        if (architecture === 'GAN') {
          if (hyperparams.failureMode === 'Discriminator Overpowering') {
            newLoss = Math.min(8.0, last.loss + 0.15 + Math.random() * 0.05);
            newValLoss = Math.max(0.001, (last.valLoss || 0.4) * 0.85);
            newAcc = Math.max(0.001, last.accuracy * 0.7);
            newValAcc = Math.min(0.999, (last.valAccuracy || 0.95) + 0.005);
          } else if (hyperparams.failureMode === 'Mode Collapse') {
            newLoss = 0.38 + (Math.random() * 0.04 - 0.02);
            newValLoss = 0.82 + (Math.random() * 0.06 - 0.03);
            newAcc = 0.68 + (Math.random() * 0.04 - 0.02);
            newValAcc = 0.72 + (Math.random() * 0.04 - 0.02);
          } else {
            const progress = Math.min(1.0, step / 30);
            const targetGLoss = 0.693;
            const targetDLoss = 1.386;
            const noise = (Math.random() * 2 - 1) * batchNoiseScale;
            const oscillation = Math.sin(step * 0.6) * 0.12;
            newLoss = Math.max(0.2, last.loss + (targetGLoss - last.loss) * decay + oscillation + noise);
            newValLoss = Math.max(
              0.3,
              (last.valLoss || 0.4) + (targetDLoss - (last.valLoss || 0.4)) * decay - oscillation + noise
            );
            newAcc = Math.min(0.52, Math.max(0.05, 0.05 + progress * 0.44 + oscillation * 0.15));
            newValAcc = Math.max(0.5, Math.min(0.98, 0.98 - progress * 0.46 - oscillation * 0.15));
          }
        } else if (hyperparams.failureMode === 'Exploding Gradients') {
          newLoss = last.loss > 1000 ? NaN : last.loss * (1.1 + Math.random() * 0.5);
          newAcc = last.accuracy * 0.9;
          newValLoss = newLoss;
          newValAcc = newAcc;
        } else if (hyperparams.failureMode === 'Vanishing Gradients') {
          newLoss = last.loss + (Math.random() * 0.01 - 0.005);
          newAcc = last.accuracy + (Math.random() * 0.002 - 0.001);
          newValLoss = last.valLoss;
          newValAcc = last.valAccuracy;
        } else {
          let bounce = 0;
          if (lr >= 0.1 || opt === 'SGD') {
            bounce = Math.sin(step * 0.8) * lr * (opt === 'SGD' ? 6 : 3) + Math.random() * batchNoiseScale;
          }

          const stochasticJitter = (Math.random() * 2 - 1) * batchNoiseScale;
          newLoss = Math.max(0.01, last.loss - decay + bounce + stochasticJitter);
          newAcc = Math.min(
            0.99,
            last.accuracy + (0.99 - last.accuracy) * decay * 2 + Math.random() * batchNoiseScale * 0.5
          );

          if (hyperparams.failureMode === 'Overfitting') {
            newValLoss = Math.min(5.0, (last.valLoss || 2.5) + decay * 0.5 + Math.random() * batchNoiseScale);
            newValAcc = Math.max(0.1, (last.valAccuracy || 0.1) - decay * 0.5);
          } else {
            newValLoss = newLoss * 1.1 + Math.random() * batchNoiseScale;
            newValAcc = newAcc * 0.95 + Math.random() * 0.02;
          }
        }
      } else {
        newLoss = last.loss;
        newAcc = last.accuracy;
        newValLoss = last.valLoss;
        newValAcc = last.valAccuracy;
      }

      const newData = [...prev, { step, loss: newLoss, accuracy: newAcc, valLoss: newValLoss, valAccuracy: newValAcc }];
      if (newData.length > 50) newData.shift();
      return newData;
    });
  }, [
    step,
    mode,
    hyperparams.learningRate,
    hyperparams.batchSize,
    hyperparams.optimizer,
    hyperparams.lossFunction,
    architecture,
    hyperparams.failureMode,
  ]);

  const handleExportResults = () => {
    const isOverfitting = hyperparams.failureMode === 'Overfitting';
    const header = isOverfitting
      ? 'Step,Train Loss,Train Accuracy,Validation Loss,Validation Accuracy\n'
      : 'Step,Loss,Accuracy\n';
    const rows = metricsData
      .map((e) => {
        const base = `${e.step},${e.loss.toFixed(4)},${e.accuracy.toFixed(4)}`;
        if (!isOverfitting) return base;
        const vLoss = e.valLoss !== undefined ? e.valLoss.toFixed(4) : '';
        const vAcc = e.valAccuracy !== undefined ? e.valAccuracy.toFixed(4) : '';
        return `${base},${vLoss},${vAcc}`;
      })
      .join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + header + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `metrics_${architecture.toLowerCase()}_${step}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderVisualizer = () => {
    switch (architecture) {
      case 'CNN':
        return (
          <CNNVisualizer
            hyperparams={hyperparams}
            step={step}
            mode={mode}
            useCase={useCase}
            dataSource={dataSource}
            isPlaying={isPlaying}
          />
        );
      case 'Transformer':
        return (
          <TransformerVisualizer
            hyperparams={hyperparams}
            step={step}
            mode={mode}
            dataSource={dataSource}
          />
        );
      case 'DQN':
        return (
          <RLVisualizer
            hyperparams={hyperparams}
            step={step}
            mode={mode}
            dataSource={dataSource}
            isSpotlightOpen={activeSpotlightArch !== null}
          />
        );
      case 'Standard NN':
        return (
          <StandardNNVisualizer
            hyperparams={hyperparams}
            step={step}
            mode={mode}
            useCase={useCase}
            dataSource={dataSource}
          />
        );
      case 'GAN':
        return (
          <GANVisualizer
            hyperparams={hyperparams}
            step={step}
            mode={mode}
            useCase={useCase}
            dataSource={dataSource}
          />
        );
      case 'RNN':
        return (
          <RNNVisualizer
            hyperparams={hyperparams}
            step={step}
            mode={mode}
            dataSource={dataSource}
          />
        );
      case 'Custom Model':
        return <CustomModelVisualizer file={customModelFile} setFile={setCustomModelFile} />;
      default:
        return null;
    }
  };

  // Global modals available across all stages
  const renderGlobalModals = () => (
    <>
      {previewDataSource && (
        <DatasetPreviewModal
          dataSource={previewDataSource}
          onClose={() => setPreviewDataSource(null)}
        />
      )}
      {showGlossary && (
        <GlossaryPanel onClose={() => setShowGlossary(false)} architecture={architecture} />
      )}
      {showCodeExport && (
        <CodeExportModal
          onClose={() => setShowCodeExport(false)}
          architecture={architecture}
          hyperparams={hyperparams}
          useCase={useCase}
          dataSource={dataSource}
        />
      )}
    </>
  );

  // STAGE 1: Architecture Selection Feature Cards Hub
  if (viewStage === 'select-arch') {
    return (
      <>
        <ArchitectureSelectionHub
          selectedArchitecture={architecture}
          onSelectArchitecture={handleSelectArchitectureFromHub}
          onOpenGlossary={() => setShowGlossary(true)}
        />
        {renderGlobalModals()}
      </>
    );
  }

  // STAGE 2: Use Case, Target Distribution & Hyperparameters Configuration Page
  if (viewStage === 'configure') {
    return (
      <>
        <ModelConfigurationPage
          architecture={architecture}
          mode={mode}
          setMode={setMode}
          useCase={useCase}
          setUseCase={setUseCase}
          dataSource={dataSource}
          setDataSource={setDataSource}
          hyperparams={hyperparams}
          setHyperparams={setHyperparams}
          customModelFile={customModelFile}
          setCustomModelFile={setCustomModelFile}
          onBackToArchitectures={() => setViewStage('select-arch')}
          onLaunchStudio={() => {
            resetSimulation();
            setViewStage('studio');
          }}
          onPreviewDataSource={(ds) => setPreviewDataSource(ds)}
          onOpenGlossary={() => setShowGlossary(true)}
        />
        {renderGlobalModals()}
      </>
    );
  }

  // STAGE 3: Interactive Simulation Studio
  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans relative">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed md:relative z-40 h-full transition-all duration-300 shadow-2xl md:shadow-none",
          isSidebarOpen
            ? "translate-x-0 md:ml-0"
            : "-translate-x-full md:translate-x-0 md:-ml-64"
        )}
      >
        <Sidebar
          onClose={() => setIsSidebarOpen(false)}
          architecture={architecture}
          setArchitecture={setArchitecture}
          useCase={useCase}
          setUseCase={setUseCase}
          dataSource={dataSource}
          setDataSource={setDataSource}
          hyperparams={hyperparams}
          setHyperparams={setHyperparams}
          resetSimulation={resetSimulation}
          onPreviewDataSource={(d) => setPreviewDataSource(d)}
          customModelFile={customModelFile}
          setCustomModelFile={setCustomModelFile}
          onOpenArchHub={() => {
            setIsPlaying(false);
            setViewStage('select-arch');
          }}
          onOpenConfigPage={() => {
            setIsPlaying(false);
            setViewStage('configure');
          }}
        />
      </div>

      <div className="flex-1 flex flex-col relative min-h-0 min-w-0 bg-slate-950">
        {/* Studio Top Header Bar */}
        <header className="h-14 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between shrink-0 z-30">
          {/* Left: Sidebar Expand Toggle & Active Architecture Model Indicator */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors shadow-sm shrink-0 cursor-pointer"
                title="Expand Stages & Inspector Sidebar"
                aria-label="Expand Stages & Inspector Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4 text-indigo-400" />
              </button>
            )}

            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-white font-semibold tracking-tight text-sm shrink-0">
                {ARCHITECTURE_METADATA[architecture]?.title || architecture}
              </span>
              {ARCHITECTURE_METADATA[architecture]?.fullName && (
                <>
                  <span className="text-slate-600 hidden sm:inline" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-slate-400 hidden sm:inline truncate">
                    {ARCHITECTURE_METADATA[architecture].fullName}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Studio Action Controls: one Learn menu + one primary action */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border cursor-pointer whitespace-nowrap",
                    showGlossary
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700/80"
                  )}
                  title="Quick-start guide, canvas spotlight and training docs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Learn</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Learn</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setShowWelcome(true)}>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  Quick-start guide
                </DropdownMenuItem>
                {TOUR_STEPS[architecture] && (
                  <DropdownMenuItem onSelect={() => setActiveSpotlightArch(architecture)}>
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    Spotlight the canvas
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setShowGlossary(true)}>
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  Docs &amp; glossary
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => setShowCodeExport(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700/80 shadow-sm cursor-pointer whitespace-nowrap"
              title="Export PyTorch / Keras / ONNX Code"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Code</span>
            </button>
          </div>
        </header>

        {/* Main Interactive Canvas with Subtle Dot-Grid Surface */}
        <div className="flex-1 relative flex min-h-0 min-w-0 bg-dot-grid-subtle">
          <div className="flex-1 relative min-w-0 overflow-y-auto">
            {renderVisualizer()}
          </div>
        </div>



        {/* Bottom Panel: Compact Playback Controls & Floating Metrics HUD (AUDIT-11) */}
        {architecture !== 'Custom Model' && (
          <>
            <MetricsHUD
              data={metricsData}
              isOverfitting={hyperparams.failureMode === 'Overfitting'}
              failureMode={hyperparams.failureMode}
              architecture={architecture}
              step={step}
              mode={mode}
              epochs={hyperparams.epochs}
            />

            <div className="h-16 flex items-center justify-center bg-slate-900/95 border-t border-slate-800/80 z-20 shrink-0 shadow-[0_-4px_25px_rgba(2,6,23,0.7)] px-4">
              <div className="w-full max-w-xl">
                <PlaybackControls
                  isPlaying={isPlaying}
                  togglePlay={() => setIsPlaying(!isPlaying)}
                  stepForward={() => setStep((s) => s + 1)}
                  stepBackward={() => setStep((s) => Math.max(0, s - 1))}
                  reset={resetSimulation}
                  speed={speed}
                  setSpeed={setSpeed}
                  onExportResults={handleExportResults}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {renderGlobalModals()}

      <SpotlightTour
        steps={activeSpotlightArch ? TOUR_STEPS[activeSpotlightArch] || [] : []}
        isOpen={activeSpotlightArch !== null && !showWelcome}
        onComplete={closeSpotlight}
      />
      {showWelcome && <WelcomeTour onClose={closeWelcome} architecture={architecture} />}
    </div>
  );
}
