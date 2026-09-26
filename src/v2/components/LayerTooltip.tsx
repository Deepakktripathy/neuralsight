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
  const [isHovered, setIsHovered] = useState(false);
  const [hoverCoords, setHoverCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    placement: 'top',
  });
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 260;
    const tooltipHeight = 90;
    const padding = 12;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (left < padding) {
      left = padding;
    } else if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }

    let top = rect.top - 8;
    let placement: 'top' | 'bottom' = 'top';

    if (rect.top - tooltipHeight < padding) {
      placement = 'bottom';
      top = rect.bottom + 8;
    }

    setHoverCoords({ top, left, placement });
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (!isHovered) return;
    const handleScrollOrResize = () => updatePosition();
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
    };
  }, [isHovered]);

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

  const hoverTooltip = isHovered && !isFocused && description && typeof document !== 'undefined' ? (
    createPortal(
      <div
        style={{
          position: 'fixed',
          top: hoverCoords.top,
          left: hoverCoords.left,
          transform: hoverCoords.placement === 'top' ? 'translateY(-100%)' : 'none',
          zIndex: 99999,
          pointerEvents: 'none',
          width: '260px',
          maxWidth: 'calc(100vw - 24px)',
        }}
        className="p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl text-left transition-opacity duration-150 ring-1 ring-white/10"
      >
        <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 mb-1">
          {label}
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed m-0 whitespace-normal break-words">
          {description}
        </p>
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => description && setIsFocused(true)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative flex items-center justify-center gap-1.5 cursor-pointer transition-transform hover:scale-105 bg-transparent border-none p-0 m-0 font-inherit"
      >
        <span className="text-[11px] text-slate-500 hover:text-slate-300 whitespace-nowrap transition-colors">
          {label}
        </span>
        <Info className="w-3.5 h-3.5 text-slate-600 hover:text-indigo-400 transition-colors" />
      </button>
      {typeof document !== 'undefined' ? createPortal(modal, document.body) : modal}
      {hoverTooltip}
    </>
  );
};
