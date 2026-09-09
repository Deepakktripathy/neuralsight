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
    { name: 'Exploding Gradients', desc: 'Learning rate too high (NaN)' },
    { name: 'Vanishing Gradients', desc: 'Too deep + sigmoid (stuck)' },
    { name: 'Overfitting', desc: 'Memorizing noise (poor generalization)' },
  ],
  'CNN': [
    { name: 'None', desc: 'Normal training' },
    { name: 'Exploding Gradients', desc: 'Learning rate too high (NaN)' },
    { name: 'Vanishing Gradients', desc: 'Too deep + sigmoid (stuck)' },
    { name: 'Overfitting', desc: 'Memorizing exact training pixels' },
  ],
  'RNN': [
    { name: 'None', desc: 'Normal training' },
    { name: 'Exploding Gradients', desc: 'Gradients blow up through time (NaN)' },
    { name: 'Vanishing Gradients', desc: 'Early words forgotten over a long sequence' },
    { name: 'Overfitting', desc: 'Memorizing exact training sequences' },
  ],
  'Transformer': [
    { name: 'None', desc: 'Normal training' },
    { name: 'Attention Collapse', desc: 'Attention spreads evenly, loses focus' },
    { name: 'Overfitting', desc: 'Memorizing exact training sequences' },
  ],
  'GAN': [
    { name: 'None', desc: 'Normal training' },
    { name: 'Mode Collapse', desc: 'Generator repeats one output for any input' },
    { name: 'Discriminator Overpowering', desc: 'Discriminator too strong (G receives 0 gradients)' },
  ],
  'DQN': [
    { name: 'None', desc: 'Normal training' },
    { name: 'Poor Exploration', desc: 'Agent gets stuck, values never reach the goal' },
  ],
  'Custom Model': [
    { name: 'None', desc: 'Normal viewing' },
  ],
};
