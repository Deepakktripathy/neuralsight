import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Hyperparameters, Mode, UseCase, DataSource } from '../../types';
import { LayerTooltip } from '../LayerTooltip';
import { getArchitectureTooltip } from '../../utils/tooltips';
import { CNNLiveConvolution } from './CNNLiveConvolution';
import { CNNImageDigitizer, CNN_SAMPLES_BY_DATASET, CNNSampleImage } from './CNNImageDigitizer';

interface CNNVisualizerProps {
  hyperparams: Hyperparameters;
  step: number;
  mode: Mode;
  useCase: UseCase;
  dataSource?: DataSource;
}

export const CNNVisualizer: React.FC<CNNVisualizerProps> = ({ hyperparams, step, mode, useCase, dataSource }) => {
  const datasetKey = useMemo(() => {
    if (dataSource?.includes('CIFAR')) return 'cifar';
    if (dataSource?.includes('Medical')) return 'xray';
    return 'mnist';
  }, [dataSource]);

  const defaultSamples = CNN_SAMPLES_BY_DATASET[datasetKey] || CNN_SAMPLES_BY_DATASET.mnist;
  const [selectedSample, setSelectedSample] = useState<CNNSampleImage>(defaultSamples[0]);
  const [hoveredCellIdx, setHoveredCellIdx] = useState<number | null>(null);

  // Update selected sample when dataset changes
  useEffect(() => {
    const list = CNN_SAMPLES_BY_DATASET[datasetKey] || CNN_SAMPLES_BY_DATASET.mnist;
    setSelectedSample(list[0]);
  }, [datasetKey]);

  // Generate class labels according to dataset
  const classLabels = useMemo(() => {
    if (datasetKey === 'cifar') return ['Airplane', 'Automobile', 'Ship'];
    if (datasetKey === 'xray') return ['Normal', 'Pneumonia', 'Cardiomegaly'];
    return ['Digit 0', 'Digit 3', 'Digit 7'];
  }, [datasetKey]);

  // Generate CNN structure based on hyperparams
  const layersCount = Math.max(3, hyperparams.layers); // At least Input, Conv, Output
  
  const layers = useMemo(() => {
    const l = [];
    // Input layer (simulating a 2D image)
    l.push({ id: 'input', type: '2d', size: 5, label: 'Input Tensor' });
    
    // Hidden layers
    for (let i = 1; i < layersCount - 1; i++) {
      const type = i % 2 === 1 ? 'conv' : 'pool';
      const size = type === 'conv' ? 4 : 3;
      l.push({ id: `layer-${i}`, type, size, label: type === 'conv' ? 'Conv Layer' : 'Pooling' });
    }
    
    // Output layer
    l.push({ id: 'output', type: '1d', size: classLabels.length, label: 'Output Predictions' });
    return l;
  }, [layersCount, classLabels]);

  // Derive activation values based on current step, mode, and selected sample
  const getActivation = (layerIdx: number, nodeIdx: number) => {
    let act: number;
    if (layerIdx === layers.length - 1) {
      // Output layer: reflect selected sample
      const currentClassIdx = selectedSample.id.includes('3') ? 1 : selectedSample.id.includes('7') ? 2 : 0;
      const isTargetClass = nodeIdx === currentClassIdx;

      if (mode === 'Train') {
        const trainProgress = Math.min(1, (step % 40) / 25);
        act = isTargetClass 
          ? 0.4 + trainProgress * 0.55 + Math.sin(step + nodeIdx) * 0.05
          : Math.max(0.02, (1 - trainProgress) * 0.3 + Math.cos(step + nodeIdx) * 0.04);
      } else {
        // Inference: strong confident prediction
        act = isTargetClass ? 0.92 : (nodeIdx === 1 ? 0.05 : 0.03);
      }
    } else if (mode === 'Train') {
      act = Math.sin((step * 0.5) + layerIdx + nodeIdx) * 0.5 + 0.5;
    } else {
      const cycle = step % (layers.length * 15 + 20);
      const distance = Math.abs(cycle - layerIdx * 15);
      act = Math.max(0.1, Math.exp(-Math.pow(distance, 2) / 30));
    }

    if (mode === 'Train' && hyperparams.failureMode === 'Exploding Gradients') {
      if (step > 15) return Infinity;
      act = act * Math.pow(1.5, step / 5);
    } else if (mode === 'Train' && hyperparams.failureMode === 'Vanishing Gradients') {
      act = act * Math.pow(0.5, step / 10);
    }

    return act;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-4 overflow-y-auto relative bg-slate-950 gap-6">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

      {/* Stage 1: Real Image Ingestion & Digitization Pipeline */}
      <div className="w-full flex justify-center relative z-20">
        <CNNImageDigitizer
          dataSource={dataSource}
          selectedSample={selectedSample}
          onSelectSample={setSelectedSample}
          hoveredCellIdx={hoveredCellIdx}
          onHoverCell={setHoveredCellIdx}
        />
      </div>

      {/* Stage 2: Sliding 3x3 Convolution Math on Digits */}
      <div className="w-full flex justify-center relative z-20">
        <CNNLiveConvolution 
          step={step} 
          dataSource={dataSource} 
          sampleGrid={selectedSample.grid}
          sampleName={selectedSample.name}
        />
      </div>

      {/* Stage 3: Neural Network Propagation Pipeline */}
      <div className="w-full max-w-5xl bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm relative z-20 mb-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              Stage 3: Deep Feature Hierarchy & Classification
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Active Sample: <span className="text-indigo-300 font-semibold">{selectedSample.name}</span>
          </span>
        </div>

        <div className="flex items-center justify-between w-full relative">
          {layers.map((layer, lIdx) => (
            <React.Fragment key={layer.id}>
              <div className="flex flex-col items-center gap-4 relative z-10 hover:z-50">
                <LayerTooltip 
                  label={layer.label}
                  description={getArchitectureTooltip('CNN', layer.label)}
                  position={lIdx === 0 ? 'left' : lIdx >= layers.length - 2 ? 'right' : 'center'}
                />
                
                {layer.type === '2d' || layer.type === 'conv' || layer.type === 'pool' ? (
                  <div 
                    className="grid gap-1 p-2 bg-slate-900 rounded-lg border border-slate-800 shadow-lg"
                    style={{ gridTemplateColumns: `repeat(${layer.size}, minmax(0, 1fr))` }}
                    id={
                      layer.type === 'conv' || lIdx === 1
                        ? "tour-cnn-filter"
                        : (layer.type === 'pool' || (lIdx === 2 && layer.type !== '1d') ? "tour-cnn-pool" : undefined)
                    }
                  >
                    {Array.from({ length: layer.size * layer.size }).map((_, nIdx) => {
                      const rawAct = getActivation(lIdx, nIdx);
                      const isNaN = rawAct === Infinity;
                      const act = isNaN ? 1 : rawAct;
                      
                      // Node feature representations
                      let nodeContent = null;
                      if (lIdx === 0) {
                        // Display 5x5 sub-tensor of the digitized image
                        const gridVal = selectedSample.grid[nIdx] ?? 0.1;
                        nodeContent = (
                          <div 
                            className="w-full h-full flex items-center justify-center text-[7.5px] font-mono font-bold"
                            style={{ 
                              backgroundColor: `rgba(99, 102, 241, ${gridVal * 0.8 + 0.1})`,
                              color: gridVal > 0.4 ? '#ffffff' : '#94a3b8'
                            }}
                          >
                            {gridVal.toFixed(1)}
                          </div>
                        );
                      } else if (layer.label.includes('Conv') || layer.label.includes('Pool')) {
                        if (lIdx === 1 || lIdx === 2) {
                          const edgeType = nIdx % 4;
                          nodeContent = (
                            <div className="w-full h-full relative flex items-center justify-center opacity-80">
                              {edgeType === 0 && <div className="w-full h-0.5 bg-indigo-200" />}
                              {edgeType === 1 && <div className="w-0.5 h-full bg-indigo-200" />}
                              {edgeType === 2 && <div className="w-full h-0.5 bg-indigo-200 rotate-45" />}
                              {edgeType === 3 && <div className="w-full h-0.5 bg-indigo-200 -rotate-45" />}
                            </div>
                          );
                        } else {
                          const shapeType = nIdx % 3;
                          nodeContent = (
                            <div className="w-full h-full relative flex items-center justify-center opacity-80">
                              {shapeType === 0 && <div className="w-2.5 h-2.5 border border-indigo-200 rounded-full" />}
                              {shapeType === 1 && <div className="w-2 h-2 border border-indigo-200 rotate-45" />}
                              {shapeType === 2 && <div className="w-2 h-2 bg-indigo-200 rounded-full" />}
                            </div>
                          );
                        }
                      }

                      return (
                        <motion.div
                          key={nIdx}
                          className="w-5 h-5 sm:w-7 sm:h-7 rounded-sm relative group hover:z-50 cursor-crosshair overflow-hidden flex items-center justify-center border border-slate-700/60"
                          animate={{
                            backgroundColor: isNaN ? 'rgba(244, 63, 94, 0.6)' : `rgba(99, 102, 241, ${act * 0.4})`,
                            scale: mode === 'Train' && act > 0.8 ? 1.08 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {isNaN ? (
                            <span className="text-[9px] font-mono text-white font-bold">NaN</span>
                          ) : (
                            nodeContent
                          )}

                          {/* Hover Tooltip */}
                          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                            <div className="text-[10px] text-slate-300 flex flex-col gap-1">
                              <div className="flex justify-between gap-3">
                                <span>Activation</span>
                                <span className={`font-mono ${isNaN ? "text-rose-400 font-medium" : "text-indigo-300"}`}>
                                  {isNaN ? 'NaN' : act.toFixed(4)}
                                </span>
                              </div>
                              <div className="text-slate-500 text-[9px]">
                                {lIdx === 0 ? 'Ingested pixel scalar' : (lIdx < 3 ? 'Edge filter map' : 'High-level texture feature')}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  /* Output Layer with Real Class Labels */
                  <div className="flex flex-col gap-2 p-3 bg-slate-900 rounded-lg border border-slate-800 min-w-[140px]">
                    {classLabels.map((lbl, nIdx) => {
                      const act = getActivation(lIdx, nIdx);
                      const isPredicted = act > 0.5;
                      return (
                        <div key={lbl} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className={isPredicted ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                              {lbl}
                            </span>
                            <span className={isPredicted ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                              {(act * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <motion.div 
                              className={`h-full ${isPredicted ? 'bg-emerald-500' : 'bg-slate-600'}`}
                              animate={{ width: `${Math.min(100, act * 100)}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Connecting lines between layers */}
              {lIdx < layers.length - 1 && (
                <div className="relative flex-1 h-8 flex items-center justify-center mx-2 -z-10">
                  <div className="absolute w-full h-0.5 bg-gradient-to-r from-indigo-500/10 via-indigo-500/50 to-indigo-500/10" />
                  {mode === 'Train' && (
                    <motion.div 
                      className="absolute w-full h-0.5 bg-gradient-to-l from-rose-500/0 via-rose-500 to-rose-500/0"
                      animate={{
                        backgroundPosition: ['100% 0', '0% 0'],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      style={{ backgroundSize: '200% 100%' }}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Failure Mode Diagnostics Probes */}
        {hyperparams.failureMode === 'Vanishing Gradients' && mode === 'Train' && (
          <div className="absolute bottom-3 left-4 z-10 bg-slate-950/90 border border-rose-500/50 rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-3">
            <span className="text-[10px] font-bold text-rose-400 font-mono">CONV1 GRADIENT</span>
            <span className="text-xs text-slate-200 font-mono">
              {(0.00000001 + Math.random() * 0.00000001).toExponential(2)}
            </span>
          </div>
        )}
        
        {hyperparams.failureMode === 'Exploding Gradients' && mode === 'Train' && (
          <div className="absolute bottom-3 right-4 z-10 bg-slate-950/90 border border-rose-500/50 rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-3">
            <span className="text-[10px] font-bold text-rose-400 font-mono">POOL GRADIENT</span>
            <span className="text-xs text-slate-200 font-mono">
              {step < 5 ? (0.5 * step).toFixed(2) : step < 10 ? (Math.pow(2, step-5)).toFixed(1) : step < 15 ? (Math.pow(10, step-8)).toFixed(0) : "NaN"}
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
