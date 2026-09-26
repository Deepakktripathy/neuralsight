import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    placement: 'top',
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 240; // Max preferred tooltip width
    const tooltipHeight = 70; // Estimated height
    const padding = 12; // Safety margin from viewport edge

    // Horizontal positioning: center on icon, but clamp strictly within viewport boundaries
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (left < padding) {
      left = padding;
    } else if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }

    // Vertical positioning: default to placing above, flip to below if near screen top
    let top = rect.top - 8; // Will be translated -100% in CSS if placement === 'top'
    let placement: 'top' | 'bottom' = 'top';

    if (rect.top - tooltipHeight < padding) {
      // Not enough room above, flip below
      placement = 'bottom';
      top = rect.bottom + 8;
    }

    setCoords({ top, left, placement });
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Re-calculate on window resize or scroll when open
  useEffect(() => {
    if (!isVisible) return;
    const handleScrollOrResize = () => {
      updatePosition();
    };
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
    };
  }, [isVisible]);

  const tooltipElement = isVisible && typeof document !== 'undefined' ? (
    createPortal(
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top: coords.top,
          left: coords.left,
          transform: coords.placement === 'top' ? 'translateY(-100%)' : 'none',
          zIndex: 99999,
          pointerEvents: 'none',
          width: '240px',
          maxWidth: 'calc(100vw - 24px)',
        }}
        className="p-2.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-lg shadow-2xl text-center transition-opacity duration-150 animate-in fade-in zoom-in-95 ring-1 ring-white/10"
      >
        <p className="text-[11px] text-slate-200 font-sans leading-relaxed m-0 text-left">
          {content}
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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className={`inline-flex items-center justify-center p-0.5 ml-1 rounded-full text-slate-500 hover:text-indigo-400 focus:outline-none focus:text-indigo-400 transition-colors cursor-help ${className || ''}`}
        aria-label="Information"
      >
        <Info className="w-3 h-3" />
      </button>
      {tooltipElement}
    </>
  );
};
