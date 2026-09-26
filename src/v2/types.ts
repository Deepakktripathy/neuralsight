export type Architecture = 'CNN' | 'Transformer' | 'DQN' | 'Standard NN' | 'GAN' | 'RNN' | 'Custom Model';
export type Mode = 'Train' | 'Inference';
export type UseCase = 'Classification' | 'Segmentation' | 'Generation' | 'Control' | 'Regression';
export type LossFunction = 'Cross-Entropy' | 'MSE' | 'Huber';
export type Optimizer = 'Adam' | 'SGD' | 'RMSprop';
export type DataSource = 
  | 'MNIST (Handwriting)' | 'CIFAR-10 (Objects/Animals)' | 'Medical Scans (X-Rays)' 
  | 'Language Translation (En -> Fr)' | 'IMDB Sentiment Reviews' | 'Stock Price History' 
  | 'Gridworld Maze' | 'CartPole' | 'Market Trading' 
  | 'Celebrity Faces (CelebA)' | 'Art Landscapes' 
  | 'Iris Flowers (Classification)' | 'Boston Housing (Regression)' | 'Customer Churn (Binary)' 
  | 'Text Prompt';

export type FailureMode = 'None' | 'Exploding Gradients' | 'Vanishing Gradients' | 'Overfitting' | 'Attention Collapse' | 'Mode Collapse' | 'Discriminator Overpowering' | 'Poor Exploration';

export interface Hyperparameters {
  learningRate: number;
  batchSize: number;
  epochs: number;
  layers: number;
  lossFunction: LossFunction;
  optimizer: Optimizer;
  failureMode?: FailureMode;
  // Architecture-specific structural knobs
  attentionHeads?: 1 | 2 | 4;
  convLayers?: 1 | 2 | 3;
  poolingType?: 'Max' | 'Average';
  stride?: 1 | 2 | 3;
  rnnCellType?: 'Vanilla RNN' | 'LSTM' | 'GRU';
  rnnUnrollSteps?: 3 | 5 | 8;
  dqnExplorationSchedule?: 'Fast (Greedy)' | 'Standard' | 'High Exploration';
  dqnDiscountFactor?: 0.50 | 0.90 | 0.99;
  mlpNeuronsPerLayer?: 4 | 8 | 16;
}

export interface SimulationState {
  architecture: Architecture;
  mode: Mode;
  useCase: UseCase;
  hyperparams: Hyperparameters;
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number; // ms per step
  inputData: any;
  metrics: {
    loss: number[];
    accuracy: number[];
  };
}

export interface NodeState {
  id: string;
  activation: number;
  layerIndex: number;
}

export interface EdgeState {
  id: string;
  source: string;
  target: string;
  weight: number;
  gradient: number;
}