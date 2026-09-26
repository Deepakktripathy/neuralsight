import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { InfoTooltip } from '../InfoTooltip';

interface CNNLiveConvolutionProps {
  step: number;
  dataSource?: string;
  sampleGrid?: number[];
  sampleName?: string;
  stride?: 1 | 2 | 3;
}

export const CNNLiveConvolution: React.FC<CNNLiveConvolutionProps> = ({ 
  step: globalStep, 
  dataSource, 
  sampleGrid, 
  sampleName,
  stride = 1
}) => {
  // Input dimensions: 6x6, Kernel: 3x3
  // Compute valid top-left window origins based on stride
  // For W=6, K=3:
  // Stride 1: offsets [0, 1, 2, 3] -> 4x4 output grid (16 steps)
  // Stride 2: offsets [0, 2]       -> 2x2 output grid (4 steps)
  // Stride 3: offsets [0, 3]       -> 2x2 output grid (4 steps)
  const validOffsets = useMemo(() => {
    const offsets: number[] = [];
    for (let pos = 0; pos <= 6 - 3; pos += stride) {
      offsets.push(pos);
    }
    return offsets;
  }, [stride]);

  const outputDim = validOffsets.length; // 4 (for stride 1) or 2 (for stride 2 or 3)
  const totalSteps = outputDim * outputDim; // 16 or 4

  // Autonomous sliding window animation state (0 to totalSteps - 1)
  const [windowStep, setWindowStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(750); // ms per step
  const [hoveredFeatureCell, setHoveredFeatureCell] = useState<number | null>(null);

  // Reset windowStep if stride changes and causes out-of-bounds step
  useEffect(() => {
    setWindowStep(0);
    setHoveredFeatureCell(null);
  }, [stride]);

  // Auto-play sliding window across all positions (0..totalSteps - 1)
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setWindowStep((prev) => {
        if (prev >= totalSteps - 1) {
          return 0; // loop back to first window
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [isPlaying, speed, totalSteps]);

  // Determine active sliding window position (hover takes priority for inspection)
  const rawCycle = hoveredFeatureCell !== null ? hoveredFeatureCell : windowStep;
  const activeCycle = Math.min(rawCycle, totalSteps - 1);
  
  // Output grid coordinate (ox, oy)
  const ox = activeCycle % outputDim;
  const oy = Math.floor(activeCycle / outputDim);

  // Top-left pixel coordinate on the 6x6 grid
  const kx = validOffsets[ox] ?? 0;
  const ky = validOffsets[oy] ?? 0;

  // 6x6 pixel patterns per dataset fallback
  const patterns: Record<string, number[]> = {
    mnist: [
      0, 0, 1, 1, 0, 0,
      0, 0, 0, 1, 0, 0,
      0, 0, 1, 1, 0, 0,
      0, 0, 0, 1, 0, 0,
      0, 0, 1, 1, 0, 0,
      0, 0, 0, 0, 0, 0
    ],
    cifar: [
      0, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1,
      1, 0, 1, 1, 0, 1,
      1, 1, 1, 1, 1, 1,
      0, 1, 0, 0, 1, 0,
      0, 0, 0, 0, 0, 0
    ],
    xray: [
      0, 1, 0, 0, 1, 0,
      1, 1, 1, 1, 1, 1,
      0, 1, 0, 0, 1, 0,
      1, 1, 1, 1, 1, 1,
      0, 1, 0, 0, 1, 0,
      0, 0, 1, 1, 0, 0
    ]
  };

  const patternKey = dataSource?.includes('CIFAR') ? 'cifar' : (dataSource?.includes('Medical') ? 'xray' : 'mnist');
  const selectedPattern = patterns[patternKey];

  const grid = useMemo(() => {
    if (sampleGrid && sampleGrid.length === 36) {
      return sampleGrid;
    }
    return Array.from({ length: 36 }, (_, i) => {
      const base = selectedPattern[i] === 1 ? 0.85 : 0.08;
      const noise = Math.sin(i * 123.456) * 0.15;
      return Number(Math.max(0, Math.min(1, base + noise)).toFixed(1));
    });
  }, [sampleGrid, selectedPattern]);

  // 3x3 Edge-detection kernel filter
  const kernel = useMemo(() => [ 
    0,  1,  0,
   -1,  0,  1,
    0, -1,  0
  ], []);

  // Compute active receptive field dot product and active cell indices
  const { sum, activeCells } = useMemo(() => {
    let s = 0;
    const cells = new Set<number>();
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const gx = kx + j;
        const gy = ky + i;
        const idx = gy * 6 + gx;
        cells.add(idx);
        s += (grid[idx] ?? 0) * kernel[i * 3 + j];
      }
    }
    return { sum: s, activeCells: cells };
  }, [grid, kernel, kx, ky]);

  // Dynamic Output Feature Map sized outputDim x outputDim
  const outputGrid = useMemo(() => {
    const out = new Array(totalSteps).fill(0);
    for (let r = 0; r < outputDim; r++) {
      for (let c = 0; c < outputDim; c++) {
        const startX = validOffsets[c];
        const startY = validOffsets[r];
        let s = 0;
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            s += (grid[(startY + i) * 6 + (startX + j)] ?? 0) * kernel[i * 3 + j];
          }
        }
        out[r * outputDim + c] = s;
      }
    }
    return out;
  }, [grid, kernel, outputDim, totalSteps, validOffsets]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setWindowStep(0);
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    setWindowStep((prev) => (prev > 0 ? prev - 1 : totalSteps - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setWindowStep((prev) => (prev < totalSteps - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl z-20" id="tour-cnn-filter">
      {/* Header with Title and Interactive Sliding Window Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/90 pb-3 mb-4 gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
            Stage 2: Live 3×3 Convolution Kernel & Sliding Window Math
          </h4>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-semibold">
            Window {activeCycle + 1} / {totalSteps}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-semibold flex items-center gap-1">
            Stride {stride}px
            <InfoTooltip content={`With input 6×6, kernel 3×3, and stride ${stride}px, the window advances ${stride} pixels at a time, generating a ${outputDim}×${outputDim} feature map.`} />
          </span>
        </div>

        {/* Sliding Window Playback Controls */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onClick={handleStepBack}
            title="Previous Window Position"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            title={isPlaying ? 'Pause Sliding Window' : 'Play Sliding Window Animation'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              isPlaying
                ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500'
                : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span className="text-[10.5px]">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span className="text-[10.5px]">Slide</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleStepForward}
            title="Next Window Position"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            title="Reset to Top-Left Cell"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-3 w-px bg-slate-800 mx-0.5" />

          {/* Speed Toggle */}
          <div className="flex items-center gap-1">
            {[
              { label: '0.5×', val: 1200 },
              { label: '1×', val: 750 },
              { label: '2×', val: 350 },
            ].map((sp) => (
              <button
                key={sp.label}
                type="button"
                onClick={() => setSpeed(sp.val)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${
                  speed === sp.val
                    ? 'bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-500/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Stage Display */}
      <div className="flex flex-wrap items-center justify-around gap-6">
        
        {/* Source Grid (6x6) with Animated Sliding Receptive Field */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-medium text-indigo-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {sampleName ? `${sampleName} (6×6 Grid)` : dataSource ? `${dataSource.split(' ')[0]} (6×6)` : 'Input Image (6×6)'}
          </span>

          <div className="relative p-1 bg-slate-800/90 rounded-xl border border-slate-700 shadow-inner w-44 h-44 overflow-hidden">
            {/* 6x6 Cell Grid */}
            <div className="grid grid-cols-6 grid-rows-6 gap-0.5 w-full h-full">
              {grid.map((val, i) => {
                const isActive = activeCells.has(i);
                return (
                  <div 
                    key={i} 
                    className={`relative flex items-center justify-center transition-colors duration-150 rounded-[2px] ${
                      isActive ? 'bg-indigo-600/80 text-white font-bold' : 'bg-slate-900/90 text-slate-500'
                    }`}
                  >
                    <span className="text-[8.5px] font-mono">
                      {val.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Smooth Spring Sliding Window Box over the 3x3 active receptive field */}
            <motion.div
              className="absolute border-2 border-cyan-400 bg-cyan-400/20 rounded pointer-events-none z-20 shadow-[0_0_12px_rgba(34,211,238,0.7)] ring-1 ring-white/50"
              animate={{
                left: `${(kx / 6) * 100}%`,
                top: `${(ky / 6) * 100}%`,
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              style={{
                width: `${(3 / 6) * 100}%`,
                height: `${(3 / 6) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-sm bg-cyan-400/40 border border-cyan-400 inline-block" />
            <span>Active 3×3 Window: [X: {kx}, Y: {ky}]</span>
          </div>
        </div>

        {/* Math Visualization Bridge: Kernel Matrix & Live Dot Product */}
        <div className="flex flex-col items-center gap-2.5 w-64 shrink-0 bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between w-full border-b border-slate-800/80 pb-1.5">
            <span className="text-[10.5px] font-semibold text-slate-200">
              Convolution Arithmetic
            </span>
            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
              Stride = {stride}
            </span>
          </div>

          {/* 3x3 Kernel Matrix Display */}
          <div className="flex items-center gap-2">
            <span className="text-[9.5px] font-mono text-slate-400">Filter W:</span>
            <div className="grid grid-cols-3 gap-0.5 p-1 bg-slate-900 rounded border border-slate-700/80">
              {kernel.map((w, idx) => (
                <div 
                  key={idx}
                  className="w-5 h-5 flex items-center justify-center text-[8.5px] font-mono font-bold bg-slate-800 text-indigo-300 rounded-[2px]"
                >
                  {w}
                </div>
              ))}
            </div>
          </div>

          <span className="text-[9.5px] text-slate-400 text-center font-mono">
            Σ (Window[i,j] × Kernel[i,j])
          </span>

          {/* Calculated Dot Product Badge with Live Update Animation */}
          <div className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-3 py-2 rounded-lg border border-indigo-500/30 text-center w-full shadow-inner">
            <span className="text-slate-400 text-[10px] block font-sans">Calculated Feature Activation:</span>
            <motion.span 
              key={`${sum.toFixed(2)}-${activeCycle}`}
              initial={{ scale: 1.25, color: '#38bdf8' }}
              animate={{ scale: 1, color: '#34d399' }}
              transition={{ duration: 0.2 }}
              className="text-emerald-400 font-bold text-lg mt-0.5 inline-block"
            >
              {sum.toFixed(2)}
            </motion.span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
            <span>Writing to cell ({ox}, {oy})</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
          </div>
        </div>

        {/* Output Feature Map Grid (Dynamic 4x4 or 2x2 based on Stride) with Filling Animation */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Feature Map Output ({outputDim}×{outputDim})
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              {activeCycle + 1}/{totalSteps} filled
            </span>
          </div>

          {/* Dynamic Output Grid (4x4 or 2x2) */}
          <div 
            className={`grid gap-1.5 p-1.5 bg-slate-800/90 rounded-xl border border-slate-700 w-36 h-36 shadow-inner relative ${
              outputDim === 2 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-4 grid-rows-4'
            }`}
          >
            {outputGrid.map((val, i) => {
              const isCurrent = i === activeCycle;
              // If hovering, show up to current windowStep, or highlight hovered
              const isComputed = i <= windowStep || (hoveredFeatureCell !== null && i <= hoveredFeatureCell);

              return (
                <div 
                  key={i} 
                  onMouseEnter={() => setHoveredFeatureCell(i)}
                  onMouseLeave={() => setHoveredFeatureCell(null)}
                  onClick={() => {
                    setIsPlaying(false);
                    setWindowStep(i);
                  }}
                  title={`Feature cell [${Math.floor(i / outputDim)}, ${i % outputDim}]: ${val.toFixed(2)} (Click to jump)`}
                  className={`flex items-center justify-center font-mono font-bold rounded cursor-pointer transition-all duration-200 select-none ${
                    outputDim === 2 ? 'text-xs p-2' : 'text-[10px]'
                  } ${
                    isCurrent 
                      ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.8)] z-10 scale-105 ring-2 ring-emerald-300' 
                      : isComputed 
                        ? 'bg-emerald-500/25 text-emerald-300 hover:bg-emerald-500/40' 
                        : 'bg-slate-900/90 text-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {isComputed ? (
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      {val.toFixed(1)}
                    </motion.span>
                  ) : (
                    <span className="text-slate-800 text-[8px]">·</span>
                  )}
                </div>
              );
            })}
          </div>

          <span className="text-[9.5px] text-slate-500 font-mono">
            Hover or click cells to inspect window
          </span>
        </div>

      </div>
    </div>
  );
};
