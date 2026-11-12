import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, Scan, Sparkles } from 'lucide-react';
import { DataSource } from '../../types';
import {
  CNNSampleImage,
  CNN_SAMPLES_BY_DATASET,
  RealImageIllustration,
} from './CNNImageDigitizer';

interface CNNUnifiedConvolutionProps {
  dataSource?: DataSource;
  selectedSample: CNNSampleImage;
  onSelectSample: (sample: CNNSampleImage) => void;
  hoveredCellIdx: number | null;
  onHoverCell: (idx: number | null) => void;
  isPlaying?: boolean;
  step: number;
  stride?: 1 | 2 | 3;
  onScanStateChange?: (isScanning: boolean) => void;
  onOpenGlossary?: () => void;
}

export const CNNUnifiedConvolution: React.FC<CNNUnifiedConvolutionProps> = ({
  dataSource,
  selectedSample,
  onSelectSample,
  hoveredCellIdx,
  onHoverCell,
  isPlaying = false,
  step: globalStep,
  stride = 1,
  onScanStateChange,
  onOpenGlossary,
}) => {
  // Determine sample list based on dataset
  const datasetKey = useMemo(() => {
    if (dataSource?.includes('CIFAR')) return 'cifar';
    if (dataSource?.includes('Medical')) return 'xray';
    return 'mnist';
  }, [dataSource]);

  const samples = CNN_SAMPLES_BY_DATASET[datasetKey] || CNN_SAMPLES_BY_DATASET.mnist;

  // Track scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const scannedSampleIdRef = useRef<string | null>(null);
  const onScanStateChangeRef = useRef(onScanStateChange);

  useEffect(() => {
    onScanStateChangeRef.current = onScanStateChange;
  }, [onScanStateChange]);

  // Reset scan flag when switching samples while paused
  useEffect(() => {
    if (!isPlaying && scannedSampleIdRef.current !== selectedSample.id) {
      setHasScanned(false);
      setScanProgress(0);
    }
  }, [selectedSample.id, isPlaying]);

  // Run 1-pass laser sweep across the optical image when playback starts or sample changes while playing
  useEffect(() => {
    if (!isPlaying) {
      setIsScanning(false);
      onScanStateChangeRef.current?.(false);
      return;
    }

    if (scannedSampleIdRef.current === selectedSample.id) {
      setHasScanned(true);
      setScanProgress(1);
      onScanStateChangeRef.current?.(false);
      return;
    }

    setIsScanning(true);
    setHasScanned(false);
    onScanStateChangeRef.current?.(true);
    setScanProgress(0);

    const start = performance.now();
    const duration = 1000;
    let rafId: number;
    let cancelled = false;

    const stepAnim = (time: number) => {
      if (cancelled) return;
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / duration);
      setScanProgress(progress);

      if (progress < 1) {
        rafId = requestAnimationFrame(stepAnim);
      } else {
        scannedSampleIdRef.current = selectedSample.id;
        setHasScanned(true);
        setIsScanning(false);
        onScanStateChangeRef.current?.(false);
      }
    };

    rafId = requestAnimationFrame(stepAnim);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [isPlaying, selectedSample.id]);

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

  // Sliding window position (driven by training playback or interactive cell selection)
  const [windowStep, setWindowStep] = useState(0);
  const [hoveredFeatureCell, setHoveredFeatureCell] = useState<number | null>(null);

  // Advance sliding window automatically when training is running (after scan finishes)
  useEffect(() => {
    if (!isPlaying || isScanning) return;

    const timer = setInterval(() => {
      setWindowStep((prev) => (prev >= totalSteps - 1 ? 0 : prev + 1));
    }, 800);

    return () => clearInterval(timer);
  }, [isPlaying, isScanning, totalSteps]);

  // Reset window when global simulation is reset
  useEffect(() => {
    if (globalStep === 0 && !isPlaying) {
      setWindowStep(0);
      setHoveredFeatureCell(null);
    }
  }, [globalStep, isPlaying]);

  // Reset windowStep if stride or sample changes
  useEffect(() => {
    setWindowStep(0);
    setHoveredFeatureCell(null);
  }, [stride, selectedSample.id]);

  // Active sliding window cycle
  const rawCycle = hoveredFeatureCell !== null ? hoveredFeatureCell : windowStep;
  const activeCycle = Math.min(rawCycle, totalSteps - 1);

  // Output grid coordinate (ox, oy)
  const ox = activeCycle % outputDim;
  const oy = Math.floor(activeCycle / outputDim);

  // Top-left pixel coordinate on the 6x6 grid
  const kx = validOffsets[ox] ?? 0;
  const ky = validOffsets[oy] ?? 0;

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
        s += (selectedSample.grid[idx] ?? 0) * kernel[i * 3 + j];
      }
    }
    return { sum: s, activeCells: cells };
  }, [selectedSample.grid, kernel, kx, ky]);

  // Dynamic Output Feature Map
  const outputGrid = useMemo(() => {
    const out = new Array(totalSteps).fill(0);
    for (let r = 0; r < outputDim; r++) {
      for (let c = 0; c < outputDim; c++) {
        const startX = validOffsets[c];
        const startY = validOffsets[r];
        let s = 0;
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            s += (selectedSample.grid[(startY + i) * 6 + (startX + j)] ?? 0) * kernel[i * 3 + j];
          }
        }
        out[r * outputDim + c] = s;
      }
    }
    return out;
  }, [selectedSample.grid, kernel, outputDim, totalSteps, validOffsets]);

  const activeScanCol = isScanning ? Math.min(5, Math.floor(scanProgress * 6)) : -1;

  return (
    <div
      id="tour-cnn-filter"
      className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl z-20 flex flex-col gap-4"
    >
      {/* Unified Header (AUDIT-10: Zero-Pill Discipline for Stage Headers & Static Metadata) */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/90 pb-3 gap-3">
        <div className="flex items-center gap-2 flex-wrap font-mono">
          <span className={`w-2 h-2 rounded-full bg-indigo-400 ${isPlaying ? 'animate-pulse' : ''}`} />
          <h4 className="text-xs font-bold text-slate-200 tracking-wide uppercase">
            01. Optical Scan & 3×3 Convolution
          </h4>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-400">
            6×6 Tensor → {outputDim}×{outputDim} Map
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-400">
            Stride {stride}px
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-400">
            Window ({kx}, {ky})
          </span>
        </div>

        {/* Clean unboxed inline status indicator (Zero decorative pill boxes) */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {isScanning ? (
            <span className="text-cyan-400 flex items-center gap-1.5 font-medium">
              <Scan className="w-3.5 h-3.5 animate-spin" />
              Scanning Optical Pixels ({Math.round(scanProgress * 100)}%)
            </span>
          ) : isPlaying ? (
            <span className="text-indigo-300 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Training Synced · Step {activeCycle + 1}/{totalSteps}
            </span>
          ) : (
            <span className="text-slate-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Click cell to inspect
            </span>
          )}
        </div>
      </div>

      {/* Dataset Sample Selector Thumbnails */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">Input Sample:</span>
        {samples.map((s) => {
          const isSelected = s.id === selectedSample.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSample(s)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all text-left shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-500/20 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <RealImageIllustration type={s.previewType} className="w-7 h-7" />
              <div className="flex flex-col">
                <span className="text-xs font-medium">{s.name}</span>
                <span className="text-[9px] opacity-70 font-mono">{s.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Unified Horizontal Flow (AUDIT-01 & AUDIT-09: Single Outer Card with 1px Hairline Dividers) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-0 lg:divide-x lg:divide-slate-800/70 items-center py-2">
        
        {/* Step 1: Raw Optical Sensor (3 cols) */}
        <div className="lg:col-span-3 flex flex-col items-center text-center gap-2 px-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            1. Optical Sensor
          </span>

          {/* Raw image preview with laser scanner */}
          <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-slate-700/80 shadow-md group">
            <RealImageIllustration type={selectedSample.previewType} className="w-full h-full" />

            {/* Laser scanning line */}
            {isScanning && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,1)] z-20 pointer-events-none"
                style={{ left: `${scanProgress * 100}%` }}
              />
            )}

            {/* Glowing sweep overlay */}
            {isScanning && (
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/25 to-transparent pointer-events-none z-10"
                style={{ width: `${scanProgress * 100}%` }}
              />
            )}

            {/* Highlight corresponding pixel cell on hover */}
            {hoveredCellIdx !== null && (
              <div
                className="absolute border-2 border-indigo-400 bg-indigo-500/40 pointer-events-none z-30 transition-all shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                style={{
                  left: `${(hoveredCellIdx % 6) * (100 / 6)}%`,
                  top: `${Math.floor(hoveredCellIdx / 6) * (100 / 6)}%`,
                  width: `${100 / 6}%`,
                  height: `${100 / 6}%`,
                }}
              />
            )}

            {/* Interactive 6x6 pixel grid overlay */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 z-25">
              {Array.from({ length: 36 }).map((_, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => onHoverCell(idx)}
                  onMouseLeave={() => onHoverCell(null)}
                  className="cursor-crosshair w-full h-full transition-colors hover:bg-indigo-400/20"
                  title={`Pixel [${Math.floor(idx / 6)}, ${idx % 6}]: ${
                    selectedSample.grid[idx]?.toFixed(2) ?? '0.00'
                  }`}
                />
              ))}
            </div>
          </div>

          <span className="text-[9.5px] text-slate-400 leading-tight max-w-[190px]">
            {selectedSample.description}
          </span>
        </div>

        {/* Step 2: SINGLE 6×6 Tensor Grid + Live 3×3 Sliding Window + Integrated Quantization (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center text-center gap-2 px-3">
          <div className="flex items-center justify-between w-full max-w-[210px]">
            <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              2. 6×6 Tensor + 3×3 Window
            </span>
            <span className="text-[9px] font-mono text-cyan-400">
              Quantized [0, 1]
            </span>
          </div>

          {/* Unified 6x6 Matrix with Active Receptive Field Window */}
          <div className="relative p-1 bg-slate-950/90 rounded-xl border border-slate-800/90 shadow-inner w-48 h-48 overflow-hidden">
            <div className="grid grid-cols-6 grid-rows-6 gap-0.5 w-full h-full">
              {selectedSample.grid.map((val, i) => {
                const isActiveInWindow = activeCells.has(i);
                const isHovered = hoveredCellIdx === i;
                const x = i % 6;
                const y = Math.floor(i / 6);
                const cellProgress = (x + y * 0.15) / 6;
                const isColumnActive = isScanning && x === activeScanCol;
                const isRevealed = hasScanned || isHovered || (isScanning && scanProgress >= cellProgress);

                return (
                  <div
                    key={i}
                    onMouseEnter={() => onHoverCell(i)}
                    onMouseLeave={() => onHoverCell(null)}
                    className={`relative flex items-center justify-center rounded-[2px] transition-colors cursor-crosshair ${
                      isHovered
                        ? 'bg-indigo-500 text-white font-bold ring-1 ring-white z-30'
                        : isActiveInWindow
                        ? 'bg-indigo-600/90 text-white font-bold ring-1 ring-cyan-400/50 z-10'
                        : val > 0.5
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-950/90 text-slate-600'
                    }`}
                    style={{
                      opacity: isRevealed ? 1 : isScanning ? 0.2 : 0.45,
                    }}
                    title={`Tensor cell [${y}, ${x}]: ${val.toFixed(2)}`}
                  >
                    <span className="text-[8px] font-mono">
                      {val.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Smooth Spring Sliding Window Box over the 3x3 active receptive field */}
            <motion.div
              className="absolute border-2 border-cyan-400 bg-cyan-400/15 rounded pointer-events-none z-20 shadow-[0_0_12px_rgba(34,211,238,0.7)] ring-1 ring-white/50"
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

          <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-sm bg-cyan-400/40 border border-cyan-400 inline-block" />
            <span>Active Window: [X: {kx}..{kx + 2}, Y: {ky}..{ky + 2}]</span>
          </div>
        </div>

        {/* Step 3: Kernel & Live Dot Product (2 cols - AUDIT-09: Direct Hairline Column, Zero Inner Card) */}
        <div className="lg:col-span-2 flex flex-col items-center gap-2.5 px-3 w-full">
          <div className="flex items-center justify-between w-full border-b border-slate-800/80 pb-1">
            <span className="text-[10px] font-semibold text-slate-300">
              3. Filter Kernel
            </span>
            <span className="text-[8.5px] font-mono text-cyan-400">3×3 W</span>
          </div>

          {/* 3x3 Filter Kernel */}
          <div className="grid grid-cols-3 gap-0.5 p-1 bg-slate-950/90 rounded border border-slate-800/80">
            {kernel.map((w, idx) => (
              <div
                key={idx}
                className="w-4 h-4 flex items-center justify-center text-[8px] font-mono font-bold bg-slate-800 text-indigo-300 rounded-[2px]"
              >
                {w}
              </div>
            ))}
          </div>

          {/* Live Calculated Dot Product */}
          <div className="w-full text-center bg-indigo-500/10 px-2 py-1.5 rounded-lg border border-indigo-500/25">
            <span className="text-slate-400 text-[8.5px] block font-mono">Dot Product Σ:</span>
            <motion.span
              key={`${sum.toFixed(2)}-${activeCycle}`}
              initial={{ scale: 1.2, color: '#38bdf8' }}
              animate={{ scale: 1, color: '#34d399' }}
              transition={{ duration: 0.15 }}
              className="text-emerald-400 font-bold text-sm inline-block font-mono"
            >
              {sum.toFixed(2)}
            </motion.span>
          </div>

          <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
            <span>Cell ({ox}, {oy})</span>
            <ArrowRight className="w-3 h-3 text-indigo-400" />
          </div>
        </div>

        {/* Step 4: Output Feature Map (2 cols) */}
        <div className="lg:col-span-2 flex flex-col items-center gap-2 px-3 w-full">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              4. Feature Map
            </span>
            <span className="text-[8.5px] font-mono text-slate-500">
              {activeCycle + 1}/{totalSteps}
            </span>
          </div>

          {/* Dynamic Output Grid (4x4 or 2x2) */}
          <div
            className={`grid gap-1 p-1.5 bg-slate-950/90 rounded-xl border border-slate-800/90 w-36 h-36 shadow-inner relative ${
              outputDim === 2 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-4 grid-rows-4'
            }`}
          >
            {outputGrid.map((val, i) => {
              const isCurrent = i === activeCycle;
              const isComputed = i <= activeCycle;

              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredFeatureCell(i)}
                  onMouseLeave={() => setHoveredFeatureCell(null)}
                  onClick={() => setWindowStep(i)}
                  title={`Feature cell [${Math.floor(i / outputDim)}, ${i % outputDim}]: ${val.toFixed(2)} (Click to jump)`}
                  className={`flex items-center justify-center font-mono font-bold rounded cursor-pointer transition-all duration-150 select-none ${
                    outputDim === 2 ? 'text-xs' : 'text-[9.5px]'
                  } ${
                    isCurrent
                      ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.8)] z-10 scale-105 ring-2 ring-emerald-300'
                      : isComputed
                      ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/35'
                      : 'bg-slate-950/80 text-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {isComputed ? (
                    val.toFixed(1)
                  ) : (
                    <span className="text-slate-800 text-[8px]">·</span>
                  )}
                </div>
              );
            })}
          </div>

          <span className="text-[8.5px] text-slate-500 font-mono text-center">
            Click any cell to inspect
          </span>
        </div>

      </div>
    </div>
  );
};
