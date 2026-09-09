import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Dice5, Zap, Award, AlertTriangle, ArrowRight } from 'lucide-react';
import { LayerTooltip } from '../../LayerTooltip';
import { getArchitectureTooltip } from '../../../utils/tooltips';

interface DQNNetworkViewProps {
  stateVector: { label: string; value: number }[];
  qValues: { action: string; value: number; isGreedy: boolean; isChosen: boolean }[];
  epsilon: number;
  isExploring: boolean;
  selectedAction: string;
  isPoorExploration: boolean;
  numHiddenLayers?: number;
  step: number;
  onInspectMath: () => void;
}

export const DQNNetworkView: React.FC<DQNNetworkViewProps> = ({
  stateVector,
  qValues,
  epsilon,
  isExploring,
  selectedAction,
  isPoorExploration,
  numHiddenLayers = 2,
  step,
  onInspectMath
}) => {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      
      {/* Network Box */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-4">
        
        {/* Network Header with Bellman Math Trigger */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Deep Q-Network (Q(s, a; θ))
            </span>
          </div>

          <button
            onClick={onInspectMath}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Inspect Bellman Math</span>
          </button>
        </div>

        {/* Multi-Layer Schematic */}
        <div className="flex items-center justify-between gap-3 px-2 py-1">
          
          {/* 1. Input State Nodes */}
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-[9px] font-mono text-slate-400 uppercase text-center mb-0.5">
              Input State (s)
            </span>
            <div className="flex flex-col gap-1.5">
              {stateVector.map((s, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1 bg-slate-950 border border-indigo-500/30 rounded-lg flex items-center justify-between gap-2 shadow-inner w-24"
                >
                  <span className="text-[9px] font-mono text-slate-400 truncate">{s.label}</span>
                  <span className="text-[10px] font-mono font-bold text-indigo-300">{s.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Arrows 1 */}
          <div className="flex flex-col items-center justify-center text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* 2. Hidden Layers Stack */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-mono text-slate-400 uppercase text-center mb-0.5">
              Hidden Layers
            </span>
            <div className="flex items-center gap-2 p-2 bg-slate-950/70 border border-slate-800 rounded-xl shadow-inner">
              {Array.from({ length: Math.min(3, numHiddenLayers) }).map((_, lIdx) => (
                <div key={lIdx} className="flex flex-col gap-1.5">
                  {Array.from({ length: 4 }).map((_, nIdx) => {
                    const act = 0.3 + 0.6 * Math.abs(Math.sin(step * 0.2 + lIdx * 1.5 + nIdx));
                    return (
                      <motion.div
                        key={nIdx}
                        className="w-3.5 h-6 rounded-md border border-indigo-500/40"
                        style={{
                          backgroundColor: `rgba(99, 102, 241, ${act})`
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Connection Arrows 2 */}
          <div className="flex flex-col items-center justify-center text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* 3. Output Q-Values */}
          <div id="tour-dqn-qvals" className="flex flex-col gap-1.5 flex-1 min-w-[130px]">
            <span className="text-[9px] font-mono text-slate-400 uppercase text-center mb-0.5">
              Q(s, a) Outputs
            </span>
            <div className="flex flex-col gap-1.5">
              {qValues.map((q) => {
                const isSelected = q.isChosen;
                const isGreedy = q.isGreedy;

                return (
                  <div
                    key={q.action}
                    className={`px-2.5 py-1 rounded-lg border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                        : isGreedy
                        ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold">{q.action}</span>
                      {isGreedy && (
                        <span className="text-[8px] font-mono uppercase px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 font-bold">
                          max
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono font-bold">
                      {q.value.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ε-Greedy Policy Strategy Engine Banner */}
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Dice5 className="w-3.5 h-3.5 text-amber-400" />
              <span>ε-Greedy Policy:</span>
            </div>
            <span className="text-slate-400">
              Exploration Rate ε = <strong className="text-amber-300">{epsilon.toFixed(2)}</strong>
            </span>
          </div>

          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isExploring ? 'bg-sky-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-[11px] font-mono">
                {isExploring ? (
                  <span className="text-sky-300 font-semibold">
                    EXPLORATION (Random Exploration)
                  </span>
                ) : (
                  <span className="text-amber-300 font-semibold">
                    EXPLOITATION (Greedy argmax Q)
                  </span>
                )}
              </span>
            </div>

            <div className="text-[10px] font-mono bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-slate-300">
              Action: <strong className="text-white">{selectedAction}</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
