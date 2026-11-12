import { Architecture } from '../types';

export interface GlossaryItem {
  term: string;
  definition: string;
  formula?: string;
  category?: string;
  tldrCues?: string[];
}

export interface TrainingExpectation {
  architecture: Architecture;
  title: string;
  summary: string;
  phases: {
    phase: string;
    metricsExpectation: string;
    visualWhatToWatch: string;
  }[];
  keyWatchouts: string[];
}

export const GENERAL_TRAINING_GLOSSARY: Record<string, GlossaryItem> = {
  'Loss Function': {
    term: 'Loss Function',
    definition:
      'The mathematical penalty measuring the gap between model predictions and ground-truth labels. In healthy training, this curve trends steadily downward.',
    formula: 'L(\\theta) = -\\sum y_i \\log(\\hat{y}_i)',
    category: 'Core Metrics',
  },
  'Accuracy': {
    term: 'Accuracy',
    definition:
      'The percentage of samples where the model predicts the correct ground truth class. Rises as weights optimize.',
    category: 'Core Metrics',
  },
  'Epoch vs Step': {
    term: 'Epoch vs Step',
    definition:
      'A Step is one forward-and-backward pass on a single batch. An Epoch represents one complete traversal over the entire dataset.',
    category: 'Core Metrics',
  },
  'Learning Rate (α)': {
    term: 'Learning Rate (α)',
    definition:
      'The step size used by the optimizer during gradient descent updates. Too high causes oscillation or NaN divergence; too low results in slow convergence.',
    formula: 'W \\leftarrow W - \\alpha \\nabla_W L',
    category: 'Optimization',
  },
  'Gradients & Backprop': {
    term: 'Gradients & Backprop',
    definition:
      'Backpropagation applies the calculus chain rule backwards from output to input to calculate the exact direction and magnitude needed to update each parameter.',
    formula: '\\frac{\\partial L}{\\partial W_l} = \\frac{\\partial L}{\\partial z_l} \\cdot a_{l-1}^T',
    category: 'Optimization',
  },
  'Optimizer': {
    term: 'Optimizer',
    definition:
      'The update algorithm (Adam, SGD, RMSprop) deciding how gradients translate into parameter changes, often incorporating momentum and adaptive per-parameter learning rates.',
    category: 'Optimization',
  },
  'Batch Size': {
    term: 'Batch Size',
    definition:
      'The number of training samples evaluated together before triggering a weight update. Balances gradient noise with hardware compute parallelism.',
    category: 'Optimization',
  },
  'Overfitting': {
    term: 'Overfitting',
    definition:
      'A failure mode where the model memorizes idiosyncratic training noise rather than true underlying patterns. Evidenced by training loss plunging while validation loss rises.',
    category: 'Diagnostics',
  },
};

export const ARCHITECTURE_SPECIFIC_GLOSSARY: Record<Architecture, Record<string, GlossaryItem>> = {
  'CNN': {
    'Convolution Operation': {
      term: 'Convolution Operation',
      definition:
        'Sliding a small weight filter across an input tensor, multiplying overlapping elements, and summing them into a single cell on the output activation map.',
      formula: '(I * K)(i, j) = \\sum_m \\sum_n I(i+m, j+n) K(m, n)',
    },
    'Kernel / Filter': {
      term: 'Kernel / Filter',
      definition:
        'A learnable matrix of spatial weights (e.g. 3×3). Early layers learn edge and corner detectors; deeper layers learn composite object parts.',
    },
    'Stride': {
      term: 'Stride',
      definition:
        'The step size (in pixels) the sliding window shifts between convolutions. Higher stride downsamples the output resolution faster.',
    },
    'Feature Map': {
      term: 'Feature Map',
      definition:
        'The 2D output grid generated after sliding a convolutional filter across the input. Highlights where spatial features are strongly present.',
    },
    'Max Pooling': {
      term: 'Max Pooling',
      definition:
        'A non-linear downsampling layer that retains only the maximum value within small regions (e.g. 2×2), creating translation tolerance.',
      formula: 'y = \\max(x_{i,j})',
    },
    'Receptive Field': {
      term: 'Receptive Field',
      definition:
        'The spatial patch of the original input image that contributes to a specific downstream neuron activation. Expands with each consecutive conv layer.',
    },
    'Spatial Invariance': {
      term: 'Spatial Invariance',
      definition:
        'The ability of a CNN to recognize patterns (like edges or digits) regardless of where they appear within the image frame.',
    },
  },

  'Transformer': {
    'Self-Attention': {
      term: 'Self-Attention',
      definition:
        'A mechanism allowing each token in a sequence to dynamically weigh and attend to every other token, capturing context irrespective of linear distance.',
      formula: '\\text{Attention}(Q, K, V) = \\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
    },
    'Query (Q)': {
      term: 'Query (Q)',
      definition:
        'The representation of "what this token is actively seeking or looking for" across the sequence.',
    },
    'Key (K)': {
      term: 'Key (K)',
      definition:
        'The representation of "what content or attributes this token offers" to be matched by incoming queries.',
    },
    'Value (V)': {
      term: 'Value (V)',
      definition:
        'The actual semantic payload that gets weighted and aggregated if a Query matches a Key.',
    },
    'Attention Heatmap': {
      term: 'Attention Heatmap',
      definition:
        'The NxN matrix of normalized Softmax affinity scores showing how strongly each word attends to every other word.',
    },
    'Multi-Head Attention': {
      term: 'Multi-Head Attention',
      definition:
        'Running several attention projections in parallel, allowing the network to simultaneously track syntax, co-references, and semantic themes.',
    },
    'Positional Encoding': {
      term: 'Positional Encoding',
      definition:
        'Sinusoidal or learned signals added to input token embeddings to restore sequence order, since raw self-attention is permutation-invariant.',
    },
  },

  'GAN': {
    'Generator G(z)': {
      term: 'Generator G(z)',
      definition:
        'Neural network that transforms random Gaussian noise vectors z into synthetic sample images, aiming to fool the Discriminator.',
    },
    'Discriminator D(x)': {
      term: 'Discriminator D(x)',
      definition:
        'Binary classifier network that evaluates whether an input image originated from real dataset x or was synthesized by G(z).',
    },
    'Minimax Game': {
      term: 'Minimax Game',
      definition:
        'The adversarial zero-sum objective where G tries to minimize the objective while D tries to maximize it.',
      formula: '\\min_G \\max_D \\mathbb{E}[\\log D(x)] + \\mathbb{E}[\\log(1 - D(G(z)))]',
    },
    'Nash Equilibrium (50/50)': {
      term: 'Nash Equilibrium (50/50)',
      definition:
        'The theoretical optimum where G perfectly replicates the real distribution, leaving D unable to tell real from fake and guessing 50% for both.',
      formula: 'D(x) = D(G(z)) = 0.50',
    },
    'Latent Space (z)': {
      term: 'Latent Space (z)',
      definition:
        'A continuous low-dimensional vector manifold (z ~ N(0, I)). Navigating or interpolating between latent vectors morphs visual attributes smoothly.',
    },
    'Mode Collapse': {
      term: 'Mode Collapse',
      definition:
        'A pathology where G discovers a single output that tricks D and repeatedly produces only that sample, losing all batch diversity.',
    },
    'Discriminator Overpowering': {
      term: 'Discriminator Overpowering',
      definition:
        'When D learns too quickly (D(x)=1.0, D(G)=0.0), causing its gradients to vanish and leaving G with zero learning signal.',
    },
  },

  'RNN': {
    'Hidden State (h_t)': {
      term: 'Hidden State (h_t)',
      definition:
        'The internal recurrent memory vector passed forward from time step to time step, updated at each token.',
      formula: 'h_t = \\tanh(W_{hh} h_{t-1} + W_{xh} x_t + b)',
    },
    'Unrolled Sequence': {
      term: 'Unrolled Sequence',
      definition:
        'Visualizing the recurrent cell copied across discrete time steps t=0, 1, ..., T to expose temporal data flow.',
    },
    'Feedback Memory': {
      term: 'Feedback Memory',
      definition:
        'The cyclical connection that feeds the previous step hidden state h_{t-1} back into the current step computation.',
    },
    'Backprop Through Time (BPTT)': {
      term: 'Backprop Through Time (BPTT)',
      definition:
        'Calculating gradients by unrolling the network across time and accumulating parameter updates across every step in the sequence.',
    },
    'Vanishing Gradients': {
      term: 'Vanishing Gradients',
      definition:
        'In long sequences, repeated matrix multiplication causes error signals to exponentially decay, making RNNs forget early tokens.',
    },
  },

  'DQN': {
    'Q-Value Q(s, a)': {
      term: 'Q-Value Q(s, a)',
      definition:
        'The expected cumulative discounted future reward received when starting in state s and taking action a under policy π.',
      formula: 'Q(s, a) = \\mathbb{E}[R_t + \\gamma \\max_{a\'} Q(s\', a\')]',
    },
    'Policy (π)': {
      term: 'Policy (π)',
      definition:
        'The strategy the agent follows to map observed environment states to discrete actions.',
    },
    'Epsilon-Greedy (ε)': {
      term: 'Epsilon-Greedy (ε)',
      definition:
        'Exploration mechanism where the agent selects a random action with probability ε, and exploits the best known Q-value with probability 1-ε.',
    },
    'Experience Replay Buffer': {
      term: 'Experience Replay Buffer',
      definition:
        'A sliding memory bank storing transitions (s, a, r, s\'). Sampling mini-batches randomly breaks temporal correlations.',
    },
    'Target Network': {
      term: 'Target Network',
      definition:
        'A second neural network whose weights are frozen and updated only periodically to provide stable targets for the Bellman loss.',
    },
    'Discount Factor (γ)': {
      term: 'Discount Factor (γ)',
      definition:
        'Hyperparameter (0.0 to 1.0) determining how much immediate rewards are preferred over uncertain distant future rewards.',
    },
  },

  'Standard NN': {
    'Dense / Fully Connected Layer': {
      term: 'Dense / Fully Connected Layer',
      definition:
        'A layer where every neuron receives inputs from all neurons in the previous layer, parameterized by weights and a bias.',
      formula: 'z = W \\cdot x + b',
    },
    'Weights & Biases': {
      term: 'Weights & Biases',
      definition:
        'Weights scale the strength of connection between neuron pairs; biases shift the activation threshold independently of input values.',
    },
    'Activation Function': {
      term: 'Activation Function',
      definition:
        'Non-linear transformations (ReLU, Sigmoid, Tanh) applied to linear sums, allowing the network to approximate complex non-linear functions.',
    },
    'Decision Boundary': {
      term: 'Decision Boundary',
      definition:
        'The geometric threshold or surface in feature space separating different classification predictions.',
    },
  },

  'Custom Model': {
    'ONNX Standard': {
      term: 'ONNX Standard',
      definition:
        'Open Neural Network Exchange. A platform-agnostic format representing computational graphs exported from PyTorch, TensorFlow, or JAX.',
    },
    'Computational Graph': {
      term: 'Computational Graph',
      definition:
        'A directed acyclic graph where nodes represent mathematical tensor operations and edges represent intermediate tensor activations.',
    },
    'Tensor Shape': {
      term: 'Tensor Shape',
      definition:
        'The dimension array of the flowing tensor (e.g., [Batch, Channels, Height, Width] or [B, Sequence, Hidden]).',
    },
  },
};

export const TRAINING_EXPECTATIONS: Record<Architecture, TrainingExpectation> = {
  'CNN': {
    architecture: 'CNN',
    title: 'What to Expect: CNN Training',
    summary:
      'Watch how sliding 3×3 convolution filters transform raw 2D pixel intensities into localized edge detectors, pooled abstractions, and final class probabilities.',
    phases: [
      {
        phase: '1. Early Epochs (Steps 0–15)',
        metricsExpectation: 'Loss is high (>2.0), accuracy hovers around random chance (~33%).',
        visualWhatToWatch:
          '3×3 convolution filter dot products produce noisy activations. The sliding window moves systematically across the 6×6 grid, but downstream dense layers output uncertain predictions.',
      },
      {
        phase: '2. Mid Training (Steps 15–40)',
        metricsExpectation: 'Loss drops sharply (<0.8), accuracy rises toward 80–90%.',
        visualWhatToWatch:
          'Convolutions specialize into distinct spatial patterns (vertical edges, curves). Receptive fields extract clear structural features, and the output probability for the correct digit/class starts pulling away.',
      },
      {
        phase: '3. Convergence (Steps 40+)',
        metricsExpectation: 'Loss settles (<0.2) and accuracy stabilizes near 95%–99%.',
        visualWhatToWatch:
          'Backprop gradients become subtle fine-tuning pulses. Output classification is decisive with a prominent activation bar on the ground-truth class.',
      },
    ],
    keyWatchouts: [
      'Vanishing Gradients: If active, backprop lines fade and early conv layers receive near-zero weight updates.',
      'Exploding Gradients: Activations blow up to Infinity and metrics swing wildly.',
    ],
  },

  'Transformer': {
    architecture: 'Transformer',
    title: 'What to Expect: Transformer Attention Training',
    summary:
      'Watch how query-key dot products dynamically form attention heatmaps that link contextually related words regardless of their sequence distance.',
    phases: [
      {
        phase: '1. Early Training',
        metricsExpectation: 'Loss is high, next-token prediction entropy is high.',
        visualWhatToWatch:
          'Attention weights in the NxN heatmap are diffuse and near-uniform (every word attends slightly to all words).',
      },
      {
        phase: '2. Head Specialization',
        metricsExpectation: 'Loss steadily drops as grammar and semantics are captured.',
        visualWhatToWatch:
          'Attention heads diverge: Head 1 might focus on adjacent tokens (syntax), while Head 2 connects distant subjects and verbs (semantics).',
      },
      {
        phase: '3. Sharp Attention Convergence',
        metricsExpectation: 'Next-token probabilities converge with high confidence.',
        visualWhatToWatch:
          'Heatmap shows crisp, high-intensity attention points (e.g., "bank" strongly attending to "river" or "money").',
      },
    ],
    keyWatchouts: [
      'Attention Collapse: If heads collapse, the heatmap becomes a flat gray sheet where tokens lose discriminative power.',
    ],
  },

  'GAN': {
    architecture: 'GAN',
    title: 'What to Expect: GAN Adversarial Dynamics',
    summary:
      'Unlike standard loss minimization, GAN training is an adversarial zero-sum game. You are watching a tug-of-war between Generator G and Discriminator D.',
    phases: [
      {
        phase: '1. Generator Underdog (Early)',
        metricsExpectation: 'D(x) ≈ 95%, D(G(z)) ≈ 5%. Generator Loss L_G is high.',
        visualWhatToWatch:
          'Generator outputs noisy fuzz. The Discriminator easily classifies all fakes as 0% and all real photos as 100%.',
      },
      {
        phase: '2. The Adversarial Battle (Mid)',
        metricsExpectation: 'L_G drops, D(G(z)) climbs toward 30%–45%. Equilibrium bar swings.',
        visualWhatToWatch:
          'Generator outputs start forming coherent contours. The Discriminator becomes challenged and scores fakes higher.',
      },
      {
        phase: '3. Optimal Nash Equilibrium (50/50)',
        metricsExpectation: 'D(x) ≈ 50% and D(G(z)) ≈ 50%. Tug-of-war balance stays centered.',
        visualWhatToWatch:
          'Synthesized batch samples look realistic and diverse. The Discriminator cannot tell real from fake and is forced to guess at random (50/50).',
      },
    ],
    keyWatchouts: [
      'Mode Collapse: All batch images become identical clones because G found a single loophole.',
      'Discriminator Overpowering: D reaches 100% too fast, suffocating G of meaningful backprop gradients.',
    ],
  },

  'RNN': {
    architecture: 'RNN',
    title: 'What to Expect: Recurrent Hidden State Training',
    summary:
      'Observe step-by-step sequential processing where the hidden memory vector h_t updates with each incoming token and passes forward through time.',
    phases: [
      {
        phase: '1. Step-by-Step Flow',
        metricsExpectation: 'Step counter cycles 0..T as each token vector updates memory.',
        visualWhatToWatch:
          'At each step, current input x_t combines with prior state h_{t-1} through a tanh non-linearity to form new state h_t.',
      },
      {
        phase: '2. Gradient Accumulation (BPTT)',
        metricsExpectation: 'Error signals accumulate across temporal unrolled steps.',
        visualWhatToWatch:
          'Backpropagation Through Time sends gradients backwards from time T toward time 0.',
      },
      {
        phase: '3. Long-Term Dependency Test',
        metricsExpectation: 'Prediction of final target token depends on early sequence clues.',
        visualWhatToWatch:
          'Watch the signal strength indicator: healthy training preserves enough memory for accurate sequence classification.',
      },
    ],
    keyWatchouts: [
      'Vanishing Gradients: The recurrent signal decays over distance; gradients for token 0 fade away.',
    ],
  },

  'DQN': {
    architecture: 'DQN',
    title: 'What to Expect: Reinforcement Learning & Q-Values',
    summary:
      'Watch an autonomous agent transition from random environmental exploration to greedy exploitation of learned high-reward policies.',
    phases: [
      {
        phase: '1. Exploration Phase (High ε)',
        metricsExpectation: 'Epsilon is high (0.8–1.0), cumulative episode rewards are low/variable.',
        visualWhatToWatch:
          'Agent moves erratically, exploring maze paths or balancing pole angles. State-action transitions stream into the Replay Buffer.',
      },
      {
        phase: '2. Bellman Q-Value Propagation',
        metricsExpectation: 'Q-loss decreases as target network updates stabilize values.',
        visualWhatToWatch:
          'Q-value heatmaps around goal states turn bright green. High expected reward values propagate backward to earlier states.',
      },
      {
        phase: '3. Exploitation & Policy Convergence',
        metricsExpectation: 'Epsilon decays to minimum (0.05), episode rewards maximize.',
        visualWhatToWatch:
          'The agent follows deterministic high Q-value arrows, efficiently navigating directly to the goal or balancing smoothly.',
      },
    ],
    keyWatchouts: [
      'Poor Exploration: If exploration schedule decays too rapidly, the agent gets stuck in local traps.',
    ],
  },

  'Standard NN': {
    architecture: 'Standard NN',
    title: 'What to Expect: Standard Neural Network Training',
    summary:
      'Observe forward signal propagation across dense layers and watch how backpropagation gradients bend non-linear decision boundaries to separate classes.',
    phases: [
      {
        phase: '1. Initialization (Steps 0–10)',
        metricsExpectation: 'Loss ~2.5, accuracy ~33%.',
        visualWhatToWatch:
          'Weights are random. The 2D decision boundary cuts arbitrarily across the data plane.',
      },
      {
        phase: '2. Gradient Updates (Steps 10–35)',
        metricsExpectation: 'Loss descends smoothly; accuracy crosses 80%.',
        visualWhatToWatch:
          'Backprop pulses illuminate active paths. The decision boundary contours warp and curve around clusters.',
      },
      {
        phase: '3. Convergence (Steps 35+)',
        metricsExpectation: 'Loss stabilizes (<0.2); accuracy reaches peak.',
        visualWhatToWatch:
          'Margins between classes are clearly demarcated with confident node activation intensities.',
      },
    ],
    keyWatchouts: [
      'Overfitting: Watch for decision boundaries twisting into hyper-contorted islands around outlier points.',
    ],
  },

  'Custom Model': {
    architecture: 'Custom Model',
    title: 'What to Expect: Custom Graph Architecture',
    summary:
      'Explore arbitrary model topologies exported via ONNX, tracing tensor dimensions and operator sequences from input nodes to prediction heads.',
    phases: [
      {
        phase: '1. Graph Ingestion',
        metricsExpectation: 'Topological sorting and layer sizing.',
        visualWhatToWatch:
          'Input tensors, convolutional blocks, activations, and pooling nodes align into an interactive flow canvas.',
      },
      {
        phase: '2. Dimension Tracing',
        metricsExpectation: 'Tensor shapes tracked across edges.',
        visualWhatToWatch:
          'Click any node to inspect tensor rank, channels, spatial dimensions, and operator attributes.',
      },
      {
        phase: '3. Code & Export',
        metricsExpectation: 'Architecture validation.',
        visualWhatToWatch:
          'Inspect framework-specific export instructions (PyTorch, TensorFlow, JAX) to verify deployment readiness.',
      },
    ],
    keyWatchouts: [
      'Shape Mismatches: Verify output shapes match downstream input expectations across skip connections.',
    ],
  },
};

export interface ArchitectureDocStage {
  step: number;
  title: string;
  subtitle?: string;
  body: string;
  formula?: string;
  highlights?: string[];
}

export const ARCHITECTURE_DOCS: Record<Architecture, ArchitectureDocStage[]> = {
  'Standard NN': [
    {
      step: 1,
      title: 'Multi-Layer Perceptron (MLP) Foundation',
      subtitle: 'Fully-Connected Layer Stack',
      body: 'The bedrock of deep learning. Input features pass through sequentially stacked layers of artificial neurons interconnected by tunable weight matrices and bias vectors.',
      formula: 'z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}',
      highlights: ['Full connectivity between layers', 'Independent weight for each input-output pair'],
    },
    {
      step: 2,
      title: 'Non-Linear Activation Functions',
      subtitle: 'Enabling Complex Decision Boundaries',
      body: 'Without non-linear activations (like ReLU, GELU, or Sigmoid), stacking multiple linear layers collapses mathematically into a single linear transformation. Activations enable universal function approximation.',
      formula: 'a^{[l]} = \\sigma(z^{[l]}), \\quad \\text{ReLU}(z) = \\max(0, z)',
      highlights: ['ReLU prevents gradient saturation for positive values', 'Enables non-linear classification manifolds'],
    },
    {
      step: 3,
      title: 'Backpropagation & Gradient Descent',
      subtitle: 'Chain Rule Parameter Optimization',
      body: 'Loss computed at the output propagates backwards using the multivariate calculus chain rule. Gradients ∂L/∂W guide parameter updates in the direction of steepest descent.',
      formula: 'W \\leftarrow W - \\eta \\frac{\\partial L}{\\partial W}',
      highlights: ['Calculates exact sensitivity of loss to every weight', 'Optimizer updates all layers concurrently'],
    },
  ],
  'CNN': [
    {
      step: 1,
      title: 'Stage 1: Image Digitization & Sensor Quantization',
      subtitle: 'Photons to Float32 Tensors',
      body: 'Raw physical imagery is converted into normalized numerical tensors. Grayscale images map to H×W×1 matrices where 0.0 represents black background and 1.0 represents peak white strokes.',
      formula: 'X \\in \\mathbb{R}^{H \\times W \\times C}, \\quad x_{i,j} \\in [0.0, 1.0]',
      highlights: ['Normalized inputs stabilize weight gradient dynamics', 'Preserves 2D spatial pixel neighborhoods'],
    },
    {
      step: 2,
      title: 'Stage 2: 2D Convolution & Kernel Feature Extraction',
      subtitle: 'Sliding Filters & Parameter Sharing',
      body: 'Small weight matrices (e.g. 3×3 kernels) slide systematically across the input tensor computing element-wise dot products. By sharing the same kernel weights across the entire image, CNNs achieve translation invariance with dramatically fewer parameters than dense networks.',
      formula: '(I * K)(i, j) = \\sum_{m} \\sum_{n} I(i+m, j+n) K(m, n)',
      highlights: ['Detects localized patterns (edges, curves, textures)', 'Parameter sharing reduces memory footprint'],
    },
    {
      step: 3,
      title: 'Stage 3: Spatial Pooling & Activation Rectification',
      subtitle: 'Dimensionality Reduction & Robustness',
      body: 'ReLU activation zeroes out negative responses. Max Pooling downsamples feature maps (typically 2×2 windows with stride 2), halving spatial height and width while retaining the most salient feature responses.',
      formula: 'P(i, j) = \\max_{(m,n) \\in R} I(i+m, j+n)',
      highlights: ['Reduces spatial dimensions by 75% per 2×2 pool', 'Provides translational and shift invariance'],
    },
    {
      step: 4,
      title: 'Stage 4: Dense Head & Softmax Probability Distribution',
      subtitle: 'Logit Normalization for Multi-Class Output',
      body: '2D feature maps are flattened into a 1D vector and passed through dense classification layers. The Softmax function normalizes raw logits into a calibrated probability distribution that sums to 1.0.',
      formula: '\\text{Softmax}(z_i) = \\frac{e^{z_i}}{\\sum_{j=1}^K e^{z_j}}',
      highlights: ['Outputs probabilistic class confidences', 'Cross-entropy loss directly penalizes incorrect predictions'],
    },
  ],
  'Transformer': [
    {
      step: 1,
      title: 'Tokenization & Positional Encoding',
      subtitle: 'Sequence Ingestion Without Recurrence',
      body: 'Input text is divided into discrete tokens and mapped to dense continuous embedding vectors. Because self-attention processes all tokens simultaneously without recurrence, sinusoidal or learned positional encodings are injected to inject word order.',
      formula: 'PE_{(pos, 2i)} = \\sin(pos / 10000^{2i/d_{\\text{model}}})',
      highlights: ['Permutation invariance resolved via positional embeddings', 'Allows massive parallelization during training'],
    },
    {
      step: 2,
      title: 'Multi-Head Self-Attention (Q, K, V)',
      subtitle: 'Pairwise Token Affinity & Contextualization',
      body: 'Tokens project into Queries (what to search for), Keys (what tokens offer), and Values (information content). Dot products between Queries and Keys determine how much focus each token places on every other token across the sequence.',
      formula: '\\text{Attention}(Q, K, V) = \\text{Softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V',
      highlights: ['O(N²) pairwise context capture across arbitrary distances', 'Multiple heads attend to diverse syntactic and semantic patterns'],
    },
    {
      step: 3,
      title: 'Feed-Forward Networks & Residual Normalization',
      subtitle: 'Pointwise Non-Linear Transformation',
      body: 'Residual skip connections and Layer Normalization stabilize gradient propagation. Position-wise feed-forward networks apply non-linear projections independently to each token representation.',
      formula: 'x_{\\text{out}} = \\text{LayerNorm}(x + \\text{FFN}(x))',
      highlights: ['Prevents vanishing gradients in deep 100+ layer stacks', 'Expands and contracts token embedding representations'],
    },
  ],
  'RNN': [
    {
      step: 1,
      title: 'Sequential Recurrence & Hidden Memory Vector',
      subtitle: 'Time-Series State Preservation',
      body: 'RNNs process sequential inputs one step at a time. An internal hidden state vector h_t acts as continuous working memory, carrying contextual history from previous time steps to inform the current step.',
      formula: 'h_t = \\tanh(W_{hh} h_{t-1} + W_{xh} x_t + b_h)',
      highlights: ['Handles variable-length input sequences', 'Shared weights across all temporal steps'],
    },
    {
      step: 2,
      title: 'Backpropagation Through Time (BPTT)',
      subtitle: 'Unrolling the Temporal Graph',
      body: 'Training unrolls the recurrent network across all time steps into a feed-forward chain. Gradients are computed by backpropagating error signals backwards across the unrolled timeline.',
      formula: '\\frac{\\partial L}{\\partial W} = \\sum_{t=1}^T \\frac{\\partial L_t}{\\partial W}',
      highlights: ['Accumulates parameter gradients across history', 'Enables learning sequential dependencies'],
    },
    {
      step: 3,
      title: 'Vanishing & Exploding Gradients',
      subtitle: 'The Long-Term Dependency Bottleneck',
      body: 'Repeated matrix multiplication by W_hh over many time steps causes gradients to either shrink exponentially to 0 (vanishing gradients) or blow up to infinity (exploding gradients), making vanilla RNNs forget distant context.',
      formula: '\\frac{\\partial h_T}{\\partial h_1} = \\prod_{t=2}^T \\frac{\\partial h_t}{\\partial h_{t-1}}',
      highlights: ['Gating mechanisms (LSTM, GRU) were created to fix this', 'Gradient clipping prevents exploding weight updates'],
    },
  ],
  'GAN': [
    {
      step: 1,
      title: 'The Minimax Zero-Sum Game',
      subtitle: 'Generator vs. Discriminator Adversarial Dynamic',
      body: 'Unlike standard neural networks that optimize a static loss surface, GANs pit two networks against each other: a Generator G creating synthetic samples, and a Discriminator D attempting to distinguish authentic samples from fakes.',
      formula: '\\min_G \\max_D V(D, G) = \\mathbb{E}_{x}[\\log D(x)] + \\mathbb{E}_{z}[\\log(1 - D(G(z)))]',
      highlights: ['No explicit likelihood function needed', 'Adversarial training yields sharp, realistic outputs'],
    },
    {
      step: 2,
      title: 'The Generator G(z)',
      subtitle: 'Synthesizing from Gaussian Latent Manifold',
      body: 'The Generator never sees real dataset images directly! Instead, it maps random Gaussian noise vectors z ~ N(0, I) through transposed convolutions to synthesize realistic images that deceive the Discriminator.',
      formula: 'x_{\\text{fake}} = G(z; \\theta_G), \\quad \\mathcal{L}_G = -\\log(D(G(z)))',
      highlights: ['Samples smooth latent continuous manifold', 'Gradients flow from Discriminator back into Generator'],
    },
    {
      step: 3,
      title: 'The Discriminator D(x)',
      subtitle: 'Binary Real vs. Fake Classifier',
      body: 'A convolutional network trained to output D(x) ≈ 1.0 for authentic dataset images and D(G(z)) ≈ 0.0 for synthetic fakes. Its classification gradients provide the learning signal that shapes the Generator.',
      formula: '\\mathcal{L}_D = -\\log D(x_{\\text{real}}) - \\log(1 - D(G(z)))',
      highlights: ['Acts as an adaptive loss function for the generator', 'Balances classification accuracy with gradient feedback'],
    },
    {
      step: 4,
      title: 'Nash Equilibrium & The 50/50 Balance',
      subtitle: 'The Convergence Endpoint',
      body: 'When the Generator perfectly replicates the real data distribution (p_g = p_data), the Discriminator can no longer distinguish real from fake, outputting a 50% coin flip probability for both: D(x) = 0.50 and D(G(z)) = 0.50.',
      formula: 'p_g = p_{\\text{data}} \\implies D^*(x) = 0.50, \\quad D^*(G(z)) = 0.50',
      highlights: ['Neither network can improve without altering the other', 'Indicates optimal generative synthesis'],
    },
  ],
  'DQN': [
    {
      step: 1,
      title: 'Agent-Environment MDP Formulation',
      subtitle: 'State, Action, Reward & Next State',
      body: 'Reinforcement Learning frames sequential decision making as a Markov Decision Process (MDP). An autonomous agent observes environment state s, selects action a, receives reward r, and transitions to state s\'.',
      formula: 's_t \\xrightarrow{a_t} r_{t+1}, s_{t+1}',
      highlights: ['Trial-and-error policy optimization', 'Maximizes cumulative discounted future return'],
    },
    {
      step: 2,
      title: 'Q-Value Function & The Bellman Equation',
      subtitle: 'Deep Q-Network (DQN) Approximation',
      body: 'The network approximates Q(s, a), the expected discounted return of taking action a in state s. Bellman equation updates minimize the Temporal Difference (TD) error between current estimates and target returns.',
      formula: 'Q(s, a) \\leftarrow Q(s, a) + \\alpha [r + \\gamma \\max_{a\'} Q(s\', a\') - Q(s, a)]',
      highlights: ['Temporal difference bootstrap learning', 'Target network stabilizes deep Q learning updates'],
    },
    {
      step: 3,
      title: 'Exploration vs. Exploitation (ε-Greedy)',
      subtitle: 'Balancing Discovery and Reward Maximization',
      body: 'The agent selects random exploratory actions with probability ε and greedy optimal actions with probability 1-ε. Annealing ε over time transitions the agent from broad exploration to optimal exploitation.',
      formula: 'a = \\begin{cases} \\text{random action} & \\text{with prob } \\varepsilon \\\\ \\arg\\max_a Q(s, a) & \\text{with prob } 1 - \\varepsilon \\end{cases}',
      highlights: ['Prevents premature convergence to local sub-optimal policies', 'Experience replay breaks correlation between consecutive transitions'],
    },
  ],
  'Custom Model': [
    {
      step: 1,
      title: 'Computational Graph Ingestion',
      subtitle: 'ONNX / Framework Operator Nodes',
      body: 'Inspect arbitrary neural network architectures exported from PyTorch, TensorFlow, or JAX. The visualizer parses node operators, tensor shapes, and connection topology.',
      formula: 'y = f(x; \\theta)',
      highlights: ['Supports diverse operator primitives', 'Tracks tensor dimensions across graph edges'],
    },
    {
      step: 2,
      title: 'Tensor Dimension Flow',
      subtitle: 'Shape Validation Across Layers',
      body: 'Analyze tensor ranks and channel projections between connected nodes to ensure shape compatibility and identify dimension mismatches across skip connections.',
      formula: 'X \\in \\mathbb{R}^{B \\times C \\times H \\times W}',
      highlights: ['Detects tensor dimension mismatches', 'Verifies layer connectivity'],
    },
  ],
};
