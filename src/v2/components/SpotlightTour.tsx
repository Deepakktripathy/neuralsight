import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X } from 'lucide-react';

export interface TourStep {
  id: string; // The DOM id of the element to highlight
  title: string;
  description: string;
}

interface SpotlightTourProps {
  steps: TourStep[];
  onComplete: () => void;
  isOpen: boolean;
}

const SPOT_PADDING = 8;
const TOP_BAR_CLEARANCE = 64; // Header bar height
const BOTTOM_BAR_CLEARANCE = 116; // Bottom controls & metrics bar height

export const SpotlightTour: React.FC<SpotlightTourProps> = ({ steps, onComplete, isOpen }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipDim, setTooltipDim] = useState({ width: 340, height: 180 });

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStepIdx(0);
  }, [isOpen]);

  // Synchronize target element bounding box
  useEffect(() => {
    if (!isOpen) {
      setRect(null);
      return;
    }

    const step = steps[currentStepIdx];
    if (!step) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.getElementById(step.id);
      if (el) {
        setRect(el.getBoundingClientRect());
      }
    };

    const el = document.getElementById(step.id);
    if (el) {
      const b = el.getBoundingClientRect();
      const inComfortableView = b.top >= TOP_BAR_CLEARANCE + 10 && b.bottom <= window.innerHeight - BOTTOM_BAR_CLEARANCE - 10;
      if (!inComfortableView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      updateRect();
    } else {
      // Retry in case element is rendering or switching tabs
      const retryTimer = setTimeout(() => {
        const elRetry = document.getElementById(step.id);
        if (elRetry) {
          const b = elRetry.getBoundingClientRect();
          if (b.top < TOP_BAR_CLEARANCE + 10 || b.bottom > window.innerHeight - BOTTOM_BAR_CLEARANCE - 10) {
            elRetry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          setRect(elRetry.getBoundingClientRect());
        } else {
          setRect(null);
        }
      }, 250);
      return () => clearTimeout(retryTimer);
    }

    // Schedule incremental updates while smooth scrolling or layout settles
    const t1 = setTimeout(updateRect, 80);
    const t2 = setTimeout(updateRect, 200);
    const t3 = setTimeout(updateRect, 400);

    const handleScrollOrResize = () => {
      updateRect();
    };

    window.addEventListener('resize', handleScrollOrResize);
    // capture: true ensures we catch scroll events in child scrollable containers (e.g. overflow-auto)
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, currentStepIdx, steps]);

  // Measure tooltip dimensions dynamically
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const w = tooltipRef.current.offsetWidth || 340;
      const h = tooltipRef.current.offsetHeight || 180;
      setTooltipDim({ width: w, height: h });
    }
  }, [currentStepIdx, rect]);

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const currentStep = steps[currentStepIdx];

  // Spotlight dimensions with generous padding
  const spotTop = rect ? Math.max(0, rect.top - SPOT_PADDING) : 0;
  const spotLeft = rect ? Math.max(0, rect.left - SPOT_PADDING) : 0;
  const spotWidth = rect ? rect.width + SPOT_PADDING * 2 : 0;
  const spotHeight = rect ? rect.height + SPOT_PADDING * 2 : 0;

  // Compute adaptive tooltip positioning with strict viewport boundaries
  const getTooltipStyle = (): React.CSSProperties => {
    if (!rect) {
      return {
        top: '45%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const margin = 14;

    const tWidth = tooltipDim.width;
    const tHeight = tooltipDim.height;

    // Available space in each cardinal direction:
    const spaceBelow = (winH - BOTTOM_BAR_CLEARANCE) - (spotTop + spotHeight);
    const spaceAbove = spotTop - TOP_BAR_CLEARANCE;
    const spaceRight = winW - (spotLeft + spotWidth) - 16;
    const spaceLeft = spotLeft - 16;

    let computedTop = 0;
    let computedLeft = 0;

    // Smart priority:
    // 1. Below (if sufficient room)
    // 2. Above (if sufficient room)
    // 3. To the Right (ideal for wide screens and zoomed out layouts like 75% zoom)
    // 4. To the Left
    // 5. Clamped fallback
    if (spaceBelow >= tHeight + margin) {
      computedTop = spotTop + spotHeight + margin;
      computedLeft = spotLeft + (spotWidth - tWidth) / 2;
    } else if (spaceAbove >= tHeight + margin) {
      computedTop = spotTop - margin - tHeight;
      computedLeft = spotLeft + (spotWidth - tWidth) / 2;
    } else if (spaceRight >= tWidth + margin) {
      computedLeft = spotLeft + spotWidth + margin;
      computedTop = spotTop + Math.max(0, (spotHeight - tHeight) / 2);
    } else if (spaceLeft >= tWidth + margin) {
      computedLeft = spotLeft - margin - tWidth;
      computedTop = spotTop + Math.max(0, (spotHeight - tHeight) / 2);
    } else {
      // If neither full top nor bottom fits, choose the one with more clearance
      if (spaceBelow >= spaceAbove) {
        computedTop = spotTop + spotHeight + 8;
      } else {
        computedTop = spotTop - tHeight - 8;
      }
      computedLeft = spotLeft + (spotWidth - tWidth) / 2;
    }

    // Strict boundary enforcement: NEVER overflow the viewport or bottom playback controls
    const maxTop = Math.max(TOP_BAR_CLEARANCE + 8, winH - BOTTOM_BAR_CLEARANCE - tHeight - 8);
    const finalTop = Math.max(TOP_BAR_CLEARANCE + 8, Math.min(maxTop, computedTop));
    const finalLeft = Math.max(16, Math.min(winW - tWidth - 16, computedLeft));

    return {
      top: finalTop,
      left: finalLeft,
    };
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <AnimatePresence>
        {rect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1, 
              top: spotTop, 
              left: spotLeft, 
              width: spotWidth, 
              height: spotHeight 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute rounded-2xl border-2 border-indigo-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.85)] pointer-events-auto"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!rect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm pointer-events-auto"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentStep && (
          <motion.div
            key={currentStepIdx}
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute z-[101] pointer-events-auto max-w-sm w-80 sm:w-[340px]"
            style={getTooltipStyle()}
          >
            <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl shadow-2xl p-4 sm:p-4.5 flex flex-col gap-3 backdrop-blur-md">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500 text-[11px] flex items-center justify-center font-mono font-bold text-white shadow-sm">
                    {currentStepIdx + 1}
                  </span>
                  {currentStep.title}
                </h3>
                <button 
                  onClick={handleSkip}
                  className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
                  title="Close tour"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentStep.description}
              </p>

              <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono">
                  Step {currentStepIdx + 1} of {steps.length}
                </span>
                <button
                  onClick={handleNext}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1 cursor-pointer"
                >
                  <span>{currentStepIdx < steps.length - 1 ? 'Next' : 'Finish'}</span>
                  {currentStepIdx < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
