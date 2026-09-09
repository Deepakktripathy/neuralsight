import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Hyperparameters, Mode, UseCase, DataSource } from '../../types';
import { LayerTooltip } from '../LayerTooltip';
import { getArchitectureTooltip } from '../../utils/tooltips';
import { GANSampleRenderer } from './GANSampleRenderer';
import { Shuffle, Sliders, Eye, Grid3X3, Zap, ShieldAlert, Sparkles, Scale, Info } from 'lucide-react';

interface GANVisualizerProps {
  hyperparams: Hyperparameters;
  step: number;
  mode: Mode;
  useCase: UseCase;
  dataSource?: DataSource;
}

// Deterministic pseudo-random helper
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 33.1) * 43758.5453;
  return x - Math.floor(x);
};

export const GANVisualizer: React.FC<GANVisualizerProps> = ({
  hyperparams,
  step,
  mode,
  useCase,
  dataSource = 'Celebrity Faces (CelebA)',
}) => {
  const isModeCollapse = mode === 'Train' && hyperparams.failureMode === 'Mode Collapse';
  const isDiscOverpowered = mode === 'Train' && hyperparams.failureMode === 'Discriminator Overpowering';

  // Interactive state for Inference Mode
  const [interactiveLatent, setInteractiveLatent] = useState<number[]>([0.2, -0.5, 0.8, -0.1, 0.4, -0.3, 0.6, -0.7]);
  const [viewMode, setViewMode] = useState<'single' | 'batch'>('single');
  const [inspectDiscTarget, setInspectDiscTarget] = useState<'real' | 'fake'>('fake');
  const [interpolationAlpha, setInterpolationAlpha] = useState<number>(0.5);
  const [latentSeedA, setLatentSeedA] = useState<number>(10);
  const [latentSeedB, setLatentSeedB] = useState<number>(50);

  // Active latent vector in Train vs Inference
  const latentVector = useMemo(() => {
    if (mode === 'Inference') {
      // Interpolate between vector A and B based on slider
      return interactiveLatent.map((val, i) => {
        const vA = (seededRandom(latentSeedA + i) * 2 - 1);
        const vB = (seededRandom(latentSeedB + i) * 2 - 1);
        return Number((vA * (1 - interpolationAlpha) + vB * interpolationAlpha).toFixed(2));
      });
    }
    // In Train mode, values cycle deterministically with training step
    return Array.from({ length: 8 }).map((_, i) => {
      const base = seededRandom(step * 10 + i * 3);
      return Number((base * 2 - 1).toFixed(2));
    });
  }, [mode, step, interactiveLatent, interpolationAlpha, latentSeedA, latentSeedB]);

  // Reshuffle seeds
  const handleRandomizeLatent = () => {
    setLatentSeedA(Math.floor(Math.random() * 1000));
    setLatentSeedB(Math.floor(Math.random() * 1000));
    setInteractiveLatent(Array.from({ length: 8 }).map(() => Number((Math.random() * 2 - 1).toFixed(2))));
  };

  // Adversarial game dynamics calculations
  const gameStats = useMemo(() => {
    if (isDiscOverpowered) {
      return {
        probReal: 0.998,
        probFake: 0.002,
        lossG: 6.21,
        lossD: 0.005,
        equilibriumBalance: 98, // D dominates completely
        diversityScore: 12.4,
        gradientGNorm: 0.001,
      };
    }

    if (isModeCollapse) {
      return {
        probReal: 0.72,
        probFake: 0.68,
        lossG: 0.38,
        lossD: 0.82,
        equilibriumBalance: 42,
        diversityScore: 2.1, // Collapsed
        gradientGNorm: 0.04,
      };
    }

    // Normal training progression toward Nash equilibrium (D(x) -> 0.5, D(G(z)) -> 0.5)
    const progress = Math.min(1.0, step / 30);
    const probReal = Math.max(0.5, 0.95 - progress * 0.42 + (Math.sin(step * 0.7) * 0.03));
    const probFake = Math.min(0.5, 0.05 + progress * 0.44 + (Math.cos(step * 0.7) * 0.03));
    const lossG = Number((-Math.log(Math.max(0.001, probFake))).toFixed(3));
    const lossD = Number((-Math.log(Math.max(0.001, probReal)) - Math.log(Math.max(0.001, 1 - probFake))).toFixed(3));
    const equilibriumBalance = Math.round(50 + (probReal - probFake - 0.45) * 60);
    const diversityScore = Math.min(96, Math.round(85 + Math.sin(step) * 5));
    const gradientGNorm = Number((0.45 - progress * 0.2 + (Math.sin(step * 0.5) * 0.05)).toFixed(3));

    return {
      probReal,
      probFake,
      lossG,
      lossD,
      equilibriumBalance: Math.max(10, Math.min(90, equilibriumBalance)),
      diversityScore,
      gradientGNorm,
    };
  }, [step, isDiscOverpowered, isModeCollapse]);

  // Which training phase is happening at this step (4-phase cycle)
  const trainingCyclePhase = step % 2 === 0 ? 'D_STEP' : 'G_STEP';

  return (
    <div className="w-full min-h-full flex flex-col p-3 sm:p-5 relative bg-slate-950 text-slate-100 pb-36">
      
      {/* Top Header & Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">Generative Adversarial Network</span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Minimax: <span className="text-slate-300">Generator G vs Discriminator D</span>
          </span>
        </div>

        {/* View Controls & Toggles */}
        <div className="flex items-center gap-2">
          {mode === 'Train' && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('single')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  viewMode === 'single' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Detailed single sample view"
              >
                <Eye className="w-3 h-3" /> Single
              </button>
              <button
                onClick={() => setViewMode('batch')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  viewMode === 'batch' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Batch diversity grid (inspect for mode collapse)"
              >
                <Grid3X3 className="w-3 h-3" /> Batch Grid
              </button>
            </div>
          )}

          {mode === 'Inference' && (
            <button
              onClick={handleRandomizeLatent}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors text-xs font-medium flex items-center gap-1.5 shadow-sm"
            >
              <Shuffle className="w-3.5 h-3.5" /> Randomize Latent Seed
            </button>
          )}
        </div>
      </div>

      {/* Mode Collapse / Failure Warning Banner */}
      {isModeCollapse && (
        <div className="mb-4 p-2.5 bg-rose-950/40 border border-rose-500/50 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Mode Collapse Triggered:</strong> Generator found a local shortcut that fools D and now produces the exact same image regardless of z.
            </span>
          </div>
          <div className="font-mono text-[11px] bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40 text-rose-300 shrink-0">
            Diversity: {gameStats.diversityScore}%
          </div>
        </div>
      )}

      {isDiscOverpowered && (
        <div className="mb-4 p-2.5 bg-amber-950/40 border border-amber-500/50 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Discriminator Overpowering:</strong> D learns too rapidly (D(x) ≈ 1.0, D(G(z)) ≈ 0.0). The sigmoid saturates and Generator receives zero gradient signal (∇_θG L ≈ 0).
            </span>
          </div>
          <div className="font-mono text-[11px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40 text-amber-300 shrink-0">
            ∇_G ≈ {gameStats.gradientGNorm}
          </div>
        </div>
      )}

      {/* Main Adversarial Pipeline Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[440px]">
        
        {/* Left Col (Generator Network G): Latent vector -> Transposed Conv -> Fake Output */}
        <div
          id="tour-gan-generator"
          className="lg:col-span-6 bg-slate-900/60 border border-indigo-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative backdrop-blur-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono">
                Generator G(z; θ_g)
              </h3>
              <LayerTooltip
                label="Generator"
                description="Learns a mapping from a low-dimensional continuous latent distribution z ~ N(0, I) to high-dimensional realistic data samples using Transposed Convolutions."
                position="right"
              />
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Loss L_G: <span className="text-indigo-400 font-bold">{gameStats.lossG.toFixed(3)}</span>
            </div>
          </div>

          {/* Generator Sub-Components Pipeline */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-auto py-2">
            
            {/* Latent Vector Box */}
            <div id="tour-gan-latent" className="flex flex-col items-center gap-1.5 w-full sm:w-auto">
              <div className="flex items-center justify-between w-full sm:w-28 text-[10px] font-mono text-slate-400">
                <span>Latent z ~ N(0, I)</span>
              </div>

              {/* In Inference: Show Sliders & Interpolator */}
              {mode === 'Inference' ? (
                <div className="w-full sm:w-36 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium">
                    <span className="flex items-center gap-1"><Sliders className="w-3 h-3 text-indigo-400" /> Morph / Walk</span>
                    <span className="font-mono text-indigo-400">{Math.round(interpolationAlpha * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={interpolationAlpha}
                    onChange={(e) => setInterpolationAlpha(parseFloat(e.target.value))}
                    className="w-full h-1.5 accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>Seed A ({latentSeedA})</span>
                    <span>Seed B ({latentSeedB})</span>
                  </div>

                  <div className="pt-1.5 border-t border-slate-800/80 grid grid-cols-2 gap-1">
                    {latentVector.slice(0, 4).map((val, idx) => (
                      <div key={idx} className="flex flex-col text-[9px] font-mono text-slate-400">
                        <span>z[{idx}]: <span className="text-slate-200">{val}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* In Train: Show Animated Latent Matrix */
                <div className="grid grid-cols-4 gap-1 p-2 bg-slate-950/90 rounded-xl border border-slate-800">
                  {latentVector.map((val, i) => (
                    <motion.div
                      key={i}
                      className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[8px] font-mono text-indigo-300"
                      animate={{
                        borderColor: trainingCyclePhase === 'G_STEP' ? 'rgba(99, 102, 241, 0.9)' : 'rgba(99, 102, 241, 0.3)',
                        backgroundColor: `rgba(99, 102, 241, ${Math.max(0.1, (val + 1) * 0.25)})`
                      }}
                      transition={{ duration: 0.3 }}
                      title={`z[${i}] = ${val}`}
                    >
                      {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Transposed Convolutions / Upsampling Architecture Graphic */}
            <div className="flex items-center gap-1.5 text-slate-500">
              <div className="flex flex-col items-center gap-1">
                <div className="text-[9px] font-mono text-slate-400">Dense + Reshape</div>
                <div className="w-8 h-14 bg-indigo-500/20 border border-indigo-500/40 rounded-lg flex flex-col items-center justify-center text-[8px] font-mono text-indigo-300 text-center px-0.5">
                  4x4<br/>64ch
                </div>
              </div>

              <div className="w-3 h-0.5 bg-indigo-500/40" />

              <div className="flex flex-col items-center gap-1">
                <div className="text-[9px] font-mono text-slate-400">ConvTranspose</div>
                <div className="w-10 h-18 bg-indigo-500/25 border border-indigo-500/50 rounded-lg flex flex-col items-center justify-center text-[8px] font-mono text-indigo-200 text-center px-0.5">
                  8x8<br/>32ch
                </div>
              </div>

              <div className="w-3 h-0.5 bg-indigo-500/40" />

              <div className="flex flex-col items-center gap-1">
                <div className="text-[9px] font-mono text-slate-400">Tanh Output</div>
                <div className="w-12 h-22 bg-indigo-500/30 border border-indigo-500/60 rounded-lg flex flex-col items-center justify-center text-[8px] font-mono text-indigo-100 text-center px-0.5">
                  12x12<br/>RGB
                </div>
              </div>
            </div>

            {/* Generated Fake Sample Output */}
            <div id="tour-gan-output" className="flex flex-col items-center">
              {viewMode === 'single' ? (
                <GANSampleRenderer
                  dataSource={dataSource}
                  step={step}
                  failureMode={hyperparams.failureMode}
                  latentVector={latentVector}
                  seedOffset={0}
                  isReal={false}
                  size="md"
                  label="Generated Fake G(z)"
                />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-400">Batch Samples (4 Seeds)</span>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-indigo-500/30">
                    {[0, 1, 2, 3].map((seed) => (
                      <GANSampleRenderer
                        key={seed}
                        dataSource={dataSource}
                        step={step}
                        failureMode={hyperparams.failureMode}
                        latentVector={latentVector}
                        seedOffset={seed}
                        isReal={false}
                        size="sm"
                        showPixelInspector={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Generator Footer Details */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Activation: <strong className="text-indigo-300">ReLU + Tanh</strong></span>
            <span>Gradient Flow ∇_G: <strong className="text-indigo-300">{gameStats.gradientGNorm}</strong></span>
          </div>
        </div>

        {/* Right Col (Discriminator Network D): Real x & Fake G(z) -> Conv2D -> Real/Fake Probability */}
        <div
          id="tour-gan-discriminator"
          className="lg:col-span-6 bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative backdrop-blur-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-mono">
                Discriminator D(x; θ_d)
              </h3>
              <LayerTooltip
                label="Discriminator"
                description="Acts as a classifier that inspects input images (both ground truth real samples and generated fakes) and outputs the scalar probability P(Real)."
                position="left"
              />
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Loss L_D: <span className="text-emerald-400 font-bold">{gameStats.lossD.toFixed(3)}</span>
            </div>
          </div>

          {/* Discriminator Sub-Components Pipeline */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-auto py-2">
            
            {/* Real Data Stream alongside Generator feed */}
            <div className="flex flex-col items-center gap-2">
              <GANSampleRenderer
                dataSource={dataSource}
                step={step}
                failureMode={hyperparams.failureMode}
                latentVector={latentVector}
                seedOffset={step % 4}
                isReal={true}
                size="md"
                label="Real Data x ~ p_data"
              />
            </div>

            {/* Discriminator Downsampling Convolutions */}
            <div className="flex items-center gap-1.5 text-slate-500">
              <div className="flex flex-col items-center gap-1">
                <div className="text-[9px] font-mono text-slate-400">Conv2D (s=2)</div>
                <div className="w-12 h-22 bg-emerald-500/20 border border-emerald-500/40 rounded-lg flex flex-col items-center justify-center text-[8px] font-mono text-emerald-300 text-center px-0.5">
                  6x6<br/>32ch
                </div>
              </div>

              <div className="w-3 h-0.5 bg-emerald-500/40" />

              <div className="flex flex-col items-center gap-1">
                <div className="text-[9px] font-mono text-slate-400">Conv2D (s=2)</div>
                <div className="w-10 h-18 bg-emerald-500/25 border border-emerald-500/50 rounded-lg flex flex-col items-center justify-center text-[8px] font-mono text-emerald-200 text-center px-0.5">
                  3x3<br/>64ch
                </div>
              </div>

              <div className="w-3 h-0.5 bg-emerald-500/40" />

              <div className="flex flex-col items-center gap-1">
                <div className="text-[9px] font-mono text-slate-400">Sigmoid</div>
                <div className="w-8 h-14 bg-emerald-500/30 border border-emerald-500/60 rounded-lg flex flex-col items-center justify-center text-[8px] font-mono text-emerald-100 text-center px-0.5 font-semibold">
                  D(x)<br/>[0, 1]
                </div>
              </div>
            </div>

            {/* Discriminator Dual Prediction Card */}
            <div className="flex flex-col gap-2.5 w-full sm:w-36">
              {/* Score on Real */}
              <div className="p-2 bg-slate-950/80 rounded-xl border border-emerald-500/30 flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-400">D(x_real)</span>
                  <span className="text-emerald-400 font-bold">{(gameStats.probReal * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${gameStats.probReal * 100}%` }}
                  />
                </div>
                <span className="text-[8px] text-emerald-300/80 font-mono text-right">Target: 100% (Real)</span>
              </div>

              {/* Score on Fake */}
              <div className="p-2 bg-slate-950/80 rounded-xl border border-rose-500/30 flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-400">D(G(z)_fake)</span>
                  <span className="text-rose-400 font-bold">{(gameStats.probFake * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400 transition-all duration-300"
                    style={{ width: `${gameStats.probFake * 100}%` }}
                  />
                </div>
                <span className="text-[8px] text-rose-300/80 font-mono text-right">
                  Target for D: 0% | for G: 100%
                </span>
              </div>
            </div>

          </div>

          {/* Discriminator Footer Details */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Activation: <strong className="text-emerald-300">LeakyReLU(0.2) + Sigmoid</strong></span>
            <span>Target Distribution: <strong className="text-slate-200">{dataSource}</strong></span>
          </div>
        </div>

      </div>

      {/* Minimax Game & Nash Equilibrium Arena Bar */}
      <div
        id="tour-gan-minimax"
        className="mt-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl backdrop-blur-md"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
              Minimax Game Objective & Nash Equilibrium
            </h4>
          </div>

          <div className="text-[10px] font-mono text-slate-400 flex flex-wrap items-center gap-2 sm:gap-3">
            <span>Formula: <code className="text-amber-300 font-semibold">min_G max_D V(D, G)</code></span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span>Ideal Balance: <strong className="text-emerald-400">D(x) = D(G(z)) = 0.50</strong></span>
          </div>
        </div>

        {/* Tug-of-war Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono px-1">
            <span className="text-indigo-400 font-medium flex items-center gap-1">
              <span>Generator Fools D</span>
              <span className="text-indigo-300/80 font-mono">(D(G(z)) → 1.0)</span>
            </span>
            <span className="text-amber-400 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/30 text-[9px] tracking-wide">
              Nash Equilibrium (50/50)
            </span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span>Discriminator Catches Fakes</span>
              <span className="text-emerald-300/80 font-mono">(D(x) → 1.0)</span>
            </span>
          </div>

          <div className="relative h-5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-700/80 shadow-inner">
            {/* Equilibrium Center Marker */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-amber-400 z-20 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />

            {/* Generator side */}
            <motion.div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 flex items-center justify-start pl-2"
              animate={{ width: `${100 - gameStats.equilibriumBalance}%` }}
              transition={{ duration: 0.3 }}
            >
              {100 - gameStats.equilibriumBalance > 18 && (
                <span className="text-[9px] font-mono text-white font-bold drop-shadow">
                  G: {(100 - gameStats.equilibriumBalance).toFixed(0)}%
                </span>
              )}
            </motion.div>

            {/* Discriminator side */}
            <motion.div
              className="absolute top-0 bottom-0 right-0 bg-gradient-to-l from-emerald-600 via-emerald-500 to-emerald-400 flex items-center justify-end pr-2"
              animate={{ width: `${gameStats.equilibriumBalance}%` }}
              transition={{ duration: 0.3 }}
            >
              {gameStats.equilibriumBalance > 18 && (
                <span className="text-[9px] font-mono text-white font-bold drop-shadow">
                  D: {gameStats.equilibriumBalance.toFixed(0)}%
                </span>
              )}
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5 px-1 gap-1">
            <span className="text-indigo-400/90">L_G = -log(D(G(z))): {gameStats.lossG.toFixed(3)}</span>
            <span className="px-2 py-0.5 bg-slate-800/90 border border-slate-700 rounded text-slate-300 font-medium">
              Current Game Balance: {gameStats.equilibriumBalance > 60 ? 'Discriminator Winning' : gameStats.equilibriumBalance < 40 ? 'Generator Winning' : 'Near Nash Equilibrium'}
            </span>
            <span className="text-emerald-400/90">L_D = -log(D(x)) - log(1 - D(G(z))): {gameStats.lossD.toFixed(3)}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
