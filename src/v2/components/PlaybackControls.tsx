import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Gauge, Download } from 'lucide-react';
import { cn } from '../lib/utils';

interface PlaybackControlsProps {
  isPlaying: boolean;
  togglePlay: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
  speed: number;
  setSpeed: (s: number) => void;
  onExportResults: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  togglePlay,
  stepForward,
  stepBackward,
  reset,
  speed,
  setSpeed,
  onExportResults,
}) => {
  const speedMultiplier = (1000 / speed).toFixed(2).replace(/\.?0+$/, '');

  return (
    <div className="flex w-full flex-col justify-center gap-2 px-4 py-2 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            title="Reset simulation"
            aria-label="Reset simulation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <div className="mx-1 h-6 w-px bg-slate-700" />

          <button
            onClick={stepBackward}
            disabled={isPlaying}
            className="rounded-full p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-30"
            title="Step backward"
            aria-label="Step backward"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            onClick={togglePlay}
            className={cn(
              'rounded-full p-3 shadow-lg transition-colors',
              isPlaying
                ? 'bg-amber-500 text-slate-900 shadow-amber-500/20 hover:bg-amber-400'
                : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:bg-indigo-400'
            )}
            title={isPlaying ? 'Pause training' : 'Play training'}
            aria-label={isPlaying ? 'Pause training' : 'Play training'}
            aria-pressed={isPlaying}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </button>

          <button
            onClick={stepForward}
            disabled={isPlaying}
            className="rounded-full p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-30"
            title="Step forward"
            aria-label="Step forward"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExportResults}
            className="flex items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-800/50 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
            title="Download metrics as CSV"
            aria-label="Download metrics as CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <label
            className="flex items-center gap-2.5 rounded-full border border-slate-700/50 bg-slate-800/50 px-3 py-1.5"
            title="Playback speed"
          >
            <Gauge className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={2100 - speed}
              onChange={(e) => setSpeed(2100 - parseInt(e.target.value))}
              className="h-1.5 w-20 cursor-pointer appearance-none rounded-lg bg-slate-700 accent-indigo-500"
              aria-label="Playback speed"
            />
            <span className="w-9 text-right font-mono text-[11px] text-slate-400">{speedMultiplier}×</span>
          </label>
        </div>
      </div>
    </div>
  );
};