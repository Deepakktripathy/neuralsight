import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Architecture } from '../types';

interface MetricsChartProps {
  data: { step: number; loss: number; accuracy?: number; valLoss?: number; valAccuracy?: number }[];
  isOverfitting?: boolean;
  architecture?: Architecture;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ data, isOverfitting, architecture }) => {
  const isGAN = architecture === 'GAN';

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-1 px-2 flex-wrap gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {isGAN ? "Adversarial Metrics" : "Live Metrics"}
          </h3>
          {isGAN && (
            <div className="flex items-center gap-1.5 text-[9px] font-mono">
              <span className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
                L_G (Gen Loss)
              </span>
              <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
                L_D (Disc Loss)
              </span>
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                D(G(z)) Fake Score
              </span>
              <span className="flex items-center gap-1 text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                D(x) Real Score
              </span>
            </div>
          )}
        </div>
        {isGAN && (
          <span className="text-[9px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60" title="When G perfectly mimics the dataset, D cannot distinguish real from fake and outputs 50% for both.">
            Nash Equilibrium: <strong className="text-amber-300">50% / 50%</strong>
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 relative">
        {isOverfitting && data.length > 10 && (
          <div className="absolute top-2 right-6 z-10 bg-slate-900/90 border border-rose-500/50 p-2 rounded-lg pointer-events-none shadow-lg">
            <span className="text-[9px] font-bold text-rose-400 font-monospace block mb-1">MEMORIZATION DETECTED</span>
            <span className="text-[10px] text-slate-300">Train Loss: <span className="text-indigo-400 font-mono">{data[data.length-1].loss.toFixed(4)}</span></span><br/>
            <span className="text-[10px] text-slate-300">Val Loss: <span className="text-rose-400 font-mono">{(data[data.length-1].valLoss || 0).toFixed(4)}</span></span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="step" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#f8fafc', padding: '6px 10px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
              itemStyle={{ color: '#818cf8', padding: '1px 0' }}
              formatter={(value: number, name: string) => {
                if (isGAN && (name.includes('Score') || name.includes('Accuracy'))) {
                  return `${(value * 100).toFixed(1)}%`;
                }
                return value.toFixed(4);
              }}
              allowEscapeViewBox={{ x: false, y: false }}
              position={{ y: -10 }}
            />
            <Line 
              type="monotone" 
              name={isGAN ? "Generator Loss (L_G)" : (isOverfitting ? "Train Loss" : "Loss")}
              dataKey="loss" 
              stroke="#818cf8" 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false}
            />
            {data[0]?.valLoss !== undefined && (
              <Line 
                type="monotone" 
                name={isGAN ? "Discriminator Loss (L_D)" : "Validation Loss"}
                dataKey="valLoss" 
                stroke="#f43f5e" 
                strokeWidth={2} 
                strokeDasharray={(!isGAN && !isOverfitting) ? "4 4" : undefined}
                dot={false} 
                isAnimationActive={false}
              />
            )}
            {data[0]?.accuracy !== undefined && !isOverfitting && (
              <Line 
                type="monotone" 
                name={isGAN ? "D(G(z)) Fake Score" : "Accuracy"}
                dataKey="accuracy" 
                stroke="#34d399" 
                strokeWidth={1.5} 
                dot={false} 
                isAnimationActive={false}
              />
            )}
            {data[0]?.valAccuracy !== undefined && !isOverfitting && (
              <Line 
                type="monotone" 
                name={isGAN ? "D(x) Real Score" : "Validation Accuracy"}
                dataKey="valAccuracy" 
                stroke="#38bdf8" 
                strokeWidth={1.5} 
                strokeDasharray={isGAN ? undefined : "4 4"}
                dot={false} 
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
