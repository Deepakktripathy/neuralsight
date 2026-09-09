import React, { useState } from 'react';
import { Architecture } from '../types';
import { Sparkles, Layers, Box, Cpu, Eye, Zap, Database, ArrowRight, ArrowLeft, X, GitCommit, MoveUpRight, FastForward, ActivitySquare, Network } from 'lucide-react';

interface ArchitectureTourProps {
  architecture: Architecture;
  onClose: () => void;
  onStartSpotlight?: () => void;
}

const TOUR_DATA: Record<Architecture, { title: string; subtitle?: string; body: string; icon: any; color: string; formula?: string }[]> = {
  'Standard NN': [
    { icon: Network, color: 'indigo', title: 'Standard Neural Network (MLP)', subtitle: 'Multi-Layer Perceptron', body: 'The foundation of deep learning. High-dimensional data passes through layered stacks of artificial neurons interconnected by tunable weight matrices.' },
    { icon: GitCommit, color: 'emerald', title: 'Neurons & Activations', subtitle: 'Non-Linear Processing Units', body: 'Each node computes a weighted sum of inputs plus a bias: z = W · x + b. It applies a non-linear activation function σ(z) (like ReLU or Sigmoid) enabling the network to learn non-linear decision boundaries.', formula: 'a = \\sigma(\\sum_i w_i x_i + b)' },
    { icon: MoveUpRight, color: 'amber', title: 'Weights, Biases & Gradients', subtitle: 'Learned Parameters', body: 'Weights represent connection strengths. During backpropagation, partial derivatives ∂Loss/∂W flow backwards from the output layer to guide gradient descent updates.', formula: 'W \\leftarrow W - \\eta \\frac{\\partial L}{\\partial W}' },
  ],
  'CNN': [
    { icon: Eye, color: 'indigo', title: 'Convolutional Neural Network (CNN)', subtitle: 'Spatial Vision Architecture', body: 'Specialized for grid-like data such as images. Rather than treating pixels as independent flat features, CNNs exploit local spatial coherence and translational invariance using shared 2D sliding kernels.' },
    { icon: Eye, color: 'emerald', title: 'Stage 1: Image Digitization & Ingestion', subtitle: 'Raw Pixels to Float32 Tensors', body: 'Grayscale (e.g. MNIST 28×28) or RGB images are ingested and converted to normalized tensor values [0.0, 1.0]. A value of 0.0 represents empty background, while values near 1.0 represent handwritten pen strokes.', formula: 'X \\in \\mathbb{R}^{H \\times W \\times C}, \\quad x_{i,j} \\in [0, 1]' },
    { icon: Box, color: 'amber', title: 'Stage 2: 2D Convolution & Kernels', subtitle: 'Feature Detection & Parameter Sharing', body: 'Sliding 3×3 filters compute dot products across receptive fields. Because the same filter is applied across the entire image, the model learns translation-invariant features (vertical edges, curves, loop corners) with extreme parameter efficiency.', formula: '(I * K)(i, j) = \\sum_m \\sum_n I(i+m, j+n) K(m, n)' },
    { icon: Layers, color: 'rose', title: 'Stage 3: Spatial Pooling & Activation', subtitle: 'Dimensionality Reduction', body: 'ReLU activation eliminates negative responses. Max Pooling downsamples feature maps (e.g. 2×2 blocks), halving spatial dimensions while preserving the most prominent activations and providing robustness to minor shifts.', formula: 'P(i, j) = \\max_{(m,n) \\in R} I(i+m, j+n)' },
    { icon: Network, color: 'indigo', title: 'Stage 4: Dense Head & Softmax', subtitle: 'Classification Output', body: 'Extracted feature maps are flattened into a 1D vector and passed to a Dense Linear layer. The Softmax function normalizes logits into calibrated probabilities that sum to 100% across the candidate classes.', formula: '\\text{Softmax}(z_i) = \\frac{e^{z_i}}{\\sum_j e^{z_j}}' }
  ],
  'Transformer': [
    { icon: Zap, color: 'indigo', title: 'Transformer Architecture', subtitle: 'Attention-Driven Modeling', body: 'The engine behind modern LLMs. Replaces sequential recurrences with parallel Self-Attention, capturing relationships between all tokens across the sequence regardless of distance.' },
    { icon: ActivitySquare, color: 'emerald', title: 'Token Embeddings & Projections', subtitle: 'Q, K, V Vector Representations', body: 'Tokens are embedded and projected into three distinct learned subspaces: Query (what am I looking for?), Key (what do I contain?), and Value (what information do I carry?).' },
    { icon: Network, color: 'amber', title: 'Scaled Dot-Product Attention', subtitle: 'Pairwise Token Affinity', body: 'Dot products between Queries and Keys calculate pairwise token compatibility. Dividing by √d_k stabilizes variance, and Softmax produces the attention distribution weight matrix.', formula: '\\text{Attention}(Q, K, V) = \\text{Softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V' },
  ],
  'RNN': [
    { icon: FastForward, color: 'indigo', title: 'Recurrent Neural Network (RNN)', subtitle: 'Sequential Memory Architecture', body: 'Processes data sequentially (text, time series). An internal hidden state vector h_t acts as a continuous memory buffer carried from step to step.' },
    { icon: Database, color: 'emerald', title: 'Hidden State Recursion', subtitle: 'State Updating', body: 'At each time step t, the cell combines current input x_t with previous hidden state h_{t-1} to form the new memory h_t: h_t = tanh(W_h h_{t-1} + W_x x_t + b).', formula: 'h_t = \\tanh(W_h h_{t-1} + W_x x_t + b)' },
    { icon: Zap, color: 'rose', title: 'The Vanishing Gradient Bottleneck', subtitle: 'Long-Term Memory Limitation', body: 'Repeated matrix multiplications during Backpropagation Through Time (BPTT) cause gradients to shrink exponentially, making vanilla RNNs forget distant context.' },
  ],
  'GAN': [
    { 
      icon: Cpu, 
      color: 'indigo', 
      title: 'Generative Adversarial Network (GAN)', 
      subtitle: 'Minimax Zero-Sum Game Dynamic', 
      body: 'Unlike standard networks that minimize a single error, GANs pit two neural networks against each other in a zero-sum game: a Generator G that creates synthetic data, and a Discriminator D that acts as an art critic distinguishing real data from fakes.', 
      formula: '\\min_G \\max_D V(D, G) = \\mathbb{E}_{x \\sim p_{\\text{data}}}[\\log D(x)] + \\mathbb{E}_{z \\sim p_z}[\\log(1 - D(G(z)))]' 
    },
    { 
      icon: Sparkles, 
      color: 'emerald', 
      title: 'The Generator G(z)', 
      subtitle: 'Synthesizing from Gaussian Latent Manifold', 
      body: 'The Generator never sees real training images! Instead, it samples a continuous noise vector z ~ N(0, I) and uses Transposed Convolutions to upsample latent values into high-dimensional synthetic images, learning to fool the Discriminator.',
      formula: 'x_{\\text{fake}} = G(z; \\theta_G), \\quad \\nabla_{\\theta_G} \\mathcal{L}_G = -\\nabla_{\\theta_G} \\log(D(G(z)))'
    },
    { 
      icon: Eye, 
      color: 'rose', 
      title: 'The Discriminator D(x)', 
      subtitle: 'Binary Real vs. Fake Classifier', 
      body: 'A convolutional network that receives both real dataset samples and generator fakes. It outputs two vital scores: D(x_real), the probability that a real sample is authentic, and D(G(z)_fake), the probability that a fake image is real.', 
      formula: 'D(x) \\in [0, 1], \\quad \\mathcal{L}_D = -\\log D(x) - \\log(1 - D(G(z)))'
    },
    { 
      icon: ActivitySquare, 
      color: 'cyan', 
      title: 'Nash Equilibrium & The 50/50 Balance', 
      subtitle: 'Why Are Scores Supposed to Reach 50%?', 
      body: 'In a well-trained GAN, the Generator learns to replicate the true data distribution (p_g = p_data). At this theoretical Nash Equilibrium, generated fakes are indistinguishable from real data, forcing the Discriminator to guess randomly like a coin flip: D(x) = 0.50 and D(G(z)) = 0.50 (50-50 balance).',
      formula: 'p_g = p_{\\text{data}} \\implies D^*(x) = \\frac{p_{\\text{data}}(x)}{p_{\\text{data}}(x) + p_g(x)} = 0.50'
    },
    { 
      icon: Zap, 
      color: 'amber', 
      title: 'Visual Cues & Failure Modes', 
      subtitle: 'What to Look For During Training', 
      body: 'Healthy training shows samples evolving from static noise into crisp images with oscillating losses. Watch for two classic failures: Mode Collapse (generator outputs identical cloned faces/digits across all batch seeds) and Discriminator Overpowering (D reaches 100% accuracy, vanishing gradients freeze G in static noise).',
      formula: '\\text{Healthy: } D(G(z)) \\approx 0.50 \\quad | \\quad \\text{Collapse: } \\text{Diversity} \\to 0'
    }
  ],
  'DQN': [
    { icon: MoveUpRight, color: 'indigo', title: 'Deep Q-Network (Reinforcement Learning)', subtitle: 'Q-Learning with Function Approximation', body: 'An autonomous agent learns optimal decision-making policies through trial-and-error interactions in an environment to maximize cumulative discounted rewards.' },
    { icon: Box, color: 'emerald', title: 'Q-Value Function Approximation', subtitle: 'Expected Future Return', body: 'The deep network predicts Q(s, a), the expected discounted return of taking action a in state s. Bellman equation updates minimize Temporal Difference (TD) error.', formula: 'Q(s, a) \\leftarrow Q(s, a) + \\alpha [r + \\gamma \\max_{a\'} Q(s\', a\') - Q(s, a)]' },
    { icon: Database, color: 'amber', title: 'Value Heatmap & Policy', subtitle: 'Action Selection Strategy', body: 'Visualizes expected values propagating backwards from the goal state. The agent selects actions via an ε-greedy policy to balance exploration and exploitation.' },
  ],
  'Custom Model': [
    { icon: Cpu, color: 'indigo', title: 'Custom Model Computational Graph', subtitle: 'ONNX / Tensor Operations', body: 'Upload and inspect computational graphs from PyTorch, TensorFlow, or JAX exported to ONNX format. Explore node connections, tensor shapes, and layer attributes.' },
  ]
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  rose: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
};

export const ArchitectureTour: React.FC<ArchitectureTourProps> = ({ architecture, onClose, onStartSpotlight }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const steps = TOUR_DATA[architecture] || TOUR_DATA['Standard NN'];
  const step = steps[stepIdx] || steps[0];
  const Icon = step.icon;
  const colors = colorClasses[step.color] || colorClasses.indigo;
  const isLast = stepIdx === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 flex flex-col gap-4">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {architecture} Model Info
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Step {stepIdx + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
            title="Close Model Info"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col items-center text-center gap-3 py-1">
          <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} border ${colors.border} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 w-full">
            <h2 className="text-lg font-bold text-white tracking-tight">{step.title}</h2>
            {step.subtitle && (
              <span className="text-xs font-mono text-indigo-300 font-medium block">
                {step.subtitle}
              </span>
            )}
            <p className="text-sm text-slate-300 leading-relaxed text-left sm:text-center mt-2">
              {step.body}
            </p>
          </div>

          {step.formula && (
            <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 font-mono text-xs text-indigo-300 text-center shadow-inner mt-1">
              <code>{step.formula}</code>
            </div>
          )}
        </div>

        {/* Progress pill dots */}
        <div className="flex items-center justify-center gap-1.5 mt-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIdx(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === stepIdx ? 'w-6 bg-indigo-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
              title={`Jump to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3.5 mt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors px-2 py-1 rounded hover:bg-slate-800"
            >
              Close
            </button>
            {onStartSpotlight && (
              <button
                onClick={() => {
                  onClose();
                  onStartSpotlight();
                }}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1 rounded-lg transition-colors"
                title="Spotlight each component directly on the interactive canvas"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Highlight on Canvas</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {stepIdx > 0 && (
              <button
                onClick={() => setStepIdx(i => i - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
            <button
              onClick={() => (isLast ? onClose() : setStepIdx(i => i + 1))}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
            >
              {isLast ? "Done" : 'Next'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
