import React from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content }) => {
  return (
    <div className="relative group inline-flex items-center ml-1 z-50">
      <Info className="w-3 h-3 text-slate-500 hover:text-indigo-400 cursor-help transition-colors" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-slate-800 border border-slate-600 rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-center whitespace-normal z-50">
        <p className="text-[10px] text-slate-300 font-sans leading-relaxed m-0">
          {content}
        </p>
      </div>
    </div>
  );
};
