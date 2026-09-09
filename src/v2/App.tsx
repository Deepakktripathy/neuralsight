import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { PlaybackControls } from './components/PlaybackControls';
import { SandboxDiagnosticsPanel } from './components/SandboxDiagnosticsPanel';
import { MetricsChart } from './components/MetricsChart';
import { CNNVisualizer } from './components/visualizers/CNNVisualizer';
import { TransformerVisualizer } from './components/visualizers/TransformerVisualizer';
import { RLVisualizer } from './components/visualizers/RLVisualizer';
import { StandardNNVisualizer } from './components/visualizers/StandardNNVisualizer';
import { GANVisualizer } from './components/visualizers/GANVisualizer';
import { RNNVisualizer } from './components/visualizers/RNNVisualizer';
import { CustomModelVisualizer } from './components/visualizers/CustomModelVisualizer';
import { Architecture, Mode, UseCase, Hyperparameters, DataSource } from './types';
import { SplitSquareHorizontal, X, HelpCircle, Menu, Code2, Share2, Check, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from './lib/utils';
import { DatasetPreviewModal } from './components/DatasetPreviewModal';
import { CodeExportModal } from './components/CodeExportModal';
import { WelcomeTour } from './components/WelcomeTour';
import { ARCHITECTURE_TOURS } from './lib/tours';
import { TourQuiz } from './components/TourQuiz';
import { ArchitectureTour } from './components/ArchitectureTour';
import { GlossaryPanel } from './components/GlossaryPanel';
import { BookOpen } from 'lucide-react';
import { SpotlightTour, TourStep } from './components/SpotlightTour';

// Rough relative convergence speed by architecture, purely for illustrating
// *why* different architectures learn at different rates in Comparison Mode -
// not derived from any real benchmark. 1.0 = baseline (Standard NN).
const CONVERGENCE_FACTOR: Record<Architecture, number> = {
  'Standard NN': 1.0,
  'CNN': 0.9,            // more parameters, but efficient spatial priors
  'Transformer': 0.75,   // needs more steps to make attention useful
  'RNN': 0.55,           // sequential processing, harder long-range credit assignment
  'GAN': 0.5,            // adversarial training is notoriously unstable/slow
  'DQN': 0.6,
  'Custom Model': 1.0,            // RL signal is sparser and noisier than supervised loss
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

export default function App() {
  // Read shareable URL parameters if present
  const getInitialParam = (key: string, fallback: string) => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get(key);
      return p || fallback;
    }
    return fallback;
  };

  const [architecture, setArchitecture] = useState<Architecture>(() => {
    return (getInitialParam('arch', 'GAN') as Architecture);
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [mode, setMode] = useState<Mode>(() => {
    return (getInitialParam('mode', 'Train') as Mode);
  });
  const [useCase, setUseCase] = useState<UseCase>(() => {
    return (getInitialParam('task', 'Generation') as UseCase);
  });
  const [dataSource, setDataSource] = useState<DataSource>(() => {
    return (getInitialParam('dataset', 'Celebrity Faces (CelebA)') as DataSource);
  });
  const [customModelFile, setCustomModelFile] = useState<File | null>(null);
  
  const [hyperparams, setHyperparams] = useState<Hyperparameters>(() => {
    const lr = parseFloat(getInitialParam('lr', '0.001'));
    const bs = parseInt(getInitialParam('bs', '32'));
    const opt = getInitialParam('opt', 'Adam');
    const loss = getInitialParam('loss', 'Cross-Entropy');
    return {
      learningRate: isNaN(lr) ? 0.001 : lr,
      batchSize: isNaN(bs) ? 32 : bs,
      epochs: 10,
      layers: 4,
      lossFunction: loss as any,
      optimizer: opt as any
    };
  });

  const [showCodeExport, setShowCodeExport] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [previewDataSource, setPreviewDataSource] = useState<DataSource | null>(null);
  

  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(1000); // ms per step
  
  const [metricsData, setMetricsData] = useState<{step: number, loss: number, accuracy: number, valLoss?: number, valAccuracy?: number}[]>([]);

  const [isGuidedTour, setIsGuidedTour] = useState(false);
  const preTourSpeed = React.useRef(speed);
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !window.localStorage.getItem(WELCOME_SEEN_KEY);
  });
  const [showGlossary, setShowGlossary] = useState(false);
  const [activeArchTour, setActiveArchTour] = useState<Architecture | null>(null);
  const [activeSpotlightArch, setActiveSpotlightArch] = useState<Architecture | null>(null);
  const [isStatusPillMinimized, setIsStatusPillMinimized] = useState(false);

  const closeSpotlight = useCallback(() => {
    setActiveSpotlightArch(null);
  }, []);

  const closeArchitectureTour = useCallback(() => {
    setActiveArchTour(null);
  }, []);

  const closeWelcome = () => {
    window.localStorage.setItem(WELCOME_SEEN_KEY, '1');
    setShowWelcome(false);
  };

  const toggleGuidedTour = () => {
    setIsGuidedTour(prev => {
      const next = !prev;
      if (next) {
        preTourSpeed.current = speed;
        setSpeed(3000);
        if (!isPlaying) setIsPlaying(true);
      } else {
        setSpeed(preTourSpeed.current);
      }
      return next;
    });
  };

  // Simulation logic
  React.useEffect(() => {
    let interval: NodeJS.Timeout;

    // Check if we need to pause for quiz
    const tourData = ARCHITECTURE_TOURS[architecture] || ARCHITECTURE_TOURS['Standard NN'];
    if (isPlaying && isGuidedTour && mode === 'Train' && step > 0 && step % tourData.phases.length === 0 && !window.localStorage.getItem(`quiz_${architecture}`)) {
      setIsPlaying(false);
      return;
    }

    if (isPlaying) {
      interval = setInterval(() => {
        setStep(s => {
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
  }, [isPlaying, speed, mode, hyperparams.epochs, isGuidedTour, architecture, step]);

  // Update metrics based on step
  React.useEffect(() => {
    if (step === 0) {
      if (architecture === 'GAN') {
        setMetricsData([{ step: 0, loss: 2.8, accuracy: 0.05, valLoss: 0.4, valAccuracy: 0.95 }]);
      } else {
        setMetricsData([{ step: 0, loss: 2.5, accuracy: 0.1, valLoss: 2.5, valAccuracy: 0.1 }]);
      }
      return;
    }

    setMetricsData(prev => {
      const defaultInitial = architecture === 'GAN'
        ? { step: 0, loss: 2.8, accuracy: 0.05, valLoss: 0.4, valAccuracy: 0.95 }
        : { step: 0, loss: 2.5, accuracy: 0.1, valLoss: 2.5, valAccuracy: 0.1 };
      const last = prev[prev.length - 1] || defaultInitial;
      
      // Simulate learning curve
      let newLoss, newAcc, newValLoss, newValAcc;
      if (mode === 'Train') {
        const lr = hyperparams.learningRate;
        const batchSize = hyperparams.batchSize || 32;
        const opt = hyperparams.optimizer || 'Adam';
        const lossFn = hyperparams.lossFunction || 'Cross-Entropy';

        // Optimizer effect: Adam converges faster and smoother; SGD has momentum bounce; RMSprop adapts
        const optFactor = opt === 'Adam' ? 1.2 : (opt === 'RMSprop' ? 1.05 : 0.85);
        // Batch size effect: smaller batches have higher stochastic noise (1/sqrt(B))
        const batchNoiseScale = Math.min(0.2, 0.5 / Math.sqrt(batchSize));
        // Loss function scale
        const lossScale = lossFn === 'MSE' ? 0.7 : (lossFn === 'Huber' ? 0.85 : 1.0);

        const decay = lr * 5 * CONVERGENCE_FACTOR[architecture] * optFactor * lossScale;
        
        if (architecture === 'GAN') {
          if (hyperparams.failureMode === 'Discriminator Overpowering') {
            newLoss = Math.min(8.0, last.loss + 0.15 + (Math.random() * 0.05));
            newValLoss = Math.max(0.001, (last.valLoss || 0.4) * 0.85);
            newAcc = Math.max(0.001, last.accuracy * 0.7);
            newValAcc = Math.min(0.999, (last.valAccuracy || 0.95) + 0.005);
          } else if (hyperparams.failureMode === 'Mode Collapse') {
            newLoss = 0.38 + (Math.random() * 0.04 - 0.02);
            newValLoss = 0.82 + (Math.random() * 0.06 - 0.03);
            newAcc = 0.68 + (Math.random() * 0.04 - 0.02);
            newValAcc = 0.72 + (Math.random() * 0.04 - 0.02);
          } else {
            // Adversarial training towards Nash equilibrium
            const progress = Math.min(1.0, step / 30);
            const targetGLoss = 0.693;
            const targetDLoss = 1.386;
            const noise = (Math.random() * 2 - 1) * batchNoiseScale;
            const oscillation = Math.sin(step * 0.6) * 0.12;
            newLoss = Math.max(0.2, last.loss + (targetGLoss - last.loss) * decay + oscillation + noise);
            newValLoss = Math.max(0.3, (last.valLoss || 0.4) + (targetDLoss - (last.valLoss || 0.4)) * decay - oscillation + noise);
            newAcc = Math.min(0.52, Math.max(0.05, 0.05 + progress * 0.44 + oscillation * 0.15));
            newValAcc = Math.max(0.50, Math.min(0.98, 0.98 - progress * 0.46 - oscillation * 0.15));
          }
        } else if (hyperparams.failureMode === 'Exploding Gradients') {
            // Exploding gradients: loss skyrockets and becomes NaN
            newLoss = last.loss > 1000 ? NaN : last.loss * (1.1 + Math.random() * 0.5);
            newAcc = last.accuracy * 0.9; // Accuracy drops
            newValLoss = newLoss;
            newValAcc = newAcc;
        } else if (hyperparams.failureMode === 'Vanishing Gradients') {
            // Vanishing gradients: network freezes, no learning
            newLoss = last.loss + (Math.random() * 0.01 - 0.005);
            newAcc = last.accuracy + (Math.random() * 0.002 - 0.001);
            newValLoss = last.valLoss;
            newValAcc = last.valAccuracy;
        } else {
            // Normal LR & Optimizer behavior
            let bounce = 0;
            if (lr >= 0.1 || opt === 'SGD') {
                // Aggressive LR or SGD momentum bounces
                bounce = (Math.sin(step * 0.8) * lr * (opt === 'SGD' ? 6 : 3)) + (Math.random() * batchNoiseScale);
            }
            
            const stochasticJitter = (Math.random() * 2 - 1) * batchNoiseScale;
            newLoss = Math.max(0.01, last.loss - decay + bounce + stochasticJitter);
            newAcc = Math.min(0.99, last.accuracy + (0.99 - last.accuracy) * decay * 2 + (Math.random() * batchNoiseScale * 0.5));
            
            if (hyperparams.failureMode === 'Overfitting') {
                // Train loss goes down nicely, but validation loss goes up
                newValLoss = Math.min(5.0, (last.valLoss || 2.5) + decay * 0.5 + (Math.random() * batchNoiseScale));
                newValAcc = Math.max(0.1, (last.valAccuracy || 0.1) - decay * 0.5);
            } else {
                newValLoss = newLoss * 1.1 + (Math.random() * batchNoiseScale);
                newValAcc = newAcc * 0.95 + (Math.random() * 0.02);
            }
        }
      } else {
        // Inference is stable
        newLoss = last.loss;
        newAcc = last.accuracy;
        newValLoss = last.valLoss;
        newValAcc = last.valAccuracy;
      }

      const newData = [...prev, { step, loss: newLoss, accuracy: newAcc, valLoss: newValLoss, valAccuracy: newValAcc }];
      // Keep last 50 points to prevent memory bloat
      if (newData.length > 50) newData.shift();
      return newData;
    });
  }, [step, mode, hyperparams.learningRate, hyperparams.batchSize, hyperparams.optimizer, hyperparams.lossFunction, architecture, hyperparams.failureMode]);

  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    setStep(0);
    if (architecture === 'GAN') {
      setMetricsData([{ step: 0, loss: 2.8, accuracy: 0.05, valLoss: 0.4, valAccuracy: 0.95 }]);
    } else {
      setMetricsData([{ step: 0, loss: 2.5, accuracy: 0.1, valLoss: 2.5, valAccuracy: 0.1 }]);
    }
  }, [architecture]);

  const handleExportResults = () => {
    const isOverfitting = hyperparams.failureMode === 'Overfitting';
    const header = isOverfitting
      ? "Step,Train Loss,Train Accuracy,Validation Loss,Validation Accuracy\n"
      : "Step,Loss,Accuracy\n";
    const rows = metricsData.map(e => {
      const base = `${e.step},${e.loss.toFixed(4)},${e.accuracy.toFixed(4)}`;
      if (!isOverfitting) return base;
      const vLoss = e.valLoss !== undefined ? e.valLoss.toFixed(4) : '';
      const vAcc = e.valAccuracy !== undefined ? e.valAccuracy.toFixed(4) : '';
      return `${base},${vLoss},${vAcc}`;
    }).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + header + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `metrics_${architecture.toLowerCase()}_${step}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderVisualizer = () => {
    const vizHyperparams = hyperparams;
    const archToRender = architecture;

    switch (archToRender) {
      case 'CNN':
        return <CNNVisualizer hyperparams={vizHyperparams} step={step} mode={mode} useCase={useCase} dataSource={dataSource} />;
      case 'Transformer':
        return <TransformerVisualizer hyperparams={vizHyperparams} step={step} mode={mode} dataSource={dataSource} />;
      case 'DQN':
        return <RLVisualizer hyperparams={vizHyperparams} step={step} mode={mode} dataSource={dataSource} isSpotlightOpen={activeSpotlightArch !== null} />;
      case 'Standard NN':
        return <StandardNNVisualizer hyperparams={vizHyperparams} step={step} mode={mode} useCase={useCase} dataSource={dataSource} />;
      case 'GAN':
        return <GANVisualizer hyperparams={vizHyperparams} step={step} mode={mode} useCase={useCase} dataSource={dataSource} />;
      case 'RNN':
        return <RNNVisualizer hyperparams={vizHyperparams} step={step} mode={mode} dataSource={dataSource} />;
      case 'Custom Model':
        return <CustomModelVisualizer file={customModelFile} setFile={setCustomModelFile} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans relative">
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
           className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm"
           onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={cn(
        "fixed md:relative z-40 h-full transition-all duration-300 shadow-2xl md:shadow-none",
        isSidebarOpen ? "translate-x-0 md:ml-0" : "-translate-x-full md:translate-x-0 md:-ml-56"
      )}>
        <Sidebar 
          onClose={() => setIsSidebarOpen(false)}
          architecture={architecture}
        setArchitecture={setArchitecture}
        mode={mode}
        
        useCase={useCase}
        setUseCase={setUseCase}
        dataSource={dataSource}
        setDataSource={setDataSource}
        hyperparams={hyperparams}
        setHyperparams={setHyperparams}
        resetSimulation={resetSimulation}
        onPreviewDataSource={(d) => {
          setPreviewDataSource(d);
        }}
        customModelFile={customModelFile}
        setCustomModelFile={setCustomModelFile}
      />
      </div>
      
      <div className="flex-1 flex flex-col relative min-h-0 min-w-0 bg-slate-950">
        
        {/* Top Header Bar: Cleanly hosts global controls, eliminating visualizer overlap */}
        <header className="h-14 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 z-30">
          {/* Left Breadcrumbs & Sidebar Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shadow-sm shrink-0"
                title="Open Sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 text-xs">
              <span className="font-semibold text-slate-200 tracking-wide truncate">{architecture}</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-400 font-mono hidden sm:inline truncate">{useCase}</span>
              {dataSource && (
                <>
                  <span className="text-slate-600 hidden md:inline">•</span>
                  <span className="text-indigo-400 font-mono hidden md:inline truncate">{dataSource}</span>
                </>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setShowWelcome(true)}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Replay Welcome Tour"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowGlossary(!showGlossary)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                showGlossary ? "text-indigo-400 bg-indigo-500/10" : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
              title={architecture === 'Custom Model' ? 'Custom Model Info' : 'Open Glossary'}
            >
              <BookOpen className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowCodeExport(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
              title="Export PyTorch / Keras / ONNX Code"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Export Code</span>
            </button>

            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('arch', architecture);
                url.searchParams.set('mode', mode);
                url.searchParams.set('task', useCase);
                url.searchParams.set('dataset', dataSource);
                url.searchParams.set('lr', hyperparams.learningRate.toString());
                url.searchParams.set('bs', (hyperparams.batchSize || 32).toString());
                url.searchParams.set('opt', hyperparams.optimizer || 'Adam');
                url.searchParams.set('loss', hyperparams.lossFunction || 'Cross-Entropy');
                window.history.replaceState({}, '', url.toString());
                navigator.clipboard?.writeText(url.toString());
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border",
                copiedLink 
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" 
                  : "text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border-slate-700"
              )}
              title="Copy shareable link with current architecture & hyperparameters"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-indigo-400" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>

            <div className="h-5 w-px bg-slate-800 mx-0.5" />

            {architecture !== 'Custom Model' && (
              <>
                <button 
                  onClick={toggleGuidedTour}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border",
                    isGuidedTour ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-slate-800 text-slate-300 border-transparent hover:bg-slate-700"
                  )}
                  title="Toggle Guided Tour Mode (Slows down and explains phases)"
                >
                  Guided Tour
                </button>

                <button 
                  onClick={() => setActiveArchTour(architecture)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700/60"
                  title="Detailed Architecture & Mathematical Guide"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Model Info</span>
                </button>

                {TOUR_STEPS[architecture] && (
                  <button 
                    onClick={() => setActiveSpotlightArch(architecture)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-colors border border-indigo-500/30"
                    title="Interactive step-by-step canvas spotlight highlights"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">Canvas Tour</span>
                  </button>
                )}

                <div className="h-5 w-px bg-slate-800 mx-0.5" />
              </>
            )}

            {architecture !== 'Custom Model' && (
              <div className="flex items-center gap-1.5 px-1.5">
                {isPlaying && <span className="flex w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                <span className="text-xs font-mono text-indigo-300 font-semibold">{mode}</span>
              </div>
            )}
          </div>
        </header>

        {/* Main Canvas */}
        <div className="flex-1 relative flex min-h-0 min-w-0">
          <div className="flex-1 relative min-w-0 overflow-auto pb-28">
             <SandboxDiagnosticsPanel failureMode={hyperparams.failureMode} architecture={architecture} />
             {renderVisualizer()}
          </div>

          {/* Step-by-Step Status Pill (hidden during Guided Tour, which already explains the current phase) */}
          {!(isGuidedTour && mode === 'Train') && architecture !== 'Custom Model' && (
            <div
              id="step-status-pill"
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 max-w-[92%]"
            >
              {isStatusPillMinimized ? (
                <button
                  onClick={() => setIsStatusPillMinimized(false)}
                  className="bg-slate-900/95 hover:bg-slate-800 backdrop-blur-md border border-indigo-500/50 px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                  title="Click to expand step status details"
                >
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                    {mode === 'Train' ? `EPOCH ${Math.min(Math.floor(step / 50) + 1, hyperparams.epochs || 10)}/${hyperparams.epochs || 10}` : `STEP ${step.toString().padStart(4, '0')}`}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-xs text-slate-300 font-medium font-mono">
                    {architecture === 'GAN'
                      ? (step % 2 === 0 ? 'D_STEP' : 'G_STEP')
                      : (step % 10 < 5 ? 'FORWARD' : 'BACKPROP')}
                  </span>
                  <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                </button>
              ) : (
                <div
                  className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/60 p-2 pr-3 rounded-full shadow-2xl flex items-center gap-3 transition-opacity duration-200 hover:opacity-20 cursor-default"
                  title="Hover to see through; click minimize to collapse"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] leading-none font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1.5 rounded-full flex items-center justify-center">
                      {mode === 'Train' ? `EPOCH ${Math.min(Math.floor(step / 50) + 1, hyperparams.epochs || 10)}/${hyperparams.epochs || 10}` : `STEP ${step.toString().padStart(4, '0')}`}
                    </span>

                    {mode === 'Train' && step > 0 && (
                      <span className={cn(
                        "text-[10px] leading-none font-mono px-2.5 py-1.5 rounded-full border transition-colors flex items-center justify-center",
                        architecture === 'GAN'
                          ? (step % 2 === 0 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-indigo-400 bg-indigo-500/10 border-indigo-500/30")
                          : (step % 10 < 5 ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" : "text-rose-400 bg-rose-500/10 border-rose-500/30")
                      )}>
                        {architecture === 'GAN'
                          ? (step % 2 === 0 ? 'UPDATE DISCRIMINATOR' : 'UPDATE GENERATOR')
                          : (step % 10 < 5 ? 'FORWARD PASS' : 'BACKPROPAGATION')}
                      </span>
                    )}
                  </div>

                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shrink-0" />
                  <p className="text-[13px] leading-none m-0 text-indigo-50 font-medium whitespace-nowrap drop-shadow-sm flex items-center">
                    {(() => {
                      if (step === 0) return `Model initialized. Ready to begin ${mode === 'Train' ? 'training' : 'inference'}.`;
                      
                      const currentMetrics = metricsData[metricsData.length - 1];
                      if (!currentMetrics) return "Analyzing model state...";

                      if (mode === 'Inference') {
                         if (architecture === 'GAN') return `Sampling latent manifold z ~ N(0, I) and generating synthetic data via G(z).`;
                         if (architecture === 'Transformer' || architecture === 'RNN') return `Step ${step}: Predicting the next token based on the sequence...`;
                         if (architecture === 'CNN') return `Step ${step}: Sliding kernels across input to detect spatial features...`;
                         return `Step ${step}: Performing forward pass on input data.`;
                      }

                      if (architecture === 'GAN') {
                         if (step % 4 === 0) return `Step ${step}: Generator creating fake data from random noise...`;
                         if (step % 4 === 1) return `Step ${step}: Discriminator evaluating Generator's fake data...`;
                         if (step % 4 === 2) return `Step ${step}: Discriminator evaluating real training data...`;
                         return `Step ${step}: Updating Generator weights to fool Discriminator...`;
                      }

                      const isForwardPass = step % 10 < 5;
                      if (isForwardPass) {
                         if (architecture === 'CNN') return `Step ${step}: Forward pass - extracting spatial features through convolution and pooling.`;
                         if (architecture === 'Transformer') return `Step ${step}: Forward pass - calculating self-attention between all tokens simultaneously.`;
                         if (architecture === 'RNN') return `Step ${step}: Forward pass - processing sequence step-by-step and updating hidden state.`;
                         return `Step ${step}: Forward pass - passing inputs through layers to generate prediction.`;
                      } else {
                         if (architecture === 'CNN') return `Step ${step}: Backpropagation - error signal flowing back to update feature detectors.`;
                         return `Step ${step}: Backpropagation - calculating error and flowing gradients backward to update weights.`;
                      }
                    })()}
                  </p>

                  <button
                    onClick={() => setIsStatusPillMinimized(true)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors ml-1 shrink-0"
                    title="Minimize info pill"
                    aria-label="Minimize info pill"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Guided Tour Overlay Screen Dimming & Explanation Panel */}
        {isGuidedTour && mode === 'Train' && (
          <>
            {/* Subtle vignette/dimming over the canvas */}
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] transition-all duration-700 pointer-events-none z-20" />
            
            {(() => {
               const tourData = ARCHITECTURE_TOURS[architecture] || ARCHITECTURE_TOURS['Standard NN'];
               const isQuizTime = step > 0 && step % tourData.phases.length === 0 && !isPlaying && !window.localStorage.getItem(`quiz_${architecture}`);
               
               if (isQuizTime) {
                 return (
                   <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                     <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-md w-full">
                       <TourQuiz 
                         {...tourData.quiz}
                         onContinue={() => {
                           window.localStorage.setItem(`quiz_${architecture}`, '1');
                           setIsPlaying(true);
                           setStep(s => s + 1);
                         }}
                       />
                     </div>
                   </div>
                 );
               }

               const tourPhase = step % tourData.phases.length;
               const phaseData = tourData.phases[tourPhase];
               const colorConfig = {
                 indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
                 emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                 rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
                 amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                 cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
                 purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
               }[phaseData.color];
               
               return (
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-md w-full px-4">
                   <div className="bg-slate-900/95 border border-slate-700/90 p-3.5 sm:p-4 rounded-2xl shadow-2xl backdrop-blur-md relative animate-in fade-in slide-in-from-top-2 duration-300">
                     <button
                       onClick={toggleGuidedTour}
                       className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                       aria-label="Close guided tour"
                     >
                       <X className="w-4 h-4" />
                     </button>
                     <div className="flex items-start gap-3">
                       <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold border text-sm mt-0.5 ${colorConfig}`}>
                         {tourPhase + 1}
                       </div>
                       <div className="flex-1 pr-4">
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Phase {tourPhase + 1} of {tourData.phases.length}</span>
                           <span className="text-[10px] font-mono text-indigo-400 font-semibold">• {phaseData.title}</span>
                         </div>
                         <p className="text-xs text-slate-300 leading-relaxed mt-1">
                           {phaseData.description}
                         </p>
                       </div>
                     </div>
                   </div>
                 </div>
               );
            })()}
          </>
        )}

        {/* Bottom Panel: Metrics & Controls */}
        {architecture !== 'Custom Model' && (
        <div className="h-auto md:h-28 flex flex-col md:flex-row bg-slate-900 border-t border-slate-800 z-20 shrink-0">
          <div className="w-full md:w-[40%] md:min-w-[300px] border-b md:border-b-0 md:border-r border-slate-800 flex flex-col">
            <PlaybackControls 
              isPlaying={isPlaying}
              togglePlay={() => setIsPlaying(!isPlaying)}
              stepForward={() => setStep(s => s + 1)}
              stepBackward={() => setStep(s => Math.max(0, s - 1))}
              reset={resetSimulation}
              speed={speed}
              setSpeed={setSpeed}
              onExportResults={handleExportResults}
            />
          </div>
          <div className="hidden md:flex flex-1 p-3 min-w-0 flex-col">
             <MetricsChart data={metricsData} isOverfitting={hyperparams.failureMode === 'Overfitting'} architecture={architecture} />
          </div>
        </div>
        )}
      </div>
      {previewDataSource && (
        <DatasetPreviewModal 
          dataSource={previewDataSource} 
          
          onClose={() => setPreviewDataSource(null)} 
        />
      )}
      <SpotlightTour
        steps={activeSpotlightArch ? (TOUR_STEPS[activeSpotlightArch] || []) : []}
        isOpen={activeSpotlightArch !== null && !showWelcome}
        onComplete={closeSpotlight}
      />
      {showWelcome && <WelcomeTour onClose={closeWelcome} architecture={architecture} />}
      {activeArchTour && !showWelcome && (
        <ArchitectureTour 
          architecture={activeArchTour} 
          onClose={closeArchitectureTour} 
          onStartSpotlight={() => setActiveSpotlightArch(activeArchTour)}
        />
      )}
      {showGlossary && <GlossaryPanel onClose={() => setShowGlossary(false)} architecture={architecture} />}
      {showCodeExport && (
        <CodeExportModal 
          isOpen={showCodeExport}
          onClose={() => setShowCodeExport(false)}
          architecture={architecture}
          hyperparams={hyperparams}
          mode={mode}
          dataSource={dataSource}
        />
      )}
    </div>
  );
}