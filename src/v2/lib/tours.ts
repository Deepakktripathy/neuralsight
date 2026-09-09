export interface TourPhase {
  title: string;
  description: string;
  color: 'indigo' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'purple';
}

export interface TourData {
  phases: TourPhase[];
  quiz: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  };
}

export const ARCHITECTURE_TOURS: Record<string, TourData> = {
  'Standard NN': {
    phases: [
      {
        title: 'Forward Pass',
        description: 'Data flows from the input through each hidden layer. Nodes multiply inputs by weights and apply an activation function.',
        color: 'indigo'
      },
      {
        title: 'Loss Calculation',
        description: 'The final prediction is compared to the true label. The difference is quantified as the "Loss".',
        color: 'rose'
      },
      {
        title: 'Backpropagation',
        description: 'The error flows backward through the network. Gradients are computed to see how each weight contributed to the mistake.',
        color: 'emerald'
      },
      {
        title: 'Weight Optimization',
        description: 'The optimizer uses the gradients to slightly adjust the weights, reducing the expected error for the next time.',
        color: 'amber'
      }
    ],
    quiz: {
      question: 'Which phase is responsible for figuring out how much to blame each weight for the error?',
      options: ['Forward Pass', 'Loss Calculation', 'Backpropagation', 'Weight Optimization'],
      answer: 2,
      explanation: 'Backpropagation calculates the gradients, which effectively assign "blame" to each weight based on how it affected the loss.'
    }
  },
  'CNN': {
    phases: [
      {
        title: 'Convolution',
        description: 'A small filter (kernel) slides over the image, performing element-wise multiplication to detect features like edges or textures.',
        color: 'indigo'
      },
      {
        title: 'Activation & Pooling',
        description: 'ReLU removes negative values, and Pooling shrinks the spatial dimensions, keeping only the strongest activations.',
        color: 'cyan'
      },
      {
        title: 'Flattening',
        description: 'The 2D feature maps are unrolled into a single 1D list of numbers so a standard neural network can process them.',
        color: 'purple'
      },
      {
        title: 'Dense Layers & Prediction',
        description: 'Fully connected layers use the extracted features to output a final probability distribution over the classes.',
        color: 'rose'
      }
    ],
    quiz: {
      question: 'What is the main purpose of the Pooling step in a CNN?',
      options: ['To detect complex shapes', 'To reduce spatial dimensions and compute', 'To assign final probabilities', 'To add color to the image'],
      answer: 1,
      explanation: 'Pooling downsamples the feature maps, reducing the amount of computation and making the network more robust to small translations.'
    }
  },
  'Transformer': {
    phases: [
      {
        title: 'Tokenization & Embedding',
        description: 'Words are split into tokens and converted into continuous vector representations, capturing initial semantic meaning.',
        color: 'indigo'
      },
      {
        title: 'Self-Attention',
        description: 'Every word looks at every other word to build context. "Bank" figures out if it means river bank or financial bank.',
        color: 'emerald'
      },
      {
        title: 'Feed-Forward',
        description: 'The contextualized vectors are passed through standard neural network layers to further refine their representations.',
        color: 'purple'
      },
      {
        title: 'Next-Token Prediction',
        description: 'The final vectors are projected back into the vocabulary space to predict the most likely next word.',
        color: 'amber'
      }
    ],
    quiz: {
      question: 'How does a Transformer know what "bank" means in "bank of the river"?',
      options: ['By memorizing the sentence', 'Through Tokenization', 'Through Self-Attention', 'By guessing randomly'],
      answer: 2,
      explanation: 'Self-Attention allows the word "bank" to incorporate meaning from surrounding words like "river", clarifying its context.'
    }
  },
  'DQN': {
    phases: [
      {
        title: 'Observe State',
        description: 'The agent looks at its environment (e.g., its position on a grid) and passes this state into its neural network.',
        color: 'indigo'
      },
      {
        title: 'Predict Q-Values',
        description: 'The network outputs a Q-value for every possible action, estimating the total future reward of taking that action.',
        color: 'emerald'
      },
      {
        title: 'Take Action',
        description: 'The agent usually picks the action with the highest Q-value, but sometimes explores a random action to learn more.',
        color: 'amber'
      },
      {
        title: 'Reward & Update',
        description: 'The environment gives a reward. The agent updates its Q-network to make better predictions next time it sees this state.',
        color: 'rose'
      }
    ],
    quiz: {
      question: 'What exactly does a Q-value represent?',
      options: ['The current reward', 'The estimated total future reward', 'The agent\'s speed', 'The loss function'],
      answer: 1,
      explanation: 'A Q-value estimates the expected sum of all future rewards if the agent takes a specific action in a specific state.'
    }
  },
  'GAN': {
    phases: [
      {
        title: 'Generate Fake',
        description: 'The Generator takes random noise and tries to transform it into a piece of data that looks real.',
        color: 'indigo'
      },
      {
        title: 'Discriminate Real vs Fake',
        description: 'The Discriminator looks at a mix of real data and the Generator\'s fakes, trying to guess which is which.',
        color: 'emerald'
      },
      {
        title: 'Train Discriminator',
        description: 'The Discriminator is updated to become better at catching the fakes and recognizing the real data.',
        color: 'rose'
      },
      {
        title: 'Train Generator',
        description: 'The Generator is updated based on what fooled the Discriminator, making its fakes even more realistic.',
        color: 'amber'
      }
    ],
    quiz: {
      question: 'How does the Generator in a GAN improve its output?',
      options: ['By looking at the real images', 'By receiving feedback from the Discriminator', 'By memorizing pixels', 'By increasing its layers'],
      answer: 1,
      explanation: 'The Generator never sees the real images directly; it only learns by trying to fool the Discriminator and using its feedback.'
    }
  },
  'RNN': {
    phases: [
      {
        title: 'Process Current Input',
        description: 'The network takes in the current element of the sequence (e.g., a word or a stock price).',
        color: 'indigo'
      },
      {
        title: 'Combine with Memory',
        description: 'The new input is merged with the "hidden state" (memory) carried over from the previous step.',
        color: 'emerald'
      },
      {
        title: 'Update Memory',
        description: 'A new hidden state is generated, capturing the context of everything seen so far in the sequence.',
        color: 'purple'
      },
      {
        title: 'Output & Next Step',
        description: 'The network can make a prediction based on the current memory, then it loops back for the next element.',
        color: 'amber'
      }
    ],
    quiz: {
      question: 'How does an RNN handle sequences of data compared to a Standard NN?',
      options: ['It uses more layers', 'It processes the whole sequence at once', 'It passes a hidden state (memory) from one step to the next', 'It ignores older data'],
      answer: 2,
      explanation: 'RNNs maintain a hidden state that acts as memory, passing it forward to give context to each new step in the sequence.'
    }
  }
};
