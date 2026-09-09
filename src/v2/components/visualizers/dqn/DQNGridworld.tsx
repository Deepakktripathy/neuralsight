import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flag, Skull, ShieldAlert, Compass, Eye, Sparkles } from 'lucide-react';

interface DQNGridworldProps {
  agentX: number;
  agentY: number;
  targetX: number;
  targetY: number;
  gridSize?: number;
  selectedAction: string;
  isPoorExploration: boolean;
  onSelectCell?: (x: number, y: number) => void;
  selectedCell?: { x: number; y: number } | null;
}

export const DQNGridworld: React.FC<DQNGridworldProps> = ({
  agentX,
  agentY,
  targetX,
  targetY,
  gridSize = 6,
  selectedAction,
  isPoorExploration,
  onSelectCell,
  selectedCell
}) => {
  const [displayMode, setDisplayMode] = useState<'policy' | 'heatmap'>('policy');

  // Obstacles (walls)
  const isWall = (x: number, y: number) => {
    return (x === 2 && y === 1) || (x === 2 && y === 2) || (x === 4 && y === 3) || (x === 1 && y === 4);
  };

  // Hazard trap (-0.5 penalty)
  const isHazard = (x: number, y: number) => {
    return (x === 3 && y === 2) || (x === 4 && y === 1);
  };

  // Calculate estimated State Value V(s) = max_a Q(s, a)
  const getStateValue = (x: number, y: number): number => {
    if (isWall(x, y)) return 0;
    if (x === targetX && y === targetY) return 1.0;
    if (isHazard(x, y)) return -0.4;

    const manhattanDist = Math.abs(targetX - x) + Math.abs(targetY - y);
    if (isPoorExploration) {
      // In poor exploration, only start region learned anything; rest is zero
      if (x <= 1 && y <= 1) return 0.22 - 0.05 * (x + y);
      return 0.0;
    }

    // Normal Q-learning: values propagate backwards with discount factor ~0.9
    const baseVal = Math.pow(0.88, manhattanDist);
    return Math.max(0.05, Math.min(0.95, baseVal));
  };

  // Best policy direction from each cell
  const getPolicyDirection = (x: number, y: number): 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'GOAL' | 'WALL' => {
    if (isWall(x, y)) return 'WALL';
    if (x === targetX && y === targetY) return 'GOAL';

    if (isPoorExploration) {
      if (x === 0 && y === 0) return 'RIGHT';
      if (x === 1 && y === 0) return 'DOWN';
      if (x === 1 && y === 1) return 'LEFT';
      if (x === 0 && y === 1) return 'UP';
      return 'RIGHT';
    }

    // Optimal routing around walls to goal
    if (x === 2 && y === 0) return 'RIGHT'; // avoid wall at (2,1)
    if (x === 1 && y === 2) return 'UP';    // avoid wall at (2,2)
    if (x < targetX && !isWall(x + 1, y)) return 'RIGHT';
    if (y < targetY && !isWall(x, y + 1)) return 'DOWN';
    if (x < targetX) return 'RIGHT';
    if (y < targetY) return 'DOWN';
    return 'RIGHT';
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* View Toggle Bar */}
      <div className="flex items-center justify-between w-full max-w-[340px] px-1">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
          Gridworld State (6×6)
        </span>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setDisplayMode('policy')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              displayMode === 'policy' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Policy π(s)
          </button>
          <button
            onClick={() => setDisplayMode('heatmap')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              displayMode === 'heatmap' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Value V(s)
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div 
        className="grid grid-cols-6 grid-rows-6 gap-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-2xl relative shadow-2xl"
      >
        {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
          const x = idx % gridSize;
          const y = Math.floor(idx / gridSize);
          const isAgent = x === agentX && y === agentY;
          const isTarget = x === targetX && y === targetY;
          const wall = isWall(x, y);
          const hazard = isHazard(x, y);
          const val = getStateValue(x, y);
          const dir = getPolicyDirection(x, y);
          const isSelected = selectedCell?.x === x && selectedCell?.y === y;

          // Color calculation based on mode
          let cellBg = 'bg-slate-900/90 border-slate-800/80';
          if (wall) {
            cellBg = 'bg-slate-950 border-slate-800 opacity-60 bg-[repeating-linear-gradient(45deg,#0f172a,#0f172a_5px,#1e293b_5px,#1e293b_10px)]';
          } else if (hazard) {
            cellBg = 'bg-rose-950/40 border-rose-500/40';
          } else if (displayMode === 'heatmap') {
            const intensity = Math.max(0, Math.min(1, val));
            cellBg = `border-slate-800`;
          }

          return (
            <div
              key={idx}
              onClick={() => !wall && onSelectCell && onSelectCell(x, y)}
              style={
                displayMode === 'heatmap' && !wall && !hazard
                  ? { backgroundColor: `rgba(245, 158, 11, ${val * 0.85})` }
                  : undefined
              }
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex flex-col items-center justify-center relative cursor-pointer transition-all duration-200 border ${cellBg} ${
                isSelected ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 z-20' : 'hover:border-slate-600'
              }`}
            >
              {/* Wall Tile */}
              {wall && (
                <span className="text-[9px] font-mono text-slate-600 font-semibold select-none">WALL</span>
              )}

              {/* Hazard Tile */}
              {hazard && !isAgent && (
                <div className="flex flex-col items-center text-rose-400">
                  <Skull className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span className="text-[8px] font-mono text-rose-400 font-bold -mt-0.5">-0.5</span>
                </div>
              )}

              {/* Target Goal Tile */}
              {isTarget && !isAgent && (
                <div className="flex flex-col items-center text-emerald-400">
                  <Flag className="w-5 h-5 text-emerald-400" />
                  <span className="text-[8px] font-mono text-emerald-400 font-bold -mt-0.5">+1.0</span>
                </div>
              )}

              {/* Agent Token */}
              {isAgent && (
                <motion.div
                  layoutId="grid-agent-token"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 border-2 border-white shadow-[0_0_18px_rgba(99,102,241,0.8)] flex items-center justify-center z-30"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow" />
                </motion.div>
              )}

              {/* Policy Arrow / Heatmap value text when agent not on tile */}
              {!wall && !hazard && !isTarget && !isAgent && (
                <div className="flex flex-col items-center justify-center pointer-events-none select-none">
                  {displayMode === 'policy' ? (
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {dir === 'UP' && '↑'}
                      {dir === 'DOWN' && '↓'}
                      {dir === 'LEFT' && '←'}
                      {dir === 'RIGHT' && '→'}
                    </span>
                  ) : (
                    <span className={`text-[10px] font-mono font-bold ${val > 0.5 ? 'text-amber-950' : 'text-slate-400'}`}>
                      {val.toFixed(2)}
                    </span>
                  )}
                </div>
              )}

              {/* Coordinates Pill */}
              <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-slate-500/70 select-none">
                {x},{y}
              </span>
            </div>
          );
        })}
      </div>

      {/* Grid Legend & Status */}
      <div className="flex items-center justify-between w-full max-w-[340px] text-[10px] text-slate-400 px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Agent</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-emerald-500" />
            <span>Goal (+1)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-rose-500" />
            <span>Trap (-0.5)</span>
          </div>
        </div>

        <div className="text-slate-400 font-mono">
          Pos: <span className="text-indigo-300 font-bold">({agentX}, {agentY})</span>
        </div>
      </div>
    </div>
  );
};
