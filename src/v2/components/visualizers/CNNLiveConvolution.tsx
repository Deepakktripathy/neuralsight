import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface CNNLiveConvolutionProps {
  step: number;
  dataSource?: string;
  sampleGrid?: number[];
  sampleName?: string;
}

export const CNNLiveConvolution: React.FC<CNNLiveConvolutionProps> = ({ step, dataSource, sampleGrid, sampleName }) => {
  const cycle = step % 16;
  const kx = cycle % 4; // kernel top-left X (0 to 3)
  const ky = Math.floor(cycle / 4); // kernel top-left Y (0 to 3)

  // 6x6 pixel patterns per dataset
  const patterns: Record<string, number[]> = {
    // Digit '3'
    mnist: [
      0, 0, 1, 1, 0, 0,
      0, 0, 0, 1, 0, 0,
      0, 0, 1, 1, 0, 0,
      0, 0, 0, 1, 0, 0,
      0, 0, 1, 1, 0, 0,
      0, 0, 0, 0, 0, 0
    ],
    // Automobile / Airplane silhouette
    cifar: [
      0, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1,
      1, 0, 1, 1, 0, 1,
      1, 1, 1, 1, 1, 1,
      0, 1, 0, 0, 1, 0,
      0, 0, 0, 0, 0, 0
    ],
    // Medical chest X-ray rib cages & bone spine
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

  // 3x3 Edge-detection-like kernel
  const kernel = [ 
    0,  1,  0,
   -1,  0,  1,
    0, -1,  0
  ];

  let sum = 0;
  const activeCells = new Set<number>();
  
  for(let i = 0; i < 3; i++) {
    for(let j = 0; j < 3; j++) {
      const gx = kx + j;
      const gy = ky + i;
      const idx = gy * 6 + gx;
      activeCells.add(idx);
      sum += grid[idx] * kernel[i * 3 + j];
    }
  }

  const outputGrid = useMemo(() => {
    const out = new Array(16).fill(0);
    for (let cy = 0; cy < 4; cy++) {
      for (let cx = 0; cx < 4; cx++) {
        let s = 0;
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            s += grid[(cy + i) * 6 + (cx + j)] * kernel[i * 3 + j];
          }
        }
        out[cy * 4 + cx] = s;
      }
    }
    return out;
  }, [grid, kernel]);

  return (
    <div className="w-full max-w-5xl bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm shadow-xl z-20" id="tour-cnn-filter">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
            Stage 2: Live 3×3 Convolution Kernel & Dot Product Math
          </h4>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
            Sliding Window
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Sample: <strong className="text-indigo-300">{sampleName || 'Input'}</strong> (6×6 → 4×4)
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-around gap-6">
        
        {/* Source Grid (6x6) */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-medium text-indigo-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {sampleName ? `${sampleName} (6×6 Grid)` : dataSource ? `${dataSource.split(' ')[0]} (6×6)` : 'Input Image (6×6)'}
          </span>
          <div className="grid grid-cols-6 gap-0.5 p-1 bg-slate-800 rounded-md border border-slate-700 relative w-36 h-36 overflow-hidden shadow-inner">
            {grid.map((val, i) => {
              const isActive = activeCells.has(i);

              return (
                <div 
                  key={i} 
                  className={`relative flex items-center justify-center transition-colors duration-200 ${
                    isActive ? 'z-10 shadow-[inset_0_0_0_2px_rgba(99,102,241,1)] bg-indigo-600' : 'bg-slate-900'
                  }`}
                >
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-[8.5px] font-mono font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}
                  >
                    {val.toFixed(1)}
                  </motion.span>
                </div>
              );
            })}
          </div>
          <span className="text-[9px] text-slate-500 font-mono">3×3 active receptive field</span>
        </div>

        {/* Math Visualization */}
        <div className="flex flex-col items-center gap-2.5 w-60 shrink-0 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-300 text-center leading-tight">
            Element-Wise Multiplication & Sum
          </span>
          <span className="text-[10px] text-slate-500 text-center font-mono">
            {'Σ (Pixel[i,j] × Filter[i,j])'}
          </span>
          <div className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-3 py-2 rounded-lg border border-indigo-500/30 text-center w-full transition-opacity duration-500">
            <span className="text-slate-400 text-[10px] block">Calculated Dot Product:</span>
            <span className="text-emerald-400 font-bold text-base mt-0.5 inline-block">{sum.toFixed(2)}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-400" />
        </div>

        {/* Output Grid (4x4) */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-medium text-emerald-400">
            Feature Map Output (4×4)
          </span>
          <div className="grid grid-cols-4 gap-0.5 p-1 bg-slate-800 rounded-md border border-slate-700 w-28 h-28 shadow-inner">
            {outputGrid.map((val, i) => {
              const isCurrent = i === cycle;
              const isComputed = i <= cycle;
              return (
                <div 
                  key={i} 
                  className={`flex items-center justify-center text-[9px] font-mono font-bold transition-colors duration-200 ${
                    isCurrent ? 'bg-emerald-500 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] z-10 scale-105' : 
                    isComputed ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-900 text-slate-700'
                  }`}
                >
                  {isComputed ? val.toFixed(1) : ''}
                </div>
              );
            })}
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Feature activation cells</span>
        </div>
      </div>
    </div>
  );
};