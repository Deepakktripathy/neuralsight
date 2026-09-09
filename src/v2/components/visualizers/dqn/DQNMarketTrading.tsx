import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity } from 'lucide-react';

interface DQNMarketTradingProps {
  step: number;
  selectedAction: string;
  isPoorExploration: boolean;
}

export const DQNMarketTrading: React.FC<DQNMarketTradingProps> = ({
  step,
  selectedAction,
  isPoorExploration
}) => {
  // Generate deterministic synthetic market price series
  const windowSize = 20;
  const currentTick = step;

  const prices = useMemo(() => {
    const arr: { tick: number; price: number; ma: number; action?: string }[] = [];
    let p = 145.0;
    for (let i = 0; i <= currentTick + 5; i++) {
      const noise = Math.sin(i * 0.4) * 3.5 + Math.cos(i * 0.15) * 6.0 + Math.sin(i * 0.8) * 1.5;
      p = Math.max(110, Math.min(190, 145 + noise + (i * 0.12)));
      arr.push({ tick: i, price: p, ma: p });
    }

    // Compute simple moving average (SMA-5)
    for (let i = 0; i < arr.length; i++) {
      const slice = arr.slice(Math.max(0, i - 4), i + 1);
      const avg = slice.reduce((sum, item) => sum + item.price, 0) / slice.length;
      arr[i].ma = avg;
    }
    return arr;
  }, [currentTick]);

  const visiblePrices = prices.slice(Math.max(0, currentTick - windowSize), currentTick + 1);
  const currentPrice = visiblePrices[visiblePrices.length - 1]?.price ?? 145;
  const prevPrice = visiblePrices[visiblePrices.length - 2]?.price ?? currentPrice;
  const priceChange = currentPrice - prevPrice;

  // Simple simulated portfolio
  const portfolioCash = 10000;
  const sharesHeld = selectedAction === 'BUY' ? 50 : selectedAction === 'HOLD' ? 25 : 0;
  const portfolioVal = portfolioCash + sharesHeld * currentPrice;
  const pnl = (portfolioVal - 10000);

  // SVG dimensions
  const svgWidth = 360;
  const svgHeight = 180;
  const minP = Math.min(...visiblePrices.map(p => p.price)) - 2;
  const maxP = Math.max(...visiblePrices.map(p => p.price)) + 2;
  const rangeP = Math.max(1, maxP - minP);

  const getSvgY = (val: number) => svgHeight - 20 - ((val - minP) / rangeP) * (svgHeight - 40);
  const getSvgX = (idx: number) => 20 + (idx / Math.max(1, visiblePrices.length - 1)) * (svgWidth - 40);

  const pricePoints = visiblePrices.map((p, idx) => `${getSvgX(idx)},${getSvgY(p.price)}`).join(' ');
  const maPoints = visiblePrices.map((p, idx) => `${getSvgX(idx)},${getSvgY(p.ma)}`).join(' ');

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[420px]">
      {/* Header Info */}
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Market Trading (Asset: NVDA/USD)
          </span>
        </div>

        <div className="flex items-center gap-1 font-mono text-xs">
          <span className="text-white font-bold">${currentPrice.toFixed(2)}</span>
          <span className={`text-[10px] flex items-center ${priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}
          </span>
        </div>
      </div>

      {/* SVG Price Chart */}
      <div className="w-full h-52 bg-slate-950 border border-slate-800 rounded-2xl relative shadow-2xl overflow-hidden flex items-center justify-center p-2">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />

        <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <defs>
            <linearGradient id="priceArea" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          {visiblePrices.length > 1 && (
            <polygon
              points={`20,${svgHeight - 20} ${pricePoints} ${svgWidth - 20},${svgHeight - 20}`}
              fill="url(#priceArea)"
            />
          )}

          {/* SMA Line */}
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            points={maPoints}
          />

          {/* Price Line */}
          <polyline
            fill="none"
            stroke="#818cf8"
            strokeWidth="2.5"
            points={pricePoints}
          />

          {/* Current Price Head Dot */}
          {visiblePrices.length > 0 && (
            <g transform={`translate(${getSvgX(visiblePrices.length - 1)}, ${getSvgY(currentPrice)})`}>
              <circle r="5" fill="#818cf8" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
            </g>
          )}
        </svg>

        {/* Action badge overlay */}
        <div className="absolute top-2.5 right-3 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1 flex items-center gap-2 shadow-lg">
          <span className="text-[9px] font-mono text-slate-400">Trading Signal:</span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
            selectedAction === 'BUY' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
              : selectedAction === 'SELL' 
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}>
            {selectedAction}
          </span>
        </div>
      </div>

      {/* State & Portfolio Readout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full text-xs font-mono">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col">
          <span className="text-[9px] text-slate-400">Position Size</span>
          <span className="text-indigo-300 font-bold mt-0.5">{sharesHeld} Shares</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col">
          <span className="text-[9px] text-slate-400">Portfolio Total</span>
          <span className="text-white font-bold mt-0.5">${portfolioVal.toFixed(0)}</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col">
          <span className="text-[9px] text-slate-400">Cumulative PnL</span>
          <span className={`font-bold mt-0.5 ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {pnl >= 0 ? `+$${pnl.toFixed(1)}` : `-$${Math.abs(pnl).toFixed(1)}`}
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col">
          <span className="text-[9px] text-slate-400">RSI Indicator</span>
          <span className="text-amber-300 font-bold mt-0.5">58.4 (Neutral)</span>
        </div>
      </div>
    </div>
  );
};
