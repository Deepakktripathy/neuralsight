import React from 'react';
import { motion } from 'motion/react';
import { Database, RefreshCw, Layers, Zap, Shuffle, CheckCircle2, AlertCircle } from 'lucide-react';

interface Transition {
  id: number;
  s: string;
  a: string;
  r: number;
  sPrime: string;
  isSampled: boolean;
}

interface DQNReplayBufferProps {
  step: number;
  currentTransition: { s: string; a: string; r: number; sPrime: string };
  isPoorExploration: boolean;
}

export const DQNReplayBuffer: React.FC<DQNReplayBufferProps> = ({
  step,
  currentTransition,
  isPoorExploration
}) => {
  // Target network updates every 20 steps
  const syncInterval = 20;
  const stepsUntilSync = syncInterval - (step % syncInterval);
  const syncProgress = ((syncInterval - stepsUntilSync) / syncInterval) * 100;

  // Generate deterministic ring buffer of recent transitions
  const bufferCapacity = 8;
  const recentTransitions: Transition[] = Array.from({ length: bufferCapacity }).map((_, idx) => {
    const tId = Math.max(0, step - idx);
    const isSampled = idx === 1 || idx === 3 || idx === 6; // mini-batch samples
    return {
      id: tId,
      s: idx === 0 ? currentTransition.s : `(${((tId * 2) % 5)}, ${((tId * 3) % 5)})`,
      a: idx === 0 ? currentTransition.a : (['UP', 'DOWN', 'LEFT', 'RIGHT'][tId % 4]),
      r: idx === 0 ? currentTransition.r : (tId % 5 === 0 ? 1.0 : -0.01),
      sPrime: idx === 0 ? currentTransition.sPrime : `(${((tId * 2 + 1) % 5)}, ${((tId * 3) % 5)})`,
      isSampled
    };
  });

  return (
    <div className="w-full max-w-4xl flex flex-col gap-5">
      
      {/* Top Banner: The Two DeepMind Innovations */}
      <div className="p-4 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-amber-950/40 border border-indigo-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold block mb-1">
            DeepMind (2015) Landmark Innovations
          </span>
          <h3 className="text-base font-bold text-white">
            Experience Replay & Target Q-Network
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Standard Q-learning diverges with neural networks because successive samples are correlated. DeepMind resolved this using an Experience Replay memory pool and a separated, frozen Target Network.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">Buffer Capacity</span>
            <span className="text-xs font-bold text-indigo-300 font-mono">100,000 tuples</span>
          </div>
          <div className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">Mini-Batch Size</span>
            <span className="text-xs font-bold text-amber-300 font-mono">32 samples</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Replay Buffer on Left, Target Network on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Experience Replay Ring Buffer (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Replay Memory Buffer (D)
              </h4>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <Shuffle className="w-3 h-3" />
              <span>Random Mini-Batch Sampling</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal">
            New transitions <span className="font-mono text-slate-300">(s, a, r, s')</span> stream in from the environment. Random mini-batches are uniformly sampled to train the network, breaking temporal autocorrelation.
          </p>

          {/* Buffer Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-inner bg-slate-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2 text-[10px]">Index</th>
                  <th className="p-2 text-[10px]">State (s)</th>
                  <th className="p-2 text-[10px]">Action (a)</th>
                  <th className="p-2 text-[10px]">Reward (r)</th>
                  <th className="p-2 text-[10px]">Next (s')</th>
                  <th className="p-2 text-[10px] text-right">Batch Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {recentTransitions.map((t) => (
                  <tr
                    key={t.id}
                    className={`transition-colors ${
                      t.isSampled
                        ? 'bg-amber-500/10 text-amber-200'
                        : 'text-slate-300 hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="p-2 text-slate-500 font-mono text-[10px]">#{t.id}</td>
                    <td className="p-2 text-indigo-300 font-semibold">{t.s}</td>
                    <td className="p-2 text-amber-300 font-semibold">{t.a}</td>
                    <td className="p-2">
                      <span className={`font-bold ${t.r > 0 ? 'text-emerald-400' : t.r < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {t.r > 0 ? `+${t.r.toFixed(2)}` : t.r.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-2 text-indigo-300 font-semibold">{t.sPrime}</td>
                    <td className="p-2 text-right">
                      {t.isSampled ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                          SAMPLED
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[9px]">QUEUED</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Target Network Synchronization (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between gap-4">
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Target Network (θ⁻)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                Sync every {syncInterval} steps
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              A copy of the Q-network with frozen parameters <span className="font-mono text-amber-300">θ⁻</span>. It calculates the Bellman target <span className="font-mono text-slate-300">y = r + γ max Q(s', a'; θ⁻)</span> without moving target oscillations.
            </p>

            {/* Network Comparison Cards */}
            <div className="space-y-2.5">
              {/* Online Network */}
              <div className="p-3 bg-slate-950 border border-indigo-500/40 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-xs font-bold text-indigo-300 font-mono">Online Network (θ)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    Updates continuously via SGD/Adam
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-indigo-950/80 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">
                  Active
                </span>
              </div>

              {/* Target Network */}
              <div className="p-3 bg-slate-950 border border-amber-500/40 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-amber-300 font-mono">Target Network (θ⁻)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    Frozen weights to stabilize targets
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-amber-950/80 text-amber-300 px-2 py-1 rounded border border-amber-500/30">
                  Frozen
                </span>
              </div>
            </div>

            {/* Sync Progress Gauge */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Next Parameter Sync:</span>
                <span className="text-amber-300 font-bold">in {stepsUntilSync} steps</span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-amber-500"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>

              <span className="text-[10px] text-slate-500 font-mono">
                θ⁻ ← θ copies weights periodically (or soft Polyak update τ = 0.005)
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            Loss: <strong className="text-white">Huber( y - Q(s, a; θ) )</strong> with clipped gradients for outlier stability.
          </div>

        </div>

      </div>

    </div>
  );
};
