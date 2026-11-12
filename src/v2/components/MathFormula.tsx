import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  formula,
  displayMode = true,
  className = '',
}) => {
  const renderedHtml = useMemo(() => {
    if (!formula) return '';
    try {
      return katex.renderToString(formula, {
        throwOnError: false,
        displayMode: displayMode,
      });
    } catch {
      return '';
    }
  }, [formula, displayMode]);

  if (!renderedHtml) {
    return (
      <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-indigo-300 text-center select-all ${className}`}>
        <code>{formula}</code>
      </div>
    );
  }

  return (
    <div
      className={`p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-indigo-200 text-center overflow-x-auto select-all text-xs sm:text-sm font-sans tracking-wide ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
