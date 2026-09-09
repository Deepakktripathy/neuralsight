import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Gauge, Activity, RotateCcw } from 'lucide-react';

interface DQNCartPoleProps {
  step: number;
  selectedAction: string;
  isPoorExploration: boolean;
}

export const DQNCartPole: React.FC<DQNCartPoleProps> = ({
  step,
  selectedAction,
  isPoorExploration
}) => {
  // Deterministic simulation dynamics for CartPole
  const episodeLen = isPoorExploration ? 24 : 160;
  const epStep = step % episodeLen;

  // Cart position: oscillates within track bounds [-2.0, 2.0]
  // If poor exploration, pole destabilizes quickly and falls after 15 steps
  let angleDeg = 0;
  let cartX = 0;
  let cartVelocity = 0;
  let angularVel = 0;

  if (isPoorExploration) {
    // Falls quickly
    const collapseT = Math.min(20, epStep);
    angleDeg = Math.sin(collapseT * 0.4) * (collapseT * 1.8);
    cartX = -0.5 + collapseT * 0.08;
    cartVelocity = 0.12;
    angularVel = collapseT * 0.15;
  } else {
    // Stable balancing controller
    angleDeg = Math.sin(epStep * 0.35) * 4.2 + Math.cos(epStep * 0.2) * 1.8;
    cartX = Math.sin(epStep * 0.15) * 1.1;
    cartVelocity = Math.cos(epStep * 0.15) * 0.25;
    angularVel = Math.cos(epStep * 0.35) * 0.12;
  }

  // Visual SVG coordinates:
  // Track width is 360px, center is 180px
  // 1 unit of X = 55px
  const svgCenterX = 180;
  const cartSvgX = Math.max(40, Math.min(320, svgCenterX + cartX * 55));
  const trackY = 140;
  const cartWidth = 64;
  const cartHeight = 32;
  const poleLength = 95;

  const isFallen = Math.abs(angleDeg) > 15;
  const activeForce = selectedAction === 'LEFT' ? 'LEFT' : 'RIGHT';

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[420px]">
      {/* Header Info */}
      <div className="flex items-center justify-between w-full px-1">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
          CartPole-v1 Benchmark
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            isFallen 
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            {isFallen ? 'Pole Fallen (Reset)' : `Balanced: ${epStep} steps`}
          </span>
        </div>
      </div>

      {/* SVG Physics Canvas */}
      <div className="w-full h-52 bg-slate-950 border border-slate-800 rounded-2xl relative shadow-2xl overflow-hidden flex items-center justify-center">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />

        <svg className="w-full h-full" viewBox="0 0 360 200">
          <defs>
            <linearGradient id="cartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#312e81" />
            </linearGradient>
            <linearGradient id="poleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Track Rail */}
          <line x1="20" y1={trackY} x2="340" y2={trackY} stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          {/* Limit stops */}
          <line x1="25" y1={trackY - 10} x2="25" y2={trackY + 10} stroke="#ef4444" strokeWidth="3" />
          <line x1="335" y1={trackY - 10} x2="335" y2={trackY + 10} stroke="#ef4444" strokeWidth="3" />
          <text x="30" y={trackY + 22} fill="#64748b" fontSize="8" fontFamily="monospace">-2.4m</text>
          <text x="172" y={trackY + 22} fill="#64748b" fontSize="8" fontFamily="monospace">0m</text>
          <text x="310" y={trackY + 22} fill="#64748b" fontSize="8" fontFamily="monospace">+2.4m</text>

          {/* Cart Wheels */}
          <circle cx={cartSvgX - 20} cy={trackY - 6} r="6" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
          <circle cx={cartSvgX + 20} cy={trackY - 6} r="6" fill="#1e293b" stroke="#64748b" strokeWidth="2" />

          {/* Cart Body */}
          <rect
            x={cartSvgX - cartWidth / 2}
            y={trackY - 12 - cartHeight}
            width={cartWidth}
            height={cartHeight}
            rx="6"
            fill="url(#cartGrad)"
            stroke="#818cf8"
            strokeWidth="1.5"
            className="filter drop-shadow-md"
          />

          {/* Applied Force Arrow */}
          {activeForce === 'LEFT' ? (
            <g transform={`translate(${cartSvgX - cartWidth / 2 - 25}, ${trackY - 26})`}>
              <polygon points="0,6 12,0 12,4 20,4 20,8 12,8 12,12" fill="#38bdf8" className="animate-pulse" />
            </g>
          ) : (
            <g transform={`translate(${cartSvgX + cartWidth / 2 + 5}, ${trackY - 26})`}>
              <polygon points="20,6 8,0 8,4 0,4 0,8 8,8 8,12" fill="#38bdf8" className="animate-pulse" />
            </g>
          )}

          {/* Hinged Pole */}
          <g transform={`translate(${cartSvgX}, ${trackY - 12 - cartHeight + 6})`}>
            {/* Rotate by angle */}
            <g transform={`rotate(${angleDeg})`}>
              {/* Pole Stem */}
              <rect
                x="-4"
                y={-poleLength}
                width="8"
                height={poleLength}
                rx="4"
                fill="url(#poleGrad)"
                stroke="#fbbf24"
                strokeWidth="1"
                className="filter drop-shadow-lg"
              />
              {/* Top Bob Mass */}
              <circle cx="0" cy={-poleLength} r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            </g>
            {/* Pivot Joint Pin */}
            <circle cx="0" cy="0" r="5" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />
          </g>
        </svg>

        {/* Action badge overlay */}
        <div className="absolute top-2.5 right-3 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-lg">
          <span className="text-[9px] font-mono text-slate-400">Action:</span>
          <span className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1">
            {activeForce === 'LEFT' ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
            PUSH {activeForce}
          </span>
        </div>
      </div>

      {/* 4D State Vector Readout Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full text-xs font-mono">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col">
          <span className="text-[9px] text-slate-400">Position (x)</span>
          <span className="text-indigo-300 font-bold mt-0.5">{cartX.toFixed(2)}m</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col">
          <span className="text-[9px] text-slate-400">Velocity (ẋ)</span>
          <span className="text-indigo-300 font-bold mt-0.5">{cartVelocity.toFixed(2)}m/s</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col">
          <span className="text-[9px] text-slate-400">Angle (θ)</span>
          <span className={`font-bold mt-0.5 ${Math.abs(angleDeg) > 10 ? 'text-rose-400' : 'text-amber-300'}`}>
            {angleDeg.toFixed(1)}°
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col">
          <span className="text-[9px] text-slate-400">Angular Vel (θ̇)</span>
          <span className="text-amber-300 font-bold mt-0.5">{angularVel.toFixed(2)}r/s</span>
        </div>
      </div>
    </div>
  );
};
