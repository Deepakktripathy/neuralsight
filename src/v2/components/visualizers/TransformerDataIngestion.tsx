import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface TransformerDataIngestionProps {
  tokens: string[];
  onComplete: () => void;
}

export const TransformerDataIngestion: React.FC<TransformerDataIngestionProps> = ({ tokens, onComplete }) => {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    // 0 -> 1: Show tokens splitting
    const t1 = setTimeout(() => setPhase(1), 1500);
    // 1 -> 2: Show embeddings
    const t2 = setTimeout(() => setPhase(2), 3500);
    // Complete
    const t3 = setTimeout(() => {
       onComplete();
    }, 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [tokens, onComplete]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
      <button 
        onClick={onComplete}
        className="absolute top-6 right-6 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 font-mono transition-colors"
      >
        Skip &rarr;
      </button>
      <div className="flex flex-col items-center gap-12 w-full max-w-4xl px-8">
        
        {/* Phase 0/1: Raw Text to Tokens */}
        <div className="flex flex-col items-center gap-4">
          <span className="text-slate-400 font-mono text-sm tracking-wider uppercase">1. Tokenization</span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {tokens.map((token, idx) => (
              <motion.div
                key={`tok-${idx}`}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xl font-medium shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, x: phase >= 1 ? 0 : 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {token}
                <AnimatePresence>
                  {phase >= 1 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-[10px] text-indigo-400 font-mono mt-1 pt-1 border-t border-slate-700 text-center"
                    >
                      ID: {Math.floor(Math.random() * 50000) + 1000}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Phase 2: Embeddings */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              <div className="flex items-center gap-2 text-slate-500">
                 <ArrowRight className="w-5 h-5 rotate-90" />
              </div>
              <span className="text-slate-400 font-mono text-sm tracking-wider uppercase">2. Vector Embedding</span>
              <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                {tokens.map((token, idx) => (
                  <motion.div
                    key={`emb-${idx}`}
                    className="flex flex-col items-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="text-[10px] text-slate-500 font-mono mb-1">{token}</div>
                    <div className="grid grid-rows-4 gap-1 p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-md">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="text-[9px] font-mono text-indigo-300 px-2 py-0.5 bg-slate-900 rounded">
                          {(Math.random() * 2 - 1).toFixed(3)}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 px-4 py-2 bg-slate-800 text-slate-300 rounded-md text-xs animate-pulse">
                Ready for self-attention...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
