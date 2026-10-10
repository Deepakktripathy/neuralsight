import { Architecture, FailureMode } from '../types';

export interface FailureModeOption {
  name: FailureMode;
  desc: string;
}

// Each architecture gets the generic failure modes that genuinely apply to it,
// plus its own famous/textbook failure mode where one exists and is teachable.
export const FAILURE_MODES_BY_ARCH: Record<Architecture, FailureModeOption[]> = {
  'Standard NN': [
    { name: 'None', desc: 'Normal training' },
    { name: 'Exploding Gradients', desc: 'Weights overflow to NaN' },
    { name: 'Vanishing Gradients', desc: 'Signal dies in early layers' },
    { name: 'Overfitting', desc: 'Memorizes training noise' },
  ],
  'CNN': [
    { name: 'None', desc: 'Normal training' },
    { name: 'Exploding Gradients', desc: 'Weights overflow to NaN' },
    { name: 'Vanishing Gradients', desc: 'Signal dies in early layers' },
    { name: 'Overfitting', desc: 'Memorizes exact pixels' },
  ],
  'RNN': [
    { name: 'None', desc: 'Normal training' },
    { name: 'Exploding Gradients', desc: 'Recurrent gradients blow up' },
    { name: 'Vanishing Gradients', desc: 'Early tokens forgotten' },
    { name: 'Overfitting', desc: 'Memorizes sequences' },
  ],
  'Transformer': [
    { name: 'None', desc: 'Normal training' },
    { name: 'Attention Collapse', desc: 'Uniform unfocused attention' },
    { name: 'Overfitting', desc: 'Memorizes sequences' },
  ],
  'GAN': [
    { name: 'None', desc: 'Normal training' },
    { name: 'Mode Collapse', desc: 'G repeats single output' },
    { name: 'Discriminator Overpowering', desc: 'D starves G of gradients' },
  ],
  'DQN': [
    { name: 'None', desc: 'Normal training' },
    { name: 'Poor Exploration', desc: 'Stuck in local loop' },
  ],
  'Custom Model': [
    { name: 'None', desc: 'Normal viewing' },
  ],
};
