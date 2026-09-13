import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Hyperparameters, Mode, UseCase, DataSource } from '../../types';
import { LayerTooltip } from '../LayerTooltip';
import { getArchitectureTooltip } from '../../utils/tooltips';
import { X } from 'lucide-react';

interface StandardNNVisualizerProps {
  hyperparams: Hyperparameters;
  step: number;
  mode: Mode;
  useCase: UseCase;
  dataSource: DataSource;
}

export const StandardNNVisualizer: React.FC<StandardNNVisualizerProps> = ({ hyperparams, step, mode, useCase, dataSource }) => {
  const [inspectedNode, setInspectedNode] = useState<{lIdx: number, nIdx: number, act: number, bias: number} | null>(null);
  const numHiddenLayers = Math.max(1, hyperparams.layers - 2);
  const neuronsPerLayer = Math.min(10, hyperparams.mlpNeuronsPerLayer || 8); // Render-safe node cap for UI aesthetics
  
  const layers = useMemo(() => {
    const l = [];
    // Input layer
    const inputSize = dataSource === 'MNIST (Handwriting)' ? 8 : (dataSource === 'Iris' ? 4 : 5);
    l.push({ id: 'input', size: inputSize, label: 'Input Features' });
    
    // Hidden layers
    for (let i = 0; i < numHiddenLayers; i++) {
      l.push({ id: `hidden-${i}`, size: neuronsPerLayer, label: `Hidden Layer ${i + 1}` });
    }
    
    // Output layer
    const outputSize = useCase === 'Classification' ? 3 : 1;
    l.push({ id: 'output', size: outputSize, label: 'Output' });
    return l;
  }, [numHiddenLayers, neuronsPerLayer, useCase, dataSource]);

  const getActivation = (layerIdx: number, nodeIdx: number) => {
    let act = 0;
    if (mode === 'Train') {
      act = Math.sin((step * 0.3) + layerIdx * 2 + nodeIdx) * 0.5 + 0.5;
    } else {
      const cycle = step % (layers.length * 15 + 20);
      const distance = Math.abs(cycle - layerIdx * 15);
      act = Math.max(0.1, Math.exp(-Math.pow(distance, 2) / 30));
    }

    // Apply Failure Modes
    if (hyperparams.failureMode === 'Exploding Gradients' && mode === 'Train') {
      // After a few steps, activations blow up
      if (step > 15) return Infinity; // We will handle Infinity as NaN visually
      act = act * Math.pow(1.5, step / 5);
    } else if (hyperparams.failureMode === 'Vanishing Gradients' && mode === 'Train') {
      // Activations die off quickly, especially in early layers (backprop failure)
      // We simulate forward pass also dying if weights become tiny, but standard is early layers don't update.
      // Let's just make everything aggressively shrink to 0
      act = act * Math.pow(0.5, step / 10);
    }

    return act;
  };

  const getWeightOpacity = (layerIdx: number, sourceIdx: number, targetIdx: number) => {
    if (hyperparams.failureMode === 'Exploding Gradients' && step > 15) return 1;
    const act = getActivation(layerIdx, sourceIdx) * getActivation(layerIdx + 1, targetIdx);
    return Math.max(0.1, act * 0.5);
  };

  const getNodeCenterY = (layerSize: number, nodeIdx: number) => {
    const halfTotalHeight = layerSize * 24 - 8;
    const nodeOffset = nodeIdx * 48 + 16;
    return `calc(50% - ${halfTotalHeight}px + ${nodeOffset}px)`;
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden relative bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1e293b,transparent_70%)] opacity-30" />
      
      <div className="w-full max-w-2xl relative z-10 h-[500px] mx-auto">
        {/* Draw connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
           {layers.map((layer, lIdx) => {
             if (lIdx === layers.length - 1) return null;
             const nextLayer = layers[lIdx + 1];
             return Array.from({ length: layer.size }).map((_, sourceIdx) => (
               Array.from({ length: nextLayer.size }).map((_, targetIdx) => {
                 const x1 = `${(lIdx / (layers.length - 1)) * 100}%`;
                 const y1 = getNodeCenterY(layer.size, sourceIdx);
                 const x2 = `${((lIdx + 1) / (layers.length - 1)) * 100}%`;
                 const y2 = getNodeCenterY(nextLayer.size, targetIdx);
                 const opacity = getWeightOpacity(lIdx, sourceIdx, targetIdx);
                 const isFirstWeight = lIdx === 0 && sourceIdx === 0 && targetIdx === 0;

                 return (
                   <g key={`${lIdx}-${sourceIdx}-${targetIdx}`} id={isFirstWeight ? "tour-weight" : undefined}>
                     <motion.line
                       x1={x1}
                       y1={y1}
                       x2={x2}
                       y2={y2}
                       stroke={mode === 'Train' ? "rgba(99, 102, 241, 0.4)" : "rgba(99, 102, 241, 1)"}
                       strokeWidth={opacity * 3}
                       initial={{ opacity: 0.1 }}
                       animate={{ opacity: opacity }}
                       transition={{ duration: 0.2 }}
                     />
                     {mode === 'Train' && (
                       <motion.line
                         x1={x2}
                         y1={y2}
                         x2={x1}
                         y2={y1}
                         stroke="rgba(244, 63, 94, 0.8)"
                         strokeWidth={Math.max(1, opacity * 3)}
                         strokeDasharray="6 12"
                         animate={{ strokeDashoffset: [0, 18] }}
                         transition={{ duration: 0.5 + Math.random() * 0.2, repeat: Infinity, ease: "linear" }}
                         style={{ opacity: opacity }}
                       />
                     )}
                   </g>
                 );
               })
             ));
           })}
          </svg>

      {/* Live Probes for Sandbox Diagnostics */}
      {hyperparams.failureMode === 'Vanishing Gradients' && mode === 'Train' && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none z-10">
          <div className="bg-slate-900/90 border border-rose-500/50 rounded-lg p-2 shadow-lg">
            <span className="text-[9px] font-bold text-rose-400 font-monospace block mb-1">LAYER 1 GRADIENT</span>
            <span className="text-xs text-slate-200 font-mono">{(0.00000001 + Math.random() * 0.00000001).toExponential(2)}</span>
          </div>
          <div className="bg-slate-900/90 border border-emerald-500/50 rounded-lg p-2 shadow-lg">
            <span className="text-[9px] font-bold text-emerald-400 font-monospace block mb-1">LAST LAYER GRADIENT</span>
            <span className="text-xs text-slate-200 font-mono">{(1.24 + Math.sin(step) * 0.1).toFixed(4)}</span>
          </div>
        </div>
      )}
      
      {hyperparams.failureMode === 'Exploding Gradients' && mode === 'Train' && (
        <div className="absolute bottom-4 right-4 pointer-events-none z-10">
          <div className="bg-slate-900/90 border border-rose-500/50 rounded-lg p-2 shadow-lg">
            <span className="text-[9px] font-bold text-rose-400 font-monospace block mb-1">WEIGHT (NODE 1)</span>
            <span className="text-xs text-slate-200 font-mono">
              {step < 5 ? (0.5 * step).toFixed(2) : step < 10 ? (Math.pow(2, step-5)).toFixed(1) : step < 15 ? (Math.pow(10, step-8)).toFixed(0) : "NaN"}
            </span>
          </div>
        </div>
      )}


        {layers.map((layer, lIdx) => (
          <div 
            key={layer.id} 
            className="absolute top-0 bottom-0 flex flex-col items-center justify-center w-8 z-10 hover:z-50"
            style={{ 
              left: `${(lIdx / (layers.length - 1)) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            {lIdx === 0 && (
              <div id="tour-layer-gap" className="absolute top-1/4 bottom-1/4 w-[150px] -right-[150px] pointer-events-none" />
            )}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
              <LayerTooltip 
                label={layer.label}
                description={getArchitectureTooltip('StandardNN', layer.label)}
                position={lIdx === 0 ? 'left' : lIdx === layers.length - 1 ? 'right' : 'center'}
              />
            </div>
            
            <div className="flex flex-col items-center justify-center w-full gap-4 relative">
              {Array.from({ length: layer.size }).map((_, nIdx) => {
                const act = getActivation(lIdx, nIdx);
                const isOutput = lIdx === layers.length - 1;
                const bias = Math.sin(lIdx * 10 + nIdx) * 0.5;
                const isNaN = act === Infinity;
                const isFirstNeuron = lIdx === 0 && nIdx === 0;

                return (
                  <motion.div
                    key={nIdx}
                    id={isFirstNeuron ? "tour-neuron" : undefined}
                    onClick={() => setInspectedNode({ lIdx, nIdx, act: isNaN ? NaN : act, bias })}
                    className="w-8 h-8 rounded-full border-2 border-slate-700 bg-slate-900 shadow-[0_0_10px_rgba(0,0,0,0.5)] relative z-20 flex items-center justify-center overflow-hidden shrink-0 group hover:z-50 cursor-pointer hover:border-indigo-400"
                    animate={{
                      borderColor: isNaN ? '#f43f5e' : (inspectedNode?.lIdx === lIdx && inspectedNode?.nIdx === nIdx ? '#818cf8' : (isOutput ? `rgba(52, 211, 153, ${act})` : `rgba(99, 102, 241, ${act})`)),
                      boxShadow: isNaN ? '0 0 20px rgba(244, 63, 94, 0.8)' : (inspectedNode?.lIdx === lIdx && inspectedNode?.nIdx === nIdx ? '0 0 20px rgba(129, 140, 248, 0.6)' : (act > 0.5 ? `0 0 15px ${isOutput ? 'rgba(52, 211, 153, 0.4)' : 'rgba(99, 102, 241, 0.4)'}` : '0 0 0px rgba(0,0,0,0)'))
                    }}
                  >
                    <motion.div 
                      className="absolute inset-0"
                      animate={{
                        backgroundColor: isNaN ? '#f43f5e' : (isOutput ? `rgba(52, 211, 153, ${act * 0.8})` : `rgba(99, 102, 241, ${act * 0.8})`)
                      }}
                    />
                    {isNaN ? (
                      <span className="text-[10px] font-mono text-white mix-blend-difference relative z-30 hover:z-50 font-bold">NaN</span>
                    ) : isOutput && (
                      <span className="text-[10px] font-mono text-white mix-blend-difference relative z-30 hover:z-50">
                        {act.toFixed(2)}
                      </span>
                    )}
                    
                    {/* Interactive Node Tooltip */}
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                      <div className="text-[10px] text-slate-300 font-mono flex flex-col gap-1">
                        <div className="flex justify-between gap-4">
                          <span>Value:</span>
                          <span className={isNaN ? "text-rose-400 font-bold" : (isOutput ? "text-emerald-300" : "text-indigo-300")}>{isNaN ? 'NaN' : act.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Bias:</span>
                          <span className="text-amber-300">{((Math.sin(lIdx * 10 + nIdx) * 0.5)).toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
        {/* Node Inspection Modal */}
      {inspectedNode && (
        <div className="absolute bottom-12 right-12 w-64 bg-slate-900/95 border border-indigo-500/30 rounded-xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/50">
            <h3 className="text-xs font-medium text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Node Inspection
            </h3>
            <button 
              onClick={() => setInspectedNode(null)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Location</div>
              <div className="text-xs font-mono text-indigo-300">
                Layer {inspectedNode.lIdx + 1}, Neuron {inspectedNode.nIdx + 1}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Mathematics</div>
              <div className="bg-slate-950 rounded-md p-3 font-mono text-[11px] space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>z = ∑(w·x) + b</span>
                  <span className="text-slate-500">Summation</span>
                </div>
                <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-2">
                  <span>a = σ(z)</span>
                  <span className="text-slate-500">Activation</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Current State</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-950 rounded border border-slate-800 p-2 flex flex-col gap-1">
                  <span className="text-slate-500 text-[10px]">Bias (b)</span>
                  <span className="text-amber-400">{inspectedNode.bias.toFixed(4)}</span>
                </div>
                <div className="bg-slate-950 rounded border border-slate-800 p-2 flex flex-col gap-1">
                  <span className="text-slate-500 text-[10px]">Output (a)</span>
                  <span className="text-emerald-400">{Number.isNaN(inspectedNode.act) ? 'NaN' : inspectedNode.act.toFixed(4)}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-800">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                This neuron takes inputs from the previous layer, multiplies them by weights, adds a bias, and passes the result through an activation function to determine its output.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Decision Boundary Overlay */}
      {useCase === 'Classification' && (
        <div className="absolute top-4 left-8 w-40 h-40 bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md flex flex-col z-20">
          <div className="px-3 py-1.5 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
            <span className="text-[10px] font-mono text-slate-300 uppercase">Decision Space</span>
            {hyperparams.failureMode === 'Overfitting' && <span className="text-[10px] text-rose-400 font-bold animate-pulse">Overfitting!</span>}
          </div>
          <div className="relative flex-1 bg-slate-950">
            {/* Decision boundary background */}
            <motion.div 
              className="absolute inset-0 opacity-40"
              style={{
                background: `linear-gradient(${hyperparams.failureMode === 'Overfitting' ? Math.sin(step) * 360 : 45 + Math.sin(step*0.1)*30}deg, rgba(99,102,241,1) 0%, rgba(99,102,241,0) 50%, rgba(52,211,153,0) 50%, rgba(52,211,153,1) 100%)`
              }}
            />
            {hyperparams.failureMode === 'Overfitting' && (
               // Complex noisy boundaries when overfitting
               <motion.div 
                 className="absolute inset-0 opacity-30 mix-blend-screen"
                 style={{
                   background: `radial-gradient(circle at ${50 + Math.sin(step*0.5)*20}% ${50 + Math.cos(step*0.3)*20}%, rgba(244,63,94,0.8) 0%, transparent 40%)`
                 }}
               />
            )}
            
            {/* Data Points */}
            <div className="absolute inset-0">
              {useMemo(() => Array.from({ length: 20 }).map((_, i) => {
                const isClassA = i < 10;
                // Generate a spiral or cluster deterministically
                const pseudoRandom = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
                const r = 20 + pseudoRandom * 30;
                const theta = (i * 0.5) + (isClassA ? 0 : Math.PI);
                const x = 50 + r * Math.cos(theta);
                const y = 50 + r * Math.sin(theta);
                
                return (
                  <div 
                    key={i}
                    className={`absolute w-1.5 h-1.5 rounded-full shadow-sm -translate-x-1/2 -translate-y-1/2 ${isClassA ? 'bg-indigo-400' : 'bg-emerald-400'}`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                  />
                );
              }), [])}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
