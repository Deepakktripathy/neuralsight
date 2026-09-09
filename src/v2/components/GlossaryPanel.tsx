import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { TOOLTIPS, CUSTOM_MODEL_TOOLTIPS } from '../utils/tooltips';

interface GlossaryPanelProps {
  onClose: () => void;
  architecture?: string;
}

export const GlossaryPanel: React.FC<GlossaryPanelProps> = ({ onClose, architecture }) => {
  const activeTooltips = architecture === 'Custom Model' ? CUSTOM_MODEL_TOOLTIPS : TOOLTIPS;
  const panelTitle = architecture === 'Custom Model' ? 'Custom Model Glossary' : `${architecture || 'NeuralSight'} Glossary`;
  return (
    <div className="absolute top-0 right-0 h-full w-64 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-50 transform transition-transform duration-300">
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/50">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          {panelTitle}
        </h3>
        <button 
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {Object.entries(activeTooltips).map(([category, terms]) => (
          <div key={category} className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-800 pb-1">
              {category}
            </h4>
            <div className="space-y-4">
              {Object.entries(terms).map(([term, definition]) => (
                <div key={term} className="space-y-1">
                  <div className="text-xs font-medium text-indigo-300">{term}</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">{definition}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
