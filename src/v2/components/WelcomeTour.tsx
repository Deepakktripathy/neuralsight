import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  PlaySquare,
  Gauge,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';

interface WelcomeTourProps {
  onClose: () => void;
  architecture?: string;
}

const STEPS = [
  {
    icon: Sparkles,
    color: 'indigo',
    title: 'Welcome to NeuralSight',
    body: 'This is a visual playground for how machine learning models actually work. Pick an architecture, hit play, and watch data flow through it in real time.',
  },
  {
    icon: Layers,
    color: 'indigo',
    title: 'Tune the architecture',
    body: 'The sidebar on the left lets you tune hyperparameters, switch layer topologies, and return to Setup to change tasks or datasets.',
  },
  {
    icon: PlaySquare,
    color: 'emerald',
    title: 'Watch it think',
    body: 'The main canvas animates the model itself. Indigo shows the forward pass carrying data through the network; rose shows backpropagation carrying error back.',
  },
  {
    icon: Gauge,
    color: 'amber',
    title: 'Control the pace',
    body: 'Use the playback bar at the bottom to play, pause, step frame-by-frame, or adjust speed. Expand the dashboard in the bottom right to inspect loss and accuracy curves.',
  },
  {
    icon: ShieldAlert,
    color: 'rose',
    title: 'Spotlight & Failure Sandbox',
    body: 'Open Spotlight from the Learn menu for interactive canvas callouts, or inject exploding gradients, vanishing gradients, and overfitting from the Failure Sandbox.',
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
      body: 'Visualize your own machine learning models by uploading an ONNX or JSON graph exported from PyTorch, TensorFlow, or JAX.',
    },
    {
      icon: Layers,
      color: 'emerald',
      title: 'Explore the Graph',
      body: 'The canvas renders the computational graph of your model. Pan, zoom, and explore the sequence of operations.',
    },
    {
      icon: Gauge,
      color: 'amber',
      title: 'Inspect Properties',
      body: 'Click any node to open the properties panel on the right and inspect kernel sizes, strides, activations, and tensor shapes.',
    },
    {
      icon: PlaySquare,
      color: 'rose',
      title: 'Get Started',
      body: 'Upload your own .onnx file or load the sample ResNet-18 architecture directly on the canvas.',
    },
  ];

  const stepsToUse = architecture === 'Custom Model' ? CUSTOM_STEPS : STEPS;
  const [stepIdx, setStepIdx] = useState(0);
  const step = stepsToUse[stepIdx];
  const Icon = step.icon;
  const colors = colorClasses[step.color];
  const isLast = stepIdx === stepsToUse.length - 1;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <div
            className={`w-14 h-14 rounded-full ${colors.bg} ${colors.text} border ${colors.border} flex items-center justify-center`}
          >
            <Icon className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-lg font-semibold text-white">{step.title}</DialogTitle>
            <DialogDescription className="text-sm text-slate-300 leading-relaxed">
              {step.body}
            </DialogDescription>
          </div>
        </div>

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
            className="text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Skip
          </button>

          <div className="flex items-center gap-2">
            {stepIdx > 0 && (
              <button
                onClick={() => setStepIdx((i) => i - 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
            <button
              onClick={() => (isLast ? onClose() : setStepIdx((i) => i + 1))}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-950/50 cursor-pointer"
            >
              {isLast ? "Let's go" : 'Next'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
