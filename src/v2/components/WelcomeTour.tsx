import React, { useState } from 'react';
import { Sparkles, Layers, PlaySquare, Gauge, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';

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
    body: "The sidebar on the left lets you pick from seven model families - from a simple Standard NN up to Transformers and GANs - along with the task, dataset, and hyperparameters that shape how it behaves.",
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
    title: 'Spotlight tour & failure sandbox',
    body: "Open Learn → Spotlight the canvas for a slowed-down, narrated walkthrough of the architecture. Or pick a failure mode in the sidebar to see what exploding gradients or overfitting actually look like.",
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <div className="flex flex-col items-center gap-3 p-5 pt-7 text-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
            <Icon className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-lg">{step.title}</DialogTitle>
            <DialogDescription className="text-sm text-slate-300">{step.body}</DialogDescription>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5">
            {stepsToUse.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIdx ? 'w-6 bg-indigo-400' : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3">
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-400 transition-colors hover:text-slate-200"
          >
            Skip
          </button>

          <div className="flex items-center gap-2">
            {stepIdx > 0 && (
              <button
                onClick={() => setStepIdx((i) => i - 1)}
                className="flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
            <button
              onClick={() => (isLast ? onClose() : setStepIdx((i) => i + 1))}
              className="flex items-center gap-1.5 rounded-md bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-colors hover:bg-indigo-400"
            >
              {isLast ? "Let's go" : 'Next'} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
