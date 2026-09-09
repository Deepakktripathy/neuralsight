import React from 'react';
import { X, Table, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { DataSource } from '../types';
import { PREDEFINED_PROMPTS } from '../lib/prompts';
import { GANSampleRenderer } from './visualizers/GANSampleRenderer';

interface DatasetPreviewModalProps {
  dataSource: DataSource;
  onClose: () => void;
}

export const DatasetPreviewModal: React.FC<DatasetPreviewModalProps> = ({ dataSource, onClose }) => {
  const renderPreview = () => {
    if (dataSource === 'MNIST (Handwriting)') {
      return (
        <div className="grid grid-cols-5 gap-3">
           {Array.from({length: 15}).map((_, i) => (
             <div key={i} className="flex flex-col items-center gap-1.5">
               <div className="w-14 h-14 bg-slate-800 border border-slate-700 flex items-center justify-center rounded-sm">
                 <span className="text-3xl font-bold font-serif opacity-70 blur-[0.5px]">{(i * 7) % 10}</span>
               </div>
               <span className="text-[10px] text-slate-400">Label: {(i * 7) % 10}</span>
             </div>
           ))}
        </div>
      );
    }
    
    if (dataSource.includes('CIFAR')) {
      const classes = ['Airplane', 'Automobile', 'Bird', 'Cat', 'Deer'];
      return (
        <div className="grid grid-cols-5 gap-3">
           {Array.from({length: 15}).map((_, i) => (
             <div key={i} className="flex flex-col items-center gap-1.5">
               <div className="w-14 h-14 bg-slate-800 border border-slate-700 flex flex-col items-center justify-center rounded-sm text-[8px] text-slate-500 overflow-hidden text-center p-1">
                 [RGB Array]
                 <span className="text-indigo-400 opacity-60">32x32px</span>
               </div>
               <span className="text-[9px] text-slate-400">{classes[i % 5]}</span>
             </div>
           ))}
        </div>
      );
    }
    
    if (dataSource.includes('Medical')) {
      return (
        <div className="grid grid-cols-4 gap-3">
           {Array.from({length: 8}).map((_, i) => (
             <div key={i} className="flex flex-col items-center gap-1.5">
               <div className="w-16 h-16 bg-slate-800 border border-slate-700 flex items-center justify-center rounded-sm overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-slate-700 mix-blend-screen opacity-80" />
                 <div className="absolute w-8 h-8 rounded-full bg-slate-400 blur-md opacity-40 mix-blend-overlay" />
                 <span className="relative z-10 text-[8px] font-mono text-slate-500">256x256</span>
               </div>
               <span className="text-[9px] text-slate-400">Class: {Math.random() > 0.5 ? 'Normal' : 'Anomaly'}</span>
             </div>
           ))}
        </div>
      );
    }
    
    if (dataSource.includes('CelebA') || dataSource.includes('Art Landscapes')) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-2 bg-slate-950/60 rounded-xl border border-slate-800">
           {Array.from({length: 8}).map((_, i) => (
             <div key={i} className="flex flex-col items-center gap-1.5">
               <GANSampleRenderer
                 dataSource={dataSource}
                 step={30}
                 latentVector={[]}
                 seedOffset={i}
                 isReal={true}
                 size="sm"
                 showPixelInspector={false}
               />
               <span className="text-[10px] font-mono text-slate-400">Sample #{i + 1}</span>
             </div>
           ))}
        </div>
      );
    }
    
    if (dataSource.includes('Translation') || dataSource.includes('Sentiment') || dataSource.includes('Stock Price')) {
      const examples = dataSource.includes('Translation') ? [
        ['The cat sat on the mat.', 'Le chat s\'est assis sur le tapis.'],
        ['I would like a coffee, please.', 'Je voudrais un café, s\'il vous plaît.'],
        ['How are you today?', 'Comment allez-vous aujourd\'hui?']
      ] : dataSource.includes('Sentiment') ? [
        ['This movie was an absolute waste of time.', 'Negative'],
        ['The acting was brilliant and the story engaging!', 'Positive'],
        ['It was okay, nothing special but not terrible.', 'Neutral']
      ] : [
        ['[150.2, 151.0, 149.5, 152.1]', '153.4 (Next Day)'],
        ['[302.1, 300.5, 298.0, 295.2]', '294.1 (Next Day)'],
        ['[10.5, 11.2, 11.5, 12.0]', '12.8 (Next Day)']
      ];
      return (
        <div className="flex flex-col gap-2">
          {examples.map((ex, i) => (
            <div key={i} className="flex flex-col gap-1 px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg">
              <span className="text-xs text-slate-300 font-mono">Input: {ex[0]}</span>
              <span className="text-[10px] text-emerald-400 font-mono">Target: {ex[1]}</span>
            </div>
          ))}
          <p className="text-[10px] text-slate-500 mt-1">Sequence learning objective.</p>
        </div>
      );
    }
    
    if (dataSource.includes('Gridworld') || dataSource.includes('CartPole') || dataSource.includes('Trading')) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-800/40 border border-slate-800 border-dashed rounded-lg">
          <div className="w-12 h-12 bg-slate-800 border border-slate-700 flex items-center justify-center rounded-lg mb-3">
             <span className="text-xl">🎮</span>
          </div>
          <p className="text-sm font-medium text-slate-300 mb-1">Dynamic Environment</p>
          <p className="text-xs text-slate-500">
            Reinforcement Learning agents do not use static datasets.<br/>
            The agent will learn by taking actions and receiving rewards directly from the {dataSource} environment state.
          </p>
        </div>
      );
    }

    if (dataSource === 'Text Prompt') {
      return (
        <div className="flex flex-col gap-2">
          {PREDEFINED_PROMPTS.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg">
              <span className="text-xs text-slate-300 font-mono">"{p.prompt} <span className="text-slate-600">...</span>"</span>
              <span className="text-[10px] text-emerald-400 font-mono shrink-0">next: {p.next}</span>
            </div>
          ))}
          <p className="text-[10px] text-slate-500 mt-1">The Transformer predicts the highlighted next word from each prompt.</p>
        </div>
      );
    }

    // Tabular Data
    let headers: string[] = [];
    let rows: any[][] = [];
    
    if (dataSource.includes('Boston Housing') || dataSource.includes('House Prices')) {
      headers = ['SqFt', 'Beds', 'Baths', 'Year Built', 'Price ($)'];
      rows = Array.from({length: 10}).map((_, i) => [
        (1200 + i * 150), (2 + i % 3), (1 + i % 2), (1990 + i * 2), ((250000 + i * 35000).toLocaleString())
      ]);
    } else if (dataSource.includes('Iris')) {
      headers = ['Sepal L', 'Sepal W', 'Petal L', 'Petal W', 'Class'];
      const classes = ['Setosa', 'Versicolor', 'Virginica'];
      rows = Array.from({length: 10}).map((_, i) => [
        (5.1 + i * 0.1).toFixed(1), (3.5 - i * 0.05).toFixed(1), (1.4 + i * 0.2).toFixed(1), (0.2 + i * 0.1).toFixed(1), classes[i % 3]
      ]);
    } else if (dataSource.includes('Customer Churn')) {
      headers = ['Tenure', 'MonthlyCharges', 'TotalCharges', 'Churn'];
      rows = Array.from({length: 10}).map((_, i) => [
        (1 + i * 5), (20 + i * 10.5).toFixed(2), (20 + i * 10.5 * (1 + i * 5)).toFixed(2), Math.random() > 0.5 ? 'Yes' : 'No'
      ]);
    } else {
      headers = ['Feature 1', 'Feature 2', 'Target'];
      rows = Array.from({length: 10}).map((_, i) => [
        Math.random().toFixed(2), Math.random().toFixed(2), Math.random() > 0.5 ? 'A' : 'B'
      ]);
    }

    return (
      <div className="w-full overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800 text-slate-400 border-b border-slate-700">
            <tr>
              {headers.map(h => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/50">
                {row.map((cell, j) => <td key={j} className="px-3 py-2">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] overflow-hidden transform transition-all">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/30">
          <div className="flex items-center gap-2">
            {dataSource.includes('MNIST') || dataSource.includes('CIFAR') ? <ImageIcon className="w-4 h-4 text-indigo-400" /> : dataSource === 'Text Prompt' ? <MessageSquare className="w-4 h-4 text-indigo-400" /> : <Table className="w-4 h-4 text-indigo-400" />}
            <h3 className="text-sm font-semibold text-slate-200">DataSource Preview: {dataSource}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};
