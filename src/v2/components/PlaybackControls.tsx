import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Gauge } from 'lucide-react';
import { cn } from '../lib/utils';

interface PlaybackControlsProps {
  isPlaying: boolean;
  togglePlay: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
  speed: number;
  setSpeed: (s: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  togglePlay,
  stepForward,
  stepBackward,
  reset,
  speed,
  setSpeed,
}) => {
  return (
    <div className="flex flex-col gap-2 px-4 py-2 w-full justify-center h-full">
      <div className="flex items-center justify-between">
        {/* Main Transport */}
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            title="Reset Simulation"
            aria-label="Reset simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-slate-700 mx-1" />

          <button
            onClick={stepBackward}
            disabled={isPlaying}
            className="p-2 text-slate-300 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Step Backward"
            aria-label="Step backward"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className={cn(
              "p-3 rounded-full transition-all shadow-lg cursor-pointer",
              isPlaying
                ? "bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-500/20"
                : "bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20"
            )}
            title={isPlaying ? "Pause simulation" : "Play simulation"}
            aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
          </button>

          <button
            onClick={stepForward}
            disabled={isPlaying}
            className="p-2 text-slate-300 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Step Forward"
            aria-label="Step forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-3 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
          <Gauge className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            aria-label="Simulation playback speed"
            value={2100 - speed}
            onChange={(e) => setSpeed(2100 - parseInt(e.target.value, 10))}
            className="w-20 accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
