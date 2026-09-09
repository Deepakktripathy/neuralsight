import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayerTooltipProps {
  label: string;
  description: string;
  position?: 'left' | 'center' | 'right';
  align?: 'top' | 'bottom';
}

export const LayerTooltip: React.FC<LayerTooltipProps> = ({ label, description, position = 'center', align = 'top' }) => {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFocused(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFocused]);

  const modal = (
    <AnimatePresence>
      {isFocused && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsFocused(false)}
        >
          <motion.div
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg p-6 max-w-sm w-full text-left cursor-auto"
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-base font-medium text-slate-100">{label}</h3>
              <button
                onClick={() => setIsFocused(false)}
                className="text-slate-500 hover:text-white transition-colors shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {description}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => description && setIsFocused(true)}
        className="relative flex items-center justify-center gap-1.5 group hover:z-50 cursor-pointer transition-transform hover:scale-105 bg-transparent border-none p-0 m-0 font-inherit"
      >
        <span className="text-[11px] text-slate-500 group-hover:text-slate-300 whitespace-nowrap transition-colors">
          {label}
        </span>
        <Info className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
        
        <div className={`absolute w-56 max-w-[85vw] p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover:translate-y-0 text-left z-50 ${
          align === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} ${position === 'left' ? 'left-0' :
          position === 'right' ? 'right-0' :
          'left-1/2 -translate-x-1/2'
        }`}>
          <p className="text-[11px] text-slate-300 leading-relaxed m-0 whitespace-normal break-words">
            {description}
          </p>
        </div>
      </button>
      {typeof document !== 'undefined' ? createPortal(modal, document.body) : modal}
    </>
  );
};
