import { Architecture, UseCase, DataSource } from '../types';

export interface UseCaseDetail {
  id: UseCase;
  label: string;
  description: string;
}

export interface DataSourceDetail {
  id: DataSource;
  label: string;
  description: string;
  sampleShape: string;
}

export interface ArchitectureMetadata {
  id: Architecture;
  title: string;
  fullName: string;
  summary: string;
  domainTag: string;
  keyMechanism: string;
  dataSourceCategoryLabel: string;
  useCases: UseCaseDetail[];
  dataSources: DataSourceDetail[];
}

export const ARCHITECTURE_METADATA: Record<Architecture, ArchitectureMetadata> = {
  'Standard NN': {
    id: 'Standard NN',
    title: 'Standard NN',
    fullName: 'Multi-Layer Perceptron',
    summary: 'Dense network connecting every adjacent neuron to carve non-linear decision boundaries.',
    domainTag: 'Tabular Data',
    keyMechanism: 'Dense · ReLU · Backprop',
    dataSourceCategoryLabel: 'Dataset',
    useCases: [
      {
        id: 'Classification',
        label: 'Classification',
        description: 'Split features into discrete classes.'
      },
      {
        id: 'Regression',
        label: 'Regression',
        description: 'Predict continuous numeric targets.'
      }
    ],
    dataSources: [
      {
        id: 'Iris Flowers (Classification)',
        label: 'Iris Flowers',
        description: '4 floral traits classifying 3 Iris species.',
        sampleShape: '4 features → 3 classes'
      },
      {
        id: 'Boston Housing (Regression)',
        label: 'Housing Valuation',
        description: 'Neighborhood metrics predicting home prices.',
        sampleShape: '4 features → 1 scalar'
      },
      {
        id: 'Customer Churn (Binary)',
        label: 'Customer Churn',
        description: 'Account activity predicting renewal vs. churn.',
        sampleShape: '4 metrics → Binary'
      }
    ]
  },
  'CNN': {
    id: 'CNN',
    title: 'CNN',
    fullName: 'Convolutional Network',
    summary: 'Scans 2D grids with filter kernels and pooling to extract hierarchical visual features.',
    domainTag: 'Computer Vision',
    keyMechanism: '2D Conv · Stride · Pooling',
    dataSourceCategoryLabel: 'Dataset',
    useCases: [
      {
        id: 'Classification',
        label: 'Image Classification',
        description: 'Map spatial features to class probabilities.'
      },
      {
        id: 'Segmentation',
        label: 'Feature Localization',
        description: 'Highlight salient 2D regions across the grid.'
      }
    ],
    dataSources: [
      {
        id: 'MNIST (Handwriting)',
        label: 'MNIST Digits',
        description: 'Grayscale handwritten numerals 0–9.',
        sampleShape: '28×28×1 tensor'
      },
      {
        id: 'CIFAR-10 (Objects/Animals)',
        label: 'CIFAR-10 Objects',
        description: 'Multi-channel vehicle and animal silhouettes.',
        sampleShape: '32×32×3 grid'
      },
      {
        id: 'Medical Scans (X-Rays)',
        label: 'Chest X-Rays',
        description: 'Radiographic patterns for anomaly screening.',
        sampleShape: '64×64×1 patch'
      }
    ]
  },
  'Transformer': {
    id: 'Transformer',
    title: 'Transformer',
    fullName: 'Self-Attention Network',
    summary: 'Processes sequences in parallel, routing context between any tokens via Q-K-V attention.',
    domainTag: 'Language & Sequences',
    keyMechanism: 'Q-K-V Attention · Multi-Head',
    dataSourceCategoryLabel: 'Dataset',
    useCases: [
      {
        id: 'Generation',
        label: 'Token Generation',
        description: 'Predict next tokens from sequence context.'
      },
      {
        id: 'Classification',
        label: 'Sequence Classification',
        description: 'Pool token context to score sentiment or regime.'
      }
    ],
    dataSources: [
      {
        id: 'Language Translation (En -> Fr)',
        label: 'En → Fr Translation',
        description: 'Cross-lingual phrase alignment and reordering.',
        sampleShape: 'Tokens (L ≤ 8)'
      },
      {
        id: 'IMDB Sentiment Reviews',
        label: 'IMDB Reviews',
        description: 'Film clauses where modifiers govern polarity.',
        sampleShape: 'Embeddings (d = 64)'
      },
      {
        id: 'Stock Price History',
        label: 'Market Candles',
        description: 'Price-volume ticks capturing momentum shifts.',
        sampleShape: 'Window (T = 8)'
      },
      {
        id: 'Text Prompt',
        label: 'Custom Prompt',
        description: 'Inspect live token-to-token self-attention.',
        sampleShape: 'Live token stream'
      }
    ]
  },
  'RNN': {
    id: 'RNN',
    title: 'RNN',
    fullName: 'Recurrent Network (LSTM/GRU)',
    summary: 'Steps through sequences one token at a time, maintaining a hidden state as working memory.',
    domainTag: 'Sequential Memory',
    keyMechanism: 'Recurrence · Gates · BPTT',
    dataSourceCategoryLabel: 'Dataset',
    useCases: [
      {
        id: 'Generation',
        label: 'Step Prediction',
        description: 'Unroll hidden states to forecast the next step.'
      },
      {
        id: 'Classification',
        label: 'Sequence Readout',
        description: 'Accumulate step evidence into a final class.'
      }
    ],
    dataSources: [
      {
        id: 'Language Translation (En -> Fr)',
        label: 'En → Fr Sequence',
        description: 'Sequential progression over language tokens.',
        sampleShape: 'Steps (T = 3..8)'
      },
      {
        id: 'IMDB Sentiment Reviews',
        label: 'IMDB Sentiment',
        description: 'Hidden state shifts as modifier words arrive.',
        sampleShape: 'Words → Polarity'
      },
      {
        id: 'Stock Price History',
        label: 'Market Ticks',
        description: 'Time series testing short vs. long-term memory.',
        sampleShape: 'Scalar steps'
      },
      {
        id: 'Text Prompt',
        label: 'Custom Sequence',
        description: 'Feed custom tokens through RNN, LSTM, or GRU.',
        sampleShape: 'Dynamic tokens'
      }
    ]
  },
  'GAN': {
    id: 'GAN',
    title: 'GAN',
    fullName: 'Adversarial Network',
    summary: 'Pits a Generator creating samples from noise against a Discriminator spotting counterfeits.',
    domainTag: 'Generative Synthesis',
    keyMechanism: 'Minimax · Latent z · Nash Eq.',
    dataSourceCategoryLabel: 'Target Distribution',
    useCases: [
      {
        id: 'Generation',
        label: 'Distribution Synthesis',
        description: 'Map latent noise z ~ N(0, I) to image manifolds.'
      }
    ],
    dataSources: [
      {
        id: 'Celebrity Faces (CelebA)',
        label: 'CelebA Portraits',
        description: 'Facial symmetry and illumination gradients.',
        sampleShape: 'z → 16×16 portrait'
      },
      {
        id: 'MNIST (Handwriting)',
        label: 'MNIST Digits',
        description: 'Stroke topology for smooth latent morphing.',
        sampleShape: 'z → 16×16 matrix'
      },
      {
        id: 'Art Landscapes',
        label: 'Art Landscapes',
        description: 'Sky-to-terrain horizon color compositions.',
        sampleShape: 'z → 16×16 color grid'
      }
    ]
  },
  'DQN': {
    id: 'DQN',
    title: 'DQN',
    fullName: 'Deep Q-Network',
    summary: 'RL agent interacting with an environment, estimating future rewards Q(s, a) for control.',
    domainTag: 'Reinforcement Learning',
    keyMechanism: 'Bellman · ε-Greedy · Replay',
    dataSourceCategoryLabel: 'Environment',
    useCases: [
      {
        id: 'Control',
        label: 'Policy Control',
        description: 'Maximize cumulative reward via Q-value actions.'
      }
    ],
    dataSources: [
      {
        id: 'Gridworld Maze',
        label: 'Gridworld Maze',
        description: 'Avoid hazards to reach the goal in minimal steps.',
        sampleShape: '5×5 grid → 4 actions'
      },
      {
        id: 'CartPole',
        label: 'CartPole Balance',
        description: 'Apply cart impulses to keep a pole upright.',
        sampleShape: '4 states → L / R'
      },
      {
        id: 'Market Trading',
        label: 'Market Execution',
        description: 'Long / Hold / Short actions under noisy regimes.',
        sampleShape: 'State → 3 actions'
      }
    ]
  },
  'Custom Model': {
    id: 'Custom Model',
    title: 'Custom Model',
    fullName: 'ONNX / JSON Graph',
    summary: 'Upload a serialized neural graph (.onnx or .json) to inspect layer topologies and shapes.',
    domainTag: 'Graph Inspector',
    keyMechanism: 'DAG Layout · Tensor Shapes',
    dataSourceCategoryLabel: 'Graph File',
    useCases: [
      {
        id: 'Classification',
        label: 'Topology Inspection',
        description: 'Inspect operator nodes, edges, and tensor shapes.'
      }
    ],
    dataSources: [
      {
        id: 'Text Prompt',
        label: 'Local ONNX / JSON',
        description: 'Client-side graph parsing with auto DAG layout.',
        sampleShape: 'Nodes · Edges'
      }
    ]
  }
};

export const ORDERED_ARCHITECTURES: Architecture[] = [
  'Standard NN',
  'CNN',
  'Transformer',
  'RNN',
  'GAN',
  'DQN',
  'Custom Model'
];
