import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Scan, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { DataSource } from '../../types';
import { InfoTooltip } from '../InfoTooltip';

export interface CNNSampleImage {
  id: string;
  name: string;
  label: string;
  classIndex: number;
  description: string;
  // 6x6 intensity grid values (0.00 to 1.00)
  grid: number[];
  // SVG drawing representation
  previewType: 'mnist_3' | 'mnist_7' | 'mnist_0' | 'cifar_car' | 'cifar_plane' | 'cifar_ship' | 'xray_normal' | 'xray_pneumonia' | 'xray_cardio';
}

export const CNN_SAMPLES_BY_DATASET: Record<string, CNNSampleImage[]> = {
  mnist: [
    {
      id: 'mnist_3',
      name: 'Digit 3',
      label: 'Class 3 (Handwritten)',
      classIndex: 3,
      description: 'Handwritten digit with two curved strokes and horizontal junction',
      previewType: 'mnist_3',
      grid: [
        0.00, 0.12, 0.85, 0.92, 0.15, 0.00,
        0.00, 0.00, 0.18, 0.95, 0.22, 0.00,
        0.00, 0.25, 0.82, 0.90, 0.05, 0.00,
        0.00, 0.00, 0.15, 0.96, 0.20, 0.00,
        0.00, 0.10, 0.78, 0.92, 0.14, 0.00,
        0.00, 0.00, 0.00, 0.00, 0.00, 0.00
      ]
    },
    {
      id: 'mnist_7',
      name: 'Digit 7',
      label: 'Class 7 (Handwritten)',
      classIndex: 7,
      description: 'High top horizontal bar with steep diagonal descending stroke',
      previewType: 'mnist_7',
      grid: [
        0.10, 0.92, 0.95, 0.91, 0.84, 0.12,
        0.00, 0.12, 0.24, 0.58, 0.94, 0.10,
        0.00, 0.00, 0.19, 0.88, 0.38, 0.00,
        0.00, 0.00, 0.74, 0.68, 0.00, 0.00,
        0.00, 0.32, 0.90, 0.21, 0.00, 0.00,
        0.00, 0.45, 0.79, 0.00, 0.00, 0.00
      ]
    },
    {
      id: 'mnist_0',
      name: 'Digit 0',
      label: 'Class 0 (Handwritten)',
      classIndex: 0,
      description: 'Closed elliptical loop with hollow central interior',
      previewType: 'mnist_0',
      grid: [
        0.00, 0.65, 0.92, 0.90, 0.60, 0.00,
        0.25, 0.95, 0.05, 0.05, 0.92, 0.22,
        0.55, 0.91, 0.00, 0.00, 0.94, 0.48,
        0.52, 0.93, 0.00, 0.00, 0.91, 0.50,
        0.20, 0.94, 0.08, 0.08, 0.93, 0.20,
        0.00, 0.62, 0.91, 0.89, 0.58, 0.00
      ]
    }
  ],
  cifar: [
    {
      id: 'cifar_car',
      name: 'Automobile',
      label: 'Class: Automobile',
      classIndex: 1,
      description: 'Side profile with curved cabin roof, headlights, and wheel chassis',
      previewType: 'cifar_car',
      grid: [
        0.00, 0.00, 0.62, 0.74, 0.00, 0.00,
        0.00, 0.52, 0.92, 0.94, 0.58, 0.00,
        0.78, 0.95, 0.98, 0.96, 0.92, 0.70,
        0.92, 0.96, 0.95, 0.95, 0.92, 0.81,
        0.12, 0.84, 0.08, 0.08, 0.82, 0.10,
        0.00, 0.00, 0.00, 0.00, 0.00, 0.00
      ]
    },
    {
      id: 'cifar_plane',
      name: 'Airplane',
      label: 'Class: Airplane',
      classIndex: 0,
      description: 'Cylindrical aircraft fuselage with extended horizontal swept wings',
      previewType: 'cifar_plane',
      grid: [
        0.00, 0.00, 0.88, 0.00, 0.00, 0.00,
        0.00, 0.15, 0.94, 0.18, 0.00, 0.00,
        0.72, 0.85, 0.98, 0.84, 0.71, 0.12,
        0.00, 0.10, 0.92, 0.10, 0.00, 0.00,
        0.00, 0.28, 0.90, 0.35, 0.00, 0.00,
        0.00, 0.42, 0.00, 0.42, 0.00, 0.00
      ]
    },
    {
      id: 'cifar_ship',
      name: 'Ship / Vessel',
      label: 'Class: Ship',
      classIndex: 8,
      description: 'Slanted maritime hull floating over horizontal surface reflection',
      previewType: 'cifar_ship',
      grid: [
        0.00, 0.00, 0.72, 0.00, 0.00, 0.00,
        0.00, 0.00, 0.84, 0.68, 0.00, 0.00,
        0.12, 0.22, 0.86, 0.92, 0.28, 0.00,
        0.65, 0.94, 0.96, 0.94, 0.90, 0.42,
        0.18, 0.78, 0.88, 0.80, 0.58, 0.12,
        0.32, 0.40, 0.34, 0.42, 0.31, 0.38
      ]
    }
  ],
  xray: [
    {
      id: 'xray_normal',
      name: 'Normal Thorax',
      label: 'Class: Normal (Clear)',
      classIndex: 0,
      description: 'Clear radiolucent lung fields with symmetric rib cage borders',
      previewType: 'xray_normal',
      grid: [
        0.12, 0.62, 0.22, 0.22, 0.60, 0.10,
        0.22, 0.82, 0.32, 0.30, 0.81, 0.20,
        0.15, 0.72, 0.42, 0.40, 0.70, 0.12,
        0.20, 0.64, 0.52, 0.51, 0.62, 0.21,
        0.30, 0.80, 0.64, 0.62, 0.80, 0.30,
        0.00, 0.12, 0.72, 0.70, 0.10, 0.00
      ]
    },
    {
      id: 'xray_pneumonia',
      name: 'Pneumonia Infiltrate',
      label: 'Class: Pneumonia (Infiltrate)',
      classIndex: 1,
      description: 'Focal alveolar consolidation opacity in right middle lobe',
      previewType: 'xray_pneumonia',
      grid: [
        0.12, 0.62, 0.22, 0.22, 0.60, 0.10,
        0.22, 0.82, 0.32, 0.30, 0.92, 0.55,
        0.15, 0.72, 0.42, 0.52, 0.96, 0.84,
        0.20, 0.64, 0.52, 0.70, 0.98, 0.92,
        0.30, 0.80, 0.64, 0.65, 0.86, 0.72,
        0.00, 0.12, 0.72, 0.70, 0.10, 0.00
      ]
    },
    {
      id: 'xray_cardio',
      name: 'Cardiomegaly',
      label: 'Class: Cardiomegaly',
      classIndex: 2,
      description: 'Transverse cardiac diameter exceeds 50% of cardiothoracic ratio',
      previewType: 'xray_cardio',
      grid: [
        0.12, 0.62, 0.22, 0.22, 0.60, 0.10,
        0.22, 0.82, 0.42, 0.40, 0.81, 0.20,
        0.15, 0.72, 0.74, 0.82, 0.72, 0.12,
        0.20, 0.64, 0.86, 0.94, 0.75, 0.21,
        0.30, 0.72, 0.92, 0.95, 0.84, 0.32,
        0.00, 0.12, 0.72, 0.70, 0.10, 0.00
      ]
    }
  ]
};

// Render realistic visual representation of raw image
export const RealImageIllustration: React.FC<{ type: CNNSampleImage['previewType']; className?: string }> = ({ type, className = "w-16 h-16" }) => {
  switch (type) {
    case 'mnist_3':
      return (
        <div className={`${className} bg-black rounded border border-slate-700 flex items-center justify-center p-1 relative overflow-hidden select-none`}>
          <svg viewBox="0 0 32 32" className="w-full h-full text-white fill-current filter drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]">
            <path d="M 9 7 C 9 6, 21 6, 21 7 C 21 11, 16 13, 16 14 C 20 14, 23 17, 23 21 C 23 26, 10 26, 9 24 C 9 22, 18 24, 18 21 C 18 17, 12 17, 12 15 C 15 15, 17 12, 17 9 C 17 8, 12 8, 9 7 Z" />
          </svg>
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-slate-500">28×28</span>
        </div>
      );
    case 'mnist_7':
      return (
        <div className={`${className} bg-black rounded border border-slate-700 flex items-center justify-center p-1 relative overflow-hidden select-none`}>
          <svg viewBox="0 0 32 32" className="w-full h-full text-white fill-current filter drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]">
            <path d="M 7 8 L 24 8 L 24 10 L 17 26 L 13 26 L 19 12 L 8 12 Z" />
          </svg>
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-slate-500">28×28</span>
        </div>
      );
    case 'mnist_0':
      return (
        <div className={`${className} bg-black rounded border border-slate-700 flex items-center justify-center p-1 relative overflow-hidden select-none`}>
          <svg viewBox="0 0 32 32" className="w-full h-full text-white fill-current filter drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]">
            <path d="M 16 6 C 22 6, 24 11, 24 16 C 24 21, 22 26, 16 26 C 10 26, 8 21, 8 16 C 8 11, 10 6, 16 6 Z M 16 10 C 13 10, 12 12, 12 16 C 12 20, 13 22, 16 22 C 19 22, 20 20, 20 16 C 20 12, 19 10, 16 10 Z" />
          </svg>
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-slate-500">28×28</span>
        </div>
      );
    case 'cifar_car':
      return (
        <div className={`${className} bg-slate-900 rounded border border-amber-500/30 flex items-center justify-center p-1 relative overflow-hidden select-none`}>
          <div className="absolute inset-0 bg-gradient-to-b from-sky-950 via-slate-900 to-amber-950/40 opacity-70" />
          <svg viewBox="0 0 32 32" className="w-full h-full relative z-10">
            {/* Ground */}
            <line x1="2" y1="25" x2="30" y2="25" stroke="#475569" strokeWidth="1.5" />
            {/* Car body */}
            <path d="M 5 21 L 8 15 L 14 13 L 22 13 L 26 17 L 29 19 L 29 22 L 5 22 Z" fill="#ef4444" />
            {/* Windows */}
            <path d="M 9 16 L 14 14.5 L 14 18 L 9 18 Z M 16 14.5 L 21 14.5 L 24 18 L 16 18 Z" fill="#38bdf8" opacity="0.9" />
            {/* Wheels */}
            <circle cx="10" cy="22" r="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="23" cy="22" r="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
          </svg>
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-amber-300/60">32×32 RGB</span>
        </div>
      );
    case 'cifar_plane':
      return (
        <div className={`${className} bg-slate-900 rounded border border-amber-500/30 flex items-center justify-center p-1 relative overflow-hidden select-none`}>
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-sky-950 to-slate-900 opacity-80" />
          <svg viewBox="0 0 32 32" className="w-full h-full relative z-10">
            {/* Plane fuselage */}
            <ellipse cx="16" cy="16" rx="11" ry="3.5" fill="#f8fafc" />
            {/* Wings */}
            <polygon points="15,16 11,6 18,16" fill="#cbd5e1" />
            <polygon points="15,16 11,26 18,16" fill="#94a3b8" />
            {/* Tail */}
            <polygon points="6,16 4,11 8,16" fill="#cbd5e1" />
          </svg>
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-amber-300/60">32×32 RGB</span>
        </div>
      );
    case 'cifar_ship':
      return (
        <div className={`${className} bg-slate-900 rounded border border-amber-500/30 flex items-center justify-center p-1 relative overflow-hidden select-none`}>
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-blue-950 opacity-80" />
          <svg viewBox="0 0 32 32" className="w-full h-full relative z-10">
            {/* Ocean */}
            <path d="M 2 24 Q 8 22, 16 24 T 30 24 L 30 30 L 2 30 Z" fill="#1e3a8a" opacity="0.8" />
            {/* Ship Hull */}
            <polygon points="6,22 26,22 23,26 9,26" fill="#e2e8f0" />
            {/* Bridge / Cabin */}
            <rect x="13" y="15" width="7" height="7" fill="#f59e0b" />
            <rect x="16" y="11" width="2" height="4" fill="#64748b" />
          </svg>
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-amber-300/60">32×32 RGB</span>
        </div>
      );
    case 'xray_normal':
      return (
        <div className={`${className} bg-black rounded border border-cyan-500/30 flex items-center justify-center p-1 relative overflow-hidden select-none`}>
          <div className="absolute inset-0 bg-radial from-slate-800 via-slate-950 to-black opacity-90" />
          <svg viewBox="0 0 32 32" className="w-full h-full relative z-10">
            {/* Spine */}
            <line x1="16" y1="4" x2="16" y2="28" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 1" opacity="0.6" />
            {/* Bilateral lungs */}
            <ellipse cx="11" cy="16" rx="4" ry="7" fill="#0f172a" stroke="#64748b" strokeWidth="1" opacity="0.8" />
            <ellipse cx="21" cy="16" rx="4" ry="7" fill="#0f172a" stroke="#64748b" strokeWidth="1" opacity="0.8" />
            {/* Ribs */}
            <path d="M 12 11 Q 8 13, 10 16 M 12 15 Q 8 17, 10 20 M 20 11 Q 24 13, 22 16 M 20 15 Q 24 17, 22 20" stroke="#cbd5e1" strokeWidth="0.8" fill="none" opacity="0.7" />
            {/* Normal Heart */}
            <ellipse cx="17" cy="18" rx="2.5" ry="3.5" fill="#64748b" opacity="0.5" />
          </svg>
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-cyan-300/70">DICOM</span>
        </div>
      );
    case 'xray_pneumonia':
      return (
        <div className={`${className} bg-black rounded border border-cyan-500/30 flex items-center justify-center p-1 relative overflow-hidden select-none`}>
          <div className="absolute inset-0 bg-radial from-slate-800 via-slate-950 to-black opacity-90" />
          <svg viewBox="0 0 32 32" className="w-full h-full relative z-10">
            <line x1="16" y1="4" x2="16" y2="28" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 1" opacity="0.6" />
            <ellipse cx="11" cy="16" rx="4" ry="7" fill="#0f172a" stroke="#64748b" strokeWidth="1" opacity="0.8" />
            <ellipse cx="21" cy="16" rx="4" ry="7" fill="#0f172a" stroke="#64748b" strokeWidth="1" opacity="0.8" />
            {/* Consolidated Infiltrate Opacity in Right Lung */}
            <circle cx="22" cy="17" r="4.5" fill="#f8fafc" opacity="0.75" filter="blur(1px)" />
            <path d="M 12 11 Q 8 13, 10 16 M 20 11 Q 24 13, 22 16" stroke="#cbd5e1" strokeWidth="0.8" fill="none" opacity="0.7" />
          </svg>
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-rose-400">Opacity</span>
        </div>
      );
    case 'xray_cardio':
      return (
        <div className={`${className} bg-black rounded border border-cyan-500/30 flex items-center justify-center p-1 relative overflow-hidden select-none`}>
          <div className="absolute inset-0 bg-radial from-slate-800 via-slate-950 to-black opacity-90" />
          <svg viewBox="0 0 32 32" className="w-full h-full relative z-10">
            <line x1="16" y1="4" x2="16" y2="28" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 1" opacity="0.6" />
            <ellipse cx="10" cy="16" rx="3.5" ry="7" fill="#0f172a" stroke="#64748b" strokeWidth="1" opacity="0.7" />
            <ellipse cx="22" cy="16" rx="3.5" ry="7" fill="#0f172a" stroke="#64748b" strokeWidth="1" opacity="0.7" />
            {/* Enlarged Heart Silhouette (CTR > 0.5) */}
            <ellipse cx="17.5" cy="19" rx="6" ry="5" fill="#f1f5f9" opacity="0.7" />
          </svg>
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-amber-300">CTR &gt; 50%</span>
        </div>
      );
  }
};

interface CNNImageDigitizerProps {
  dataSource?: DataSource;
  onSelectSample: (sample: CNNSampleImage) => void;
  selectedSample: CNNSampleImage;
  hoveredCellIdx: number | null;
  onHoverCell: (idx: number | null) => void;
}

export const CNNImageDigitizer: React.FC<CNNImageDigitizerProps> = ({
  dataSource,
  onSelectSample,
  selectedSample,
  hoveredCellIdx,
  onHoverCell
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(1); // 0 to 1

  const datasetKey = useMemo(() => {
    if (dataSource?.includes('CIFAR')) return 'cifar';
    if (dataSource?.includes('Medical')) return 'xray';
    return 'mnist';
  }, [dataSource]);

  const samples = CNN_SAMPLES_BY_DATASET[datasetKey] || CNN_SAMPLES_BY_DATASET.mnist;

  // Trigger scanning laser animation
  const triggerScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const start = performance.now();
    const duration = 1200; // ms

    const stepAnim = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / duration);
      setScanProgress(progress);
      if (progress < 1) {
        requestAnimationFrame(stepAnim);
      } else {
        setIsScanning(false);
      }
    };
    requestAnimationFrame(stepAnim);
  };

  // Re-run scan when sample changes
  useEffect(() => {
    triggerScan();
  }, [selectedSample.id]);

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 sm:p-4 backdrop-blur-md shadow-2xl flex flex-col gap-3 w-full max-w-5xl">
      
      {/* Header bar: Dataset sample selector + action */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Scan className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200 block leading-tight">
              Dataset Ingestion & Digitization Pipeline
            </span>
            <span className="text-[10px] text-slate-400">
              Select a raw image to watch the model "swallow" visual pixels into numerical tensors
            </span>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={triggerScan}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/20"
        >
          <Scan className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning Pixels...' : 'Rescan Image'}</span>
        </button>
      </div>

      {/* Row of sample selector thumbnails */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">Samples:</span>
        {samples.map((s) => {
          const isSelected = s.id === selectedSample.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSample(s)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all text-left shrink-0 ${
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

      {/* Main Interactive Stage: [Real Image] -> [Laser Scan Animation] -> [2D Numerical Tensor] */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
        
        {/* Step 1: Raw Photometric Image (3 cols) */}
        <div className="md:col-span-3 flex flex-col items-center text-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            1. Raw Image (Human View)
          </span>

          {/* Large image preview with animated laser scanner */}
          <div className="relative w-28 h-28 rounded-lg overflow-hidden border-2 border-slate-700 shadow-lg group">
            <RealImageIllustration type={selectedSample.previewType} className="w-full h-full" />
            
            {/* Laser scanning line */}
            {isScanning && (
              <motion.div 
                className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,1)] z-20 pointer-events-none"
                style={{ left: `${scanProgress * 100}%` }}
              />
            )}

            {/* Glowing sweep overlay */}
            {isScanning && (
              <motion.div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/20 to-transparent pointer-events-none z-10"
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
                  height: `${100 / 6}%`
                }}
              />
            )}

            {/* Interactive 6x6 pixel grid overlay for bidirectional hover: hovering image cell highlights 2D tensor grid */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 z-25">
              {Array.from({ length: 36 }).map((_, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => onHoverCell(idx)}
                  onMouseLeave={() => onHoverCell(null)}
                  className="cursor-crosshair w-full h-full transition-colors hover:bg-indigo-400/20"
                  title={`Pixel [${Math.floor(idx / 6)}, ${idx % 6}]: ${selectedSample.grid[idx]?.toFixed(2) ?? '0.00'}`}
                />
              ))}
            </div>
          </div>

          <span className="text-[10px] text-slate-400 leading-tight max-w-[180px]">
            {selectedSample.description}
          </span>
        </div>

        {/* Transition Bridge: Optical Photons -> Quantized Float32 Tensor Stream */}
        <div className="md:col-span-2 flex flex-col items-center justify-center gap-1.5 text-center py-2 px-1">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider uppercase">
              Quantization
            </span>
            <InfoTooltip content="Quantization (Analog-to-Digital Conversion): Maps continuous physical light/photon intensities from the optical sensor into discrete, normalized floating-point numbers between 0.00 (black) and 1.00 (peak white) so the convolutional neural network can compute tensor math." />
          </div>
          
          {/* Directional Data Stream Pipeline (Image -> Tensor) */}
          <div className="w-full flex items-center justify-center relative my-1.5 overflow-hidden h-5">
            <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/40 via-cyan-500/80 to-indigo-500/90 rounded-full" />
            {/* Pulsing directional particles flowing from left to right */}
            <motion.div 
              className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]"
              animate={{ x: [-35, 35], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            />
            <motion.div 
              className="absolute w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,1)]"
              animate={{ x: [-35, 35], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', delay: 0.8 }}
            />
            <ArrowRight className="absolute right-0 w-3 h-3 text-indigo-400 pointer-events-none" />
          </div>

          {/* Formatted Mathematical & Scientific Normalization Badges */}
          <div className="flex flex-col items-center gap-1 text-[10px] font-mono leading-tight">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              Photons <span className="text-cyan-400 font-bold">→</span> Grayscale
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-cyan-300 font-semibold text-[9.5px]">
              Intensity <span className="text-slate-400 font-normal">I ∈</span> [0.00, 1.00]
            </span>
          </div>
        </div>

        {/* Step 2: 2D Numerical Tensor Grid (4 cols) */}
        <div className="md:col-span-4 flex flex-col items-center text-center gap-1.5">
          <div className="flex items-center justify-between w-full max-w-[210px]">
            <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              2. 2D Tensor Grid (Model View)
            </span>
            <span className="text-[9px] font-mono text-slate-500">6×6 Float32</span>
          </div>

          {/* The 6x6 numeric grid */}
          <div className="grid grid-cols-6 gap-1 p-1.5 bg-slate-900 rounded-lg border border-slate-700/80 shadow-inner w-52 h-52">
            {selectedSample.grid.map((val, i) => {
              const isHovered = hoveredCellIdx === i;
              const x = i % 6;
              const y = Math.floor(i / 6);
              
              // Fade in numbers according to scan progress if scanning
              const cellProgress = (x + y * 0.2) / 7;
              const isRevealed = !isScanning || scanProgress >= cellProgress;

              return (
                <motion.div
                  key={i}
                  onMouseEnter={() => onHoverCell(i)}
                  onMouseLeave={() => onHoverCell(null)}
                  className={`flex flex-col items-center justify-center rounded transition-all cursor-crosshair relative ${
                    isHovered 
                      ? 'bg-indigo-500 text-white font-bold shadow-[0_0_8px_rgba(99,102,241,0.8)] z-20 scale-105 ring-1 ring-white' 
                      : val > 0.5 
                        ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                        : val > 0.1 
                          ? 'bg-slate-900 text-slate-400 border border-slate-800/80' 
                          : 'bg-slate-950 text-slate-600 border border-slate-900'
                  }`}
                  style={{
                    backgroundColor: isHovered 
                      ? undefined 
                      : `rgba(99, 102, 241, ${val * 0.35 + 0.05})`
                  }}
                  animate={{
                    opacity: isRevealed ? 1 : 0.2,
                    scale: isRevealed ? 1 : 0.9
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={`text-[8.5px] font-mono leading-none ${isHovered ? 'text-white' : val > 0.4 ? 'text-slate-100 font-semibold' : 'text-slate-400'}`}>
                    {val.toFixed(2)}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <span className="text-[9px] text-slate-400">
            Hover over any numerical value to locate its pixel in the raw image
          </span>
        </div>

        {/* Step 3: Explanation & Downstream Feeding (3 cols) */}
        <div className="md:col-span-3 flex flex-col gap-2 p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-left">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>How CNN "Sees"</span>
          </div>

          <p className="text-[10px] text-slate-300 leading-relaxed">
            Neural networks do <strong>not</strong> see edges or colors directly. They ingest raw 2D numerical matrices where:
          </p>

          <ul className="text-[10px] text-slate-400 space-y-1 font-mono">
            <li className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-slate-950 border border-slate-700" />
              <span>0.00 = Deep Black / Background</span>
            </li>
            <li className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-indigo-500/50 border border-indigo-400" />
              <span>0.50 = Midtone / Boundary</span>
            </li>
            <li className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-indigo-400 border border-white" />
              <span>1.00 = Peak White / Bone / Ink</span>
            </li>
          </ul>

          <div className="mt-1 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Target Output:</span>
            <span className="font-mono text-emerald-400 font-semibold">{selectedSample.label}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
