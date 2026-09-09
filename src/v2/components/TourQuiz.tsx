import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface TourQuizProps {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  onContinue: () => void;
}

export const TourQuiz: React.FC<TourQuizProps> = ({ question, options, answer, explanation, onContinue }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const isCorrect = selected === answer;
  const showFeedback = selected !== null;

  return (
    <div className="text-left space-y-4 pointer-events-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 text-sm font-bold shrink-0">?</div>
        <h3 className="text-lg font-semibold text-slate-100">Knowledge Check</h3>
      </div>
      
      <p className="text-sm text-slate-300 font-medium">{question}</p>
      
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => !showFeedback && setSelected(i)}
            disabled={showFeedback}
            className={cn(
              "w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all",
              showFeedback 
                ? (i === answer 
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200" 
                    : (selected === i 
                        ? "bg-rose-500/20 border-rose-500/50 text-rose-200" 
                        : "bg-slate-800/50 border-slate-700 text-slate-500"))
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-indigo-500/50"
            )}
          >
            <div className="flex items-center justify-between">
              <span>{opt}</span>
              {showFeedback && i === answer && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              {showFeedback && selected === i && i !== answer && <XCircle className="w-4 h-4 text-rose-400" />}
            </div>
          </button>
        ))}
      </div>

      {showFeedback && (
        <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-700 animate-in fade-in zoom-in-95">
          <p className="text-xs text-slate-300 mb-3"><span className={isCorrect ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>{isCorrect ? 'Correct!' : 'Not quite.'}</span> {explanation}</p>
          <button 
            onClick={onContinue}
            className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-md text-sm font-medium transition-colors"
          >
            Continue Tour
          </button>
        </div>
      )}
    </div>
  );
};
