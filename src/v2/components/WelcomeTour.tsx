import React, { useState } from 'react';
import { Sparkles, Layers, PlaySquare, Gauge, ShieldAlert, ArrowRight, ArrowLeft, X } from 'lucide-react';

interface WelcomeTourProps {
  onClose: () => void;
  architecture?: string;
}

const STEPS = [
  {
    icon: Sparkles,
    color: 'indigo',
    title: 'Welcome to NeuralSight',
    body: "This is a visual playground for how machine learning models actually work. Pick an architecture, hit play, and watch data flow through it in real time - no math background required to get the intuition.",
  },
  {
    icon: Layers,
    color: 'indigo',
    title: 'Choose an architecture',
    body: "The sidebar on the left lets you pick from six model types - from a simple Standard NN up to Transformers and GANs - along with the task, dataset, and hyperparameters that shape how it behaves.",
  },
  {
    icon: PlaySquare,
    color: 'emerald',
    title: 'Watch it think',
    body: "The main canvas animates the model itself. Indigo shows the forward pass carrying data through the network; rose shows backpropagation carrying error back. Hover any node or connection for its exact value.",
  },
  {
    icon: Gauge,
    color: 'amber',
    title: 'Control the pace',
    body: "Use the playback bar at the bottom to play, pause, step frame-by-frame, or slow things down. The chart next to it tracks loss and accuracy live as training progresses.",
  },
  {
    icon: ShieldAlert,
    color: 'rose',
    title: 'Guided Tour & Failure Sandbox',
    body: "Turn on \"Guided Tour\" (top right) for a slowed-down, narrated walkthrough of one training step. Or open the Failure Sandbox in the sidebar to see what exploding gradients or overfitting actually look like.",
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  rose: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
};

export const WelcomeTour: React.FC<WelcomeTourProps> = ({ onClose, architecture }) => {
  const CUSTOM_STEPS = [
    {
      icon: Sparkles,
      color: 'indigo',
      title: 'Welcome to Custom Model View',
      body: "This mode lets you visualize your own real-world machine learning models. You can upload an ONNX file exported from PyTorch, TensorFlow, or JAX.",
    },
    {
      icon: Layers,
      color: 'emerald',
      title: 'Explore the Graph',
      body: "The canvas renders the computational graph of your model. You can pan, zoom, and explore the precise sequence of operations.",
    },
    {
      icon: Gauge,
      color: 'amber',
      title: 'Inspect Properties',
      body: "Click on any node to open the properties panel on the right. This shows detailed attributes like kernel sizes, strides, activation types, and tensor connections.",
    },
    {
      icon: PlaySquare,
      color: 'rose',
      title: 'Get Started',
      body: "Try uploading your own .onnx file using the upload button, or click \"Use Sample Model\" to explore an example ResNet-18 architecture.",
    }
  ];
  
  const stepsToUse = architecture === 'Custom Model' ? CUSTOM_STEPS : STEPS;

  const [stepIdx, setStepIdx] = useState(0);
  const step = stepsToUse[stepIdx];
  const Icon = step.icon;
  const colors = colorClasses[step.color];
  const isLast = stepIdx === stepsToUse.length - 1;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="relative bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-4 animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors"
          title="Skip tour"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-3">
          <div className={`w-14 h-14 rounded-full ${colors.bg} ${colors.text} border ${colors.border} flex items-center justify-center`}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">{step.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{step.body}</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {stepsToUse.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIdx ? 'w-6 bg-indigo-400' : 'w-1.5 bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
          >
            Skip
          </button>

          <div className="flex items-center gap-2">
            {stepIdx > 0 && (
              <button
                onClick={() => setStepIdx(i => i - 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
            <button
              onClick={() => (isLast ? onClose() : setStepIdx(i => i + 1))}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold bg-indigo-500 text-white hover:bg-indigo-400 transition-colors shadow-md shadow-indigo-500/20"
            >
              {isLast ? "Let's go" : 'Next'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
