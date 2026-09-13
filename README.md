# NeuralSight — Interactive Deep Learning Architecture & Dynamics Visualizer

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An interactive, browser-native exploratory simulator designed to make deep learning architectures, tensor flows, backpropagation gradients, and adversarial game equilibria **tangible, visual, and intuitive**.

---

## Table of Contents

1. [What is NeuralSight?](#what-is-neuralsight)
2. [Why NeuralSight? (Philosophy & Motivation)](#why-neuralsight-philosophy--motivation)
3. [What It Is vs. What It Is Not](#what-it-is-vs-what-it-is-not)
4. [Visual Tour & Architectural Screenshots](#visual-tour--architectural-screenshots)
5. [Supported Architectures](#supported-architectures)
   - [1. Generative Adversarial Networks (GAN)](#1-generative-adversarial-networks-gan)
   - [2. Convolutional Neural Networks (CNN)](#2-convolutional-neural-networks-cnn)
   - [3. Transformer (Multi-Head Self-Attention)](#3-transformer-multi-head-self-attention)
   - [4. Deep Q-Networks (DQN / Reinforcement Learning)](#4-deep-q-networks-dqn--reinforcement-learning)
   - [5. Recurrent Neural Networks (RNN / LSTM)](#5-recurrent-neural-networks-rnn--lstm)
   - [6. Standard Multilayer Perceptrons (MLP)](#6-standard-multilayer-perceptrons-mlp)
   - [7. Custom Model Architect](#7-custom-model-architect)
6. [Interactive Controls & Navigation](#interactive-controls--navigation)
   - [Top Navigation Bar](#top-navigation-bar)
   - [Hyperparameter & Diagnostics Sidebar](#hyperparameter--diagnostics-sidebar)
   - [Playback & Micro-Stepping Controller](#playback--micro-stepping-controller)
7. [How to Read & Interpret Every Graphic](#how-to-read--interpret-every-graphic)
   - [GAN: Scores, Losses & Nash Equilibrium](#gan-scores-losses--nash-equilibrium)
   - [GAN: Batch Diversity & Mode Collapse](#gan-batch-diversity--mode-collapse)
   - [CNN: Kernels, Stride & Feature Hierarchy](#cnn-kernels-stride--feature-hierarchy)
   - [Transformer: Attention Matrices & Heatmaps](#transformer-attention-matrices--heatmaps)
   - [DQN: State Grid, Q-Values & Policy Arrows](#dqn-state-grid-q-values--policy-arrows)
   - [Live Metrics Dashboard & Overfitting Alerts](#live-metrics-dashboard--overfitting-alerts)
8. [Code Export (PyTorch / TensorFlow / JAX)](#code-export-pytorch--tensorflow--jax)
9. [Getting Started (Local Development)](#getting-started-local-development)
10. [Technology Stack](#technology-stack)

---

## What is NeuralSight?

**NeuralSight** is an open-source, zero-install visualization engine for neural network architectures. It renders internal mathematical operations—forward tensor activations, sliding convolutional kernels, self-attention matrices, policy Q-value fields, and adversarial minimax tug-of-wars—as live, interactive graphics.

Users can modify hyperparameters (learning rate, optimizer, activation function, batch size), inject pathological failure modes (vanishing gradients, mode collapse, dead neurons), single-step through forward and backward passes, and inspect live pixel-level activations in real time.

---

## Why NeuralSight? (Philosophy & Motivation)

Deep learning education is often split between two extremes:
1. **Abstract Mathematical Formulas:** Equations like $\min_G \max_D V(D, G)$ or $\text{Softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$ explain the theory, but fail to convey how tensors flow or why models destabilize.
2. **Code Implementation:** Writing `loss.backward()` or `torch.nn.Conv2d` hides internal matrix multiplications behind opaque C++ binaries.

**NeuralSight bridges this divide.** It gives students, engineers, and researchers an interactive microscope to watch weights adjust, gradients diminish, latent spaces morph, and adversarial networks battle toward equilibrium.

---

## What It Is vs. What It Is Not

| What It **IS** | What It **IS NOT** |
| :--- | :--- |
| ✅ **An interactive visual mental model** for understanding neural network dynamics. | ❌ **A production training pipeline** for training multi-billion parameter models on clusters. |
| ✅ **A live micro-step simulator** showing forward activation flow, loss computation, and backprop. | ❌ **A black-box dashboard** showing pre-recorded static GIFs. |
| ✅ **A failure-mode sandbox** for testing Mode Collapse, Vanishing Gradients, and Overfitting. | ❌ **A benchmark competitor** for production frameworks like PyTorch or TensorRT. |
| ✅ **A multi-architecture playground** covering GANs, Transformers, CNNs, RNNs, DQNs, and MLPs. | ❌ **A toy calculator**; calculations reflect genuine mathematical properties. |

---

## Visual Tour & Architectural Screenshots

### Generative Adversarial Network (GAN) Visualizer
The GAN canvas illustrates the zero-sum Minimax game between Generator $G(z)$ and Discriminator $D(x)$, featuring real-time latent space transformation, score meters, diversity grids, and the 50/50 Nash Equilibrium balance bar.

![GAN Architecture Visualizer](docs/screenshots/gan_visualizer_overview.jpg)

### Multi-Architecture Deep Learning Suite
Explore and compare six foundational neural network paradigms—from spatial convolutions to self-attention webs and reinforcement learning gridworlds.

![Multi-Architecture Showcase](docs/screenshots/multi_architecture_showcase.jpg)

### Hyperparameters, Diagnostics & Playback Engine
Fine-tune learning rates, toggle optimizers (Adam, SGD, RMSprop), trigger simulated failure modes, and scrub training speed from 0.25× to 4×.

![Controls and Diagnostics](docs/screenshots/controls_and_diagnostics.jpg)

### Inference Mode, Latent Manifold Morphing & Diversity Inspection
In Inference Mode, drag continuous sliders across the Gaussian latent manifold $z \sim \mathcal{N}(0, I)$ to observe smooth feature morphing, or toggle 2×2 batch grids to monitor output entropy.

![Latent Morph and Diversity](docs/screenshots/latent_morph_and_diversity.jpg)

---

## Supported Architectures

### 1. Generative Adversarial Networks (GAN)
* **Mathematical Core:** $\min_G \max_D V(D, G) = \mathbb{E}_{x \sim p_{\text{data}}}[\log D(x)] + \mathbb{E}_{z \sim p_z}[\log(1 - D(G(z)))]$
* **Visual Components:**
  * **Latent Noise Vector ($z$):** 8-dimensional Gaussian noise vectors with interactive values.
  * **Generator $G(z)$:** Transposed convolution stages ($1\times1 \to 3\times3 \to 6\times6 \to 12\times12$ pixels).
  * **Synthetic Output:** 12×12 pixel canvas with live per-pixel coordinates and activation values.
  * **Discriminator $D(x)$:** Strided Conv2D layers ($12\times12 \to 6\times6 \to 3\times3$) with Sigmoid classification.
  * **Adversarial Tug-of-War Bar:** Live game balance tracker showing Nash Equilibrium (50% / 50%).
  * **Batch Diversity Grid:** 2×2 multi-seed grid ($z_1, z_2, z_3, z_4$) with entropy indicators.

### 2. Convolutional Neural Networks (CNN)
* **Mathematical Core:** $(I * K)(i, j) = \sum_m \sum_n I(i-m, j-n) K(m, n)$
* **Visual Components:**
  * **Input Layer:** 2D pixel matrices representing input datasets (MNIST, CIFAR, Fashion).
  * **Sliding Convolutional Kernels:** Animated filters highlighting local receptive fields.
  * **Feature Maps:** Intermediate activation channels detecting edges, contours, and high-level textures.
  * **Max Pooling:** Spatial downsampling operations preserving peak activations.
  * **Dense Classification Head:** Flattened feature vectors connected to softmax class probabilities.

### 3. Transformer (Multi-Head Self-Attention)
* **Mathematical Core:** $\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$
* **Visual Components:**
  * **Token Embeddings & Positional Encodings:** Continuous vector representations of input sequences.
  * **Query, Key, Value Projections ($Q, K, V$):** Linear projections feeding the attention engine.
  * **Interactive Attention Matrix:** Full $N \times N$ token attention heatmap showing token-to-token weights.
  * **Connecting Attention Beams:** Visual rays linking contextual tokens based on cross-attention intensity.

### 4. Deep Q-Networks (DQN / Reinforcement Learning)
* **Mathematical Core:** $Q(s, a) \leftarrow Q(s, a) + \alpha [r + \gamma \max_{a'} Q(s', a') - Q(s, a)]$
* **Visual Components:**
  * **Gridworld Environment:** Interactive 5×5 spatial grid containing the agent, obstacles, and goals.
  * **State Vector:** Continuous coordinates $(x, y)$ fed into the Q-network.
  * **Q-Value Output Heads:** Real-time numerical valuations for actions: **Up, Down, Left, Right**.
  * **Exploration vs. Exploitation:** $\epsilon$-greedy action selection visualization.

### 5. Recurrent Neural Networks (RNN / LSTM)
* **Mathematical Core:** $h_t = \tanh(W_{hh} h_{t-1} + W_{xh} x_t + b_h)$
* **Visual Components:**
  * **Unrolled Time Steps:** Temporal visualization of sequence processing from step $t-1$ to $t+n$.
  * **Hidden State Memory ($h_t$):** Visual memory loop carrying contextual information forward.
  * **Vanishing Gradient Indicator:** Dynamic color fading highlighting gradient decay over long sequences.

### 6. Standard Multilayer Perceptrons (MLP)
* **Mathematical Core:** $a^{(l)} = \sigma(W^{(l)} a^{(l-1)} + b^{(l)})$
* **Visual Components:**
  * **Fully Connected Layers:** Dense connection graphs between input, hidden, and output neurons.
  * **Synaptic Weight Lines:** Color-coded connection lines (cyan for positive weights, rose for negative).
  * **Activation Thresholds:** Interactive neuron nodes showing raw sum $z$ and post-activation $a$.

### 7. Custom Model Architect
* Build custom network topologies on the fly.
* Add or remove layers, alter node counts, select custom activation functions, and evaluate the resulting parameter count and computational graph.

---

## Interactive Controls & Navigation

### Top Navigation Bar

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🧠 Neural Canvas │ [Model Dropdown] │ [Dataset] │ [Train | Inference] │ Model Info │ Canvas Tour │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Architecture Selector:** Instantly switches the simulation between GAN, CNN, Transformer, RNN, DQN, Standard NN, or Custom.
* **Dataset Selector & Preview:** Choose between canonical benchmark datasets (e.g., CelebA Faces, MNIST Digits, Fashion, Synthetic Gaussian Clusters). Clicking **Preview** opens the Dataset Inspector displaying sample distributions.
* **Mode Toggle (`Train` vs. `Inference`):**
  * **Train Mode:** Full forward-backward cycle, weight updates, loss calculations, and adversarial score shifts.
  * **Inference Mode:** Static weights; enables exploratory tools like the **Latent Morph Slider** to explore generative manifolds.
* **Comparison Mode:** Activates split-screen view to pit two architectures against each other side-by-side on identical tasks.
* **Model Info (`BookOpen`):** Opens a rich mathematical guide detailing formulas, loss derivations, architectural diagrams, and failure pathologies.
* **Canvas Tour (`Eye`):** Launches an interactive step-by-step spotlight tour that highlights key modules directly on the live canvas.
* **Glossary (`HelpCircle`):** Slide-out dictionary defining over 40 machine learning concepts, equations, and acronyms.
* **Code Export (`Code2`):** Generates copy-pasteable, production-ready implementation scripts in PyTorch, TensorFlow, or JAX.

---

### Hyperparameter & Diagnostics Sidebar

#### 1. Core Training Dynamics

| Control | Description | Effect on Simulation |
| :--- | :--- | :--- |
| **Learning Rate ($\eta$)** | Step size for gradient descent (e.g., 0.001 to 0.1). | Higher values cause rapid, oscillating convergence; low values cause slow, steady learning. |
| **Epochs & Batch Size** | Number of passes over dataset and sample count per step. | Controls update frequency and gradient smoothness. |
| **Optimizer** | Gradient algorithm: **Adam**, **SGD**, **RMSprop**. | Adam includes adaptive momentum; SGD exhibits raw stochastic oscillation. |
| **Activation Function** | **ReLU**, **LeakyReLU**, **Sigmoid**, **Tanh**, **GELU**. | Governs non-linearity and susceptibility to vanishing or exploding gradients. |
| **Failure Mode Sandbox** | Simulates real-world training bugs on demand: |
| ↳ *Mode Collapse* | Generator collapses into outputting a single repetitive sample. | Visual output freezes; batch diversity drops to 0.0. |
| ↳ *Vanishing Gradients* | Discriminator or downstream layers saturate; gradients vanish. | Generator weight updates freeze; images stay as static noise. |
| ↳ *Exploding Gradients* | Gradient multiplications overflow numeric range. | Activations and weights produce `NaN` values. |
| ↳ *Overfitting* | Model memorizes training set without generalizing. | Training loss drops to near-zero while validation loss spikes. |

#### 2. Model Topology & Structural Knobs (Dynamic per Architecture)

When switching between neural network architectures, the sidebar dynamically adapts with architecture-specific topological controls that directly alter the underlying mathematical models and visual layouts:

| Architecture | Structural Control | Options | Real Mathematical & Visual Impact |
| :--- | :--- | :--- | :--- |
| **Transformer** | **Attention Heads** | `1`, `2`, `4` Heads | Governs the number of independent projection subspaces ($W^Q_i, W^K_i, W^V_i$). 1 head shows a unified attention map; 4 heads splits attention into 4 specialized linguistic roles (Syntactic, Sentiment, Positional, Coreference) with a live multi-head switcher. |
| **CNN** | **Conv Depth** | `1`, `2`, `3` Layers | Rebuilds the forward feature extraction pipeline. Adding convolutional stages updates the 3D tensor hierarchy, receptive field depth, and intermediate channel representations. |
| **CNN** | **Pooling Operation** | `Max`, `Average` | Changes the spatial downsampling math: **Max Pooling** selects the peak activation $\max(x_{ij})$ to preserve sharp edges; **Average Pooling** computes the mean $\frac{1}{|R|}\sum x_{ij}$ to produce smoothed regional features. |
| **RNN** | **Cell Architecture** | `Vanilla RNN`, `LSTM`, `GRU` | Selects the gating equations for recurrent memory updates (simple tanh recurrent update vs. additive constant error carousels with input, forget, and output gates). |
| **RNN** | **Unrolled Steps** | `3`, `5`, `8` Steps | Controls the Backpropagation Through Time (BPTT) timeline. Expanding to 8 steps clearly reveals exponential gradient decay ($\le 0.25^T$) in the vanishing gradient failure mode. |
| **DQN (RL)** | **Exploration Schedule** | `Standard`, `Fast (Greedy)`, `High Exploration` | Controls the $\epsilon$-decay rate in $\epsilon$-greedy action selection ($P(\text{random}) = \epsilon$ vs. $P(\arg\max Q) = 1-\epsilon$). Fast decays in ~40 steps; High Exploration keeps $\epsilon \ge 0.20$ to avoid local minima. |
| **DQN (RL)** | **Discount Factor ($\gamma$)** | `0.50`, `0.90`, `0.99` | Plugs directly into the **Bellman Optimality Target**: $y = r + \gamma \max_{a'} Q(s', a')$. High $\gamma=0.99$ propagates long-term state values across distant tiles; low $\gamma=0.50$ produces steep, myopic dropoffs. |
| **Standard NN** | **Hidden Layers & Width** | `1-3` Layers, `4, 8, 16` Neurons | Dynamically adjusts dense weight matrices $W \in \mathbb{R}^{d_{l} \times d_{l-1}}$, drawing updated SVG synaptic connection lines and matrix products. |

---

### Playback & Micro-Stepping Controller

* **Play / Pause (`Space`):** Starts or pauses live continuous training loops.
* **Step Forward (`Step`):** Advances exactly one micro-step (e.g., single forward pass, single backpropagation update).
* **Reset:** Reinitializes all weights, biases, and latent vectors with fresh random seed distributions.
* **Speed Scrubber:** Adjusts simulation speed between `0.25x` (slow-motion tensor analysis) and `4.0x` (rapid convergence).
* **Step Status Pill:** Floating pill at the canvas base explaining the exact current operation (e.g., `EPOCH 2/10 • D_STEP • Discriminator evaluating fake batch`).
  * *Minimize button:* Collapses the pill into a compact chip.
  * *Hover transparency:* Hovering over the pill turns it 80% transparent to inspect graphics beneath.

---

## How to Read & Interpret Every Graphic

### GAN: Scores, Losses & Nash Equilibrium

The GAN dashboard visualizes an active zero-sum game between Generator $G$ and Discriminator $D$:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Generator Fools D (D(G(z)) → 1.0)  ★ Nash Eq (50/50) ★  D Catches Fakes (D(x) → 1.0) │
│  ███████████████████████████████████|████████████████████████████████  │
│  G: 48%                                                        D: 52%  │
└────────────────────────────────────────────────────────────────────────┘
```

1. **$D(x_{\text{real}})$ (Real Score):** Probability the Discriminator assigns to a real training image. Target for $D$ is $1.0$ (100%).
2. **$D(G(z)_{\text{fake}})$ (Fake Score):** Probability the Discriminator assigns to a synthetic image.
   * Discriminator wants this at **0%** (reject all fakes).
   * Generator wants this at **100%** (fool the discriminator).
3. **The 50/50 Nash Equilibrium:**
   * When training is optimal, the Generator's distribution matches the real dataset: $p_g = p_{\text{data}}$.
   * At this balance point, the Discriminator can do no better than random guessing (like flipping a coin):
     $$D(x) = D(G(z)) = 0.50 \quad (50\%)$$
4. **Tug-of-War Balance Bar:**
   * Amber center pin denotes the 50/50 equilibrium point.
   * If violet bar expands right: Generator is winning (Discriminator is baffled).
   * If emerald bar expands left: Discriminator is winning (catching fakes easily).

---

### GAN: Batch Diversity & Mode Collapse

Toggle the view above the synthetic sample between **Single Focus** and **Batch Grid (2×2)**:

* **Healthy Generative Training:** All 4 tiles (generated from separate latent vectors $z_1, z_2, z_3, z_4$) show distinct faces or digits with varying angles and features. Diversity metric registers $> 0.80$.
* **Mode Collapse Failure:** All 4 tiles produce the identical face or number. The Generator has discovered a single loophole that tricks $D$ and stopped exploring the latent space.

---

### CNN: Kernels, Stride & Feature Hierarchy

1. **Input Grid (12×12):** Raw pixel intensities normalized between 0.0 and 1.0.
2. **Kernel Filter Window (3×3 / 6×6):** Colored bounding box sliding across the image computing dot products.
3. **Feature Map Channels:**
   * Early layers detect low-level primitives: vertical edges, diagonal lines, corners.
   * Deep layers aggregate primitives into semantic parts: loops, intersections, textures.
4. **Max Pooling (2×2, Stride 2):** Takes the maximum value in each $2\times2$ neighborhood, halving the spatial resolution while granting translational invariance.

---

### Transformer: Attention Matrices & Heatmaps

* **Rows & Columns:** Represent input sequence tokens (e.g., words in a sentence).
* **Cell Brightness:** Indicates the normalized attention weight $\alpha_{ij} \in [0, 1]$. A bright intersection at Row "bank" and Column "river" indicates the model is using "river" to contextualize the polysemous word "bank".
* **Softmax Distribution:** Every row sums to exactly 1.0.
* **Attention Heads:** Switch between multiple heads to observe how Head 1 tracks syntactic dependencies (verb-subject) while Head 2 tracks coreference (pronoun-noun).

---

### DQN: State Grid, Q-Values & Policy Arrows

* **Agent Position ($s$):** Represented by the active agent icon on the 5×5 gridworld.
* **Q-Value Heatmap Overlay:** Each neighboring cell displays its expected cumulative future reward $Q(s, a)$.
* **Directional Arrows:** The brightest arrow points in the direction of $\arg\max_a Q(s, a)$ (the greedy optimal action).
* **Reward Feedback ($r$):** Reaching target yields $+1.0$; hitting walls or traps triggers $-1.0$ penalty.

---

### Live Metrics Dashboard & Overfitting Alerts

* **Loss Curve ($\mathcal{L}$):**
  * Standard Supervised Models: Monotonically decreasing curve toward zero.
  * GAN Models: Oscillating curves where $\mathcal{L}_G$ and $\mathcal{L}_D$ fluctuate in dynamic balance around $\ln 2 \approx 0.693$.
* **Memorization / Overfitting Alert:** When the gap between Training Loss and Validation Loss exceeds a critical threshold, a high-contrast warning banner appears on the chart:
  ```
  ⚠️ MEMORIZATION DETECTED
  Train Loss: 0.0421  |  Val Loss: 0.8912
  ```

---

## Code Export (PyTorch / TensorFlow / JAX)

Clicking the **Export Code** (`Code2`) button in the top navigation bar opens an interactive modal that translates your current architecture, layer configurations, and chosen hyperparameters into clean, runnable Python scripts:

* **PyTorch:** Clean `torch.nn.Module` classes with `DataLoader`, `Adam` optimizer, and standard training loops.
* **TensorFlow / Keras:** `tf.keras.Sequential` or Functional API pipelines ready for `model.fit()`.
* **JAX / Flax:** Functional state architectures using `linen` and `optax`.

---

## Getting Started (Local Development)

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/neural-canvas.git
   cd neural-canvas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The static production bundle will be generated in `dist/`.

---

## Technology Stack

* **Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/)
* **Vector Icons:** [Lucide React](https://lucide.dev/)
* **Animation & Transitions:** [Framer Motion](https://motion.dev/)
* **Charts & Analytics:** [Recharts](https://recharts.org/)

---

## License

This project is licensed under the [MIT License](LICENSE). Contributions, issues, and feature requests are welcome!
