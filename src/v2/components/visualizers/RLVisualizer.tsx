import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hyperparameters, Mode, DataSource } from '../../types';
import { DQNGridworld } from './dqn/DQNGridworld';
import { DQNCartPole } from './dqn/DQNCartPole';
import { DQNMarketTrading } from './dqn/DQNMarketTrading';
import { DQNNetworkView } from './dqn/DQNNetworkView';
import { DQNReplayBuffer } from './dqn/DQNReplayBuffer';
import { DQNMathModal } from './dqn/DQNMathModal';
import { Play, RotateCcw, Database, Gamepad2, Zap, AlertTriangle, Layers } from 'lucide-react';

interface RLVisualizerProps {
  hyperparams: Hyperparameters;
  step: number;
  mode: Mode;
  dataSource?: DataSource;
  isSpotlightOpen?: boolean;
}

type DQNViewTab = 'environment' | 'mechanics';

export const RLVisualizer: React.FC<RLVisualizerProps> = ({
  hyperparams,
  step,
  mode,
  dataSource = 'Gridworld Maze',
  isSpotlightOpen = false
}) => {
  const [activeTab, setActiveTab] = useState<DQNViewTab>('environment');
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);

  // When guided spotlight tour opens, ensure we are on the environment tab so tour elements are in DOM
  React.useEffect(() => {
    if (isSpotlightOpen && activeTab !== 'environment') {
      setActiveTab('environment');
    }
  }, [isSpotlightOpen]);

  const isPoorExploration = mode === 'Train' && hyperparams.failureMode === 'Poor Exploration';

  // Exploration schedule dynamically derived from hyperparams.dqnExplorationSchedule
  const explorationSchedule = hyperparams.dqnExplorationSchedule || 'Standard';
  const discountFactor = hyperparams.dqnDiscountFactor ?? 0.90;

  // Exploration rate epsilon: decays during training according to schedule
  const epsilon = useMemo(() => {
    if (mode === 'Inference') return 0.0; // pure greedy exploitation in inference
    if (isPoorExploration) return 0.0; // failure mode: no exploration
    
    // Schedule decay rate
    const decayDivisor = explorationSchedule === 'Fast (Greedy)' ? 40 : (explorationSchedule === 'High Exploration' ? 240 : 120);
    const minEpsilon = explorationSchedule === 'High Exploration' ? 0.20 : 0.05;
    const decay = Math.max(minEpsilon, 1.0 - (step / decayDivisor));
    return decay;
  }, [mode, isPoorExploration, step, explorationSchedule]);

  // Environment-specific state and dynamics
  const envType = dataSource?.includes('CartPole')
    ? 'cartpole'
    : dataSource?.includes('Market')
    ? 'market'
    : 'gridworld';

  // 1. Gridworld Dynamics
  const targetX = 5;
  const targetY = 5;
  const gridSize = 6;

  // Paths
  const normalGridPath = useMemo(() => [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 },
    { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 },
    { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 5 },
    { x: 5, y: 5 }
  ], []);

  const stuckGridPath = useMemo(() => [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }
  ], []);

  const activeGridPath = isPoorExploration ? stuckGridPath : normalGridPath;
  const gridCycle = step % (activeGridPath.length + (isPoorExploration ? 0 : 4));
  const currentGridIdx = Math.min(activeGridPath.length - 1, gridCycle);
  const agentPos = activeGridPath[currentGridIdx];
  const nextGridPos = activeGridPath[Math.min(activeGridPath.length - 1, currentGridIdx + 1)];

  // Actions for current environment
  const actions = useMemo(() => {
    if (envType === 'cartpole') return ['LEFT', 'RIGHT'];
    if (envType === 'market') return ['BUY', 'HOLD', 'SELL'];
    return ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  }, [envType]);

  // Current action selection
  const selectedAction = useMemo(() => {
    if (envType === 'cartpole') {
      return step % 3 === 0 ? 'LEFT' : 'RIGHT';
    }
    if (envType === 'market') {
      const mod = step % 5;
      return mod === 0 ? 'BUY' : mod === 3 ? 'SELL' : 'HOLD';
    }
    // Gridworld: determine action from movement
    const dx = nextGridPos.x - agentPos.x;
    const dy = nextGridPos.y - agentPos.y;
    if (dx > 0) return 'RIGHT';
    if (dx < 0) return 'LEFT';
    if (dy > 0) return 'DOWN';
    if (dy < 0) return 'UP';
    return 'RIGHT';
  }, [envType, nextGridPos, agentPos, step]);

  // Dice roll for exploration vs exploitation
  const isExploring = useMemo(() => {
    if (epsilon <= 0) return false;
    const pseudoRandom = ((step * 17) % 100) / 100;
    return pseudoRandom < epsilon;
  }, [step, epsilon]);

  // Simulated Q-Values for available actions
  const qValues = useMemo(() => {
    return actions.map((act, idx) => {
      const isGreedy = act === selectedAction;
      let baseVal = 0.35 + ((step * 7 + idx * 13) % 40) / 100;
      if (isGreedy) baseVal = Math.max(baseVal, 0.82);
      if (isPoorExploration && act !== selectedAction) baseVal = 0.15;
      return {
        action: act,
        value: baseVal,
        isGreedy,
        isChosen: isExploring ? (idx === (step % actions.length)) : isGreedy
      };
    });
  }, [actions, selectedAction, isPoorExploration, isExploring, step]);

  // State Vector representations
  const stateVector = useMemo(() => {
    if (envType === 'cartpole') {
      const epStep = step % 160;
      const x = Math.sin(epStep * 0.15) * 1.1;
      const v = Math.cos(epStep * 0.15) * 0.25;
      const angle = (Math.sin(epStep * 0.35) * 4.2) / 12.0;
      const angVel = Math.cos(epStep * 0.35) * 0.12;
      return [
        { label: 'Cart Pos (x)', value: x },
        { label: 'Cart Vel (ẋ)', value: v },
        { label: 'Pole Angle (θ)', value: angle },
        { label: 'Angle Vel (θ̇)', value: angVel }
      ];
    }
    if (envType === 'market') {
      return [
        { label: 'Price Mom.', value: 0.42 },
        { label: 'RSI / 100', value: 0.58 },
        { label: 'Holdings', value: 0.50 },
        { label: 'MACD Signal', value: 0.18 }
      ];
    }
    return [
      { label: 'Agent X', value: agentPos.x / (gridSize - 1) },
      { label: 'Agent Y', value: agentPos.y / (gridSize - 1) },
      { label: 'Target ΔX', value: (targetX - agentPos.x) / gridSize },
      { label: 'Target ΔY', value: (targetY - agentPos.y) / gridSize }
    ];
  }, [envType, agentPos, step, targetX, targetY, gridSize]);

  // Current Reward calculation
  const reward = useMemo(() => {
    if (envType === 'cartpole') return 1.0;
    if (envType === 'market') return selectedAction === 'BUY' ? 0.75 : 0.05;
    if (agentPos.x === targetX && agentPos.y === targetY) return 1.0;
    if ((agentPos.x === 3 && agentPos.y === 2) || (agentPos.x === 4 && agentPos.y === 1)) return -0.5;
    return -0.01;
  }, [envType, agentPos, targetX, targetY, selectedAction]);

  const stateDesc = envType === 'cartpole' 
    ? `x=${stateVector[0].value.toFixed(1)}, θ=${(stateVector[2].value * 12).toFixed(1)}°`
    : envType === 'market'
    ? `P=$145.2, RSI=58`
    : `(${agentPos.x}, ${agentPos.y})`;

  const nextStateDesc = envType === 'cartpole'
    ? `x=${(stateVector[0].value + 0.1).toFixed(1)}, θ=${((stateVector[2].value - 0.05) * 12).toFixed(1)}°`
    : envType === 'market'
    ? `P=$146.1, RSI=62`
    : `(${nextGridPos.x}, ${nextGridPos.y})`;

  return (
    <div className="w-full min-h-full flex flex-col items-center justify-start p-4 sm:p-6 relative bg-slate-950 gap-6">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-15 pointer-events-none" />

      {/* Top Header Controls: View Switcher (Environment vs Replay Buffer) */}
      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
        
        {/* Left: View Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold mr-1">
            DQN Perspective:
          </span>

          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setActiveTab('environment')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'environment'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Live Environment & Policy</span>
            </button>

            <button
              onClick={() => setActiveTab('mechanics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'mechanics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Inner Mechanics (Replay & Target Net)</span>
            </button>
          </div>
        </div>

        {/* Right: Math Inspector Trigger */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsMathModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Bellman Equation Breakdown</span>
          </button>
        </div>

      </div>

      {/* Failure Mode Alert (Poor Exploration) */}
      {isPoorExploration && (
        <div className="w-full max-w-5xl bg-rose-950/40 border border-rose-500/50 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg z-10 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-300 uppercase font-mono tracking-wide">
                Failure Mode: Poor Exploration (Local Minimum Trap)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Notice how the agent is stuck in an endless loop near the start. Because exploration rate <span className="font-mono text-rose-400">ε = 0</span>, the agent strictly exploits its initial random beliefs and never discovers the positive +1.0 reward at the goal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <div className="w-full max-w-5xl flex justify-center z-10">
        {activeTab === 'environment' ? (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Environment Simulation Canvas (7 cols) */}
            <div id="tour-dqn-env" className="w-full lg:col-span-6 flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
              {envType === 'cartpole' ? (
                <DQNCartPole
                  step={step}
                  selectedAction={selectedAction}
                  isPoorExploration={isPoorExploration}
                />
              ) : envType === 'market' ? (
                <DQNMarketTrading
                  step={step}
                  selectedAction={selectedAction}
                  isPoorExploration={isPoorExploration}
                />
              ) : (
                <DQNGridworld
                  agentX={agentPos.x}
                  agentY={agentPos.y}
                  targetX={targetX}
                  targetY={targetY}
                  gridSize={gridSize}
                  selectedAction={selectedAction}
                  isPoorExploration={isPoorExploration}
                  onSelectCell={(x, y) => setSelectedCell({ x, y })}
                  selectedCell={selectedCell}
                  gamma={discountFactor}
                />
              )}
            </div>

            {/* Right Column: Deep Q-Network & Policy Engine (6 cols) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <DQNNetworkView
                stateVector={stateVector}
                qValues={qValues}
                epsilon={epsilon}
                isExploring={isExploring}
                selectedAction={selectedAction}
                isPoorExploration={isPoorExploration}
                numHiddenLayers={hyperparams.layers || 2}
                step={step}
                onInspectMath={() => setIsMathModalOpen(true)}
              />
            </div>

          </div>
        ) : (
          /* Mechanics Tab: Replay Buffer & Target Network */
          <DQNReplayBuffer
            step={step}
            currentTransition={{
              s: stateDesc,
              a: selectedAction,
              r: reward,
              sPrime: nextStateDesc
            }}
            isPoorExploration={isPoorExploration}
          />
        )}
      </div>

      {/* Mathematical Bellman Inspector Modal */}
      <DQNMathModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
        stateDesc={stateDesc}
        actionDesc={selectedAction}
        reward={reward}
        nextStateDesc={nextStateDesc}
        qValues={qValues}
        nextMaxQ={0.88}
        gamma={discountFactor}
        alpha={hyperparams.learningRate || 0.01}
        failureMode={hyperparams.failureMode}
      />

    </div>
  );
};
