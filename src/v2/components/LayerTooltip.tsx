import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

interface LayerTooltipProps {
  label: string;
  description: string;
  position?: 'left' | 'center' | 'right';
  align?: 'top' | 'bottom';
}

export const LayerTooltip: React.FC<LayerTooltipProps> = ({ label, description }) => {
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

  const hoverTooltip =
    isHovered && !isFocused && description && typeof document !== 'undefined'
      ? createPortal(
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
            <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 mb-1">
              {label}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed m-0 whitespace-normal break-words">
              {description}
            </p>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => description && setIsFocused(true)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative flex items-center justify-center gap-1.5 cursor-pointer transition-colors bg-transparent border-none p-0 m-0 font-inherit"
        aria-label={`Inspect ${label} details`}
      >
        <span className="text-[11px] text-slate-400 hover:text-slate-200 whitespace-nowrap transition-colors">
          {label}
        </span>
      </button>

      <Dialog open={isFocused} onOpenChange={setIsFocused}>
        <DialogContent className="max-w-sm p-0 gap-0">
          <DialogHeader className="pr-10">
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription className="sr-only">
              Layer architecture explanation
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-4">
            <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
          </div>
        </DialogContent>
      </Dialog>

      {hoverTooltip}
    </>
  );
};
