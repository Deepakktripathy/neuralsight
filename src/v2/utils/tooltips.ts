export const CUSTOM_MODEL_TOOLTIPS = {
  "Custom Model Viewer": {
    "ONNX": "Open Neural Network Exchange. An open standard format for representing machine learning models.",
    "Tensor": "A multi-dimensional array of numbers. Tensors flow through the graph from node to node.",
    "Node": "An operation or function in the computational graph (e.g., Convolution, ReLU, MatMul).",
    "Edge": "Represents the flow of data (tensors) from the output of one node to the input of another.",
    "Properties": "Hyperparameters and configuration attributes specific to an operation (e.g., kernel size, strides)."
  },
  "Supported Architectures": {
    "PyTorch": "Export via torch.onnx.export() to generate a parseable graph.",
    "JAX / Flax": "Export via jax2onnx or similar tracing libraries.",
    "TensorFlow": "Convert SavedModels to ONNX via tf2onnx to view architecture."
  }
};

export const TOOLTIPS = {
  "Training Metrics": {
    "Loss": "The difference between the model's prediction and the actual truth. A lower loss means the model is making fewer errors.",
    "Accuracy": "The percentage of times the model makes the correct prediction. Only applicable to classification tasks.",
    "Epoch": "One complete pass through the entire training dataset.",
    "Batch Size": "The number of examples the model processes before updating its internal weights."
  },
  "Optimization": {
    "Gradient": "The mathematical slope that tells the model which direction to adjust its weights to reduce the error.",
    "Learning Rate": "How big of a step the model takes when updating its weights. Too high, it bounces around; too low, it takes forever to learn.",
    "Optimizer": "The specific algorithm used to adjust weights based on gradients (e.g. Adam, SGD).",
    "Backpropagation": "The process of calculating gradients backward from the output layer to the input layer."
  },
  "Architectures": {
    "Standard NN": "A basic network where every neuron is connected to every neuron in the next layer.",
    "CNN": "Convolutional Neural Network. Specialized for grids like images, using sliding filters to detect spatial patterns.",
    "RNN": "Recurrent Neural Network. Specialized for sequences, maintaining a 'hidden state' memory as it processes data step-by-step.",
    "Transformer": "A sequence model that uses 'self-attention' to look at all parts of the sequence simultaneously, rather than step-by-step.",
    "GAN": "Generative Adversarial Network. Two networks competing against each other in a minimax game to synthesize authentic-looking data."
  },
  "GAN Concepts": {
    "Generator G(z)": "Neural network that transforms random noise vector z into synthetic images. Its goal is to maximize D's error by generating realistic fakes.",
    "Discriminator D(x)": "Convolutional classifier that evaluates input samples and outputs the probability that the sample came from the real dataset rather than the Generator.",
    "Real Score D(x)": "Probability P(Real) assigned to authentic dataset training samples. Starts near 1.0 (100%) and approaches 0.50 as the game equilibrates.",
    "Fake Score D(G(z))": "Probability P(Real) assigned to generated synthetic samples. The Generator attempts to drive this towards 1.0; the Discriminator attempts to keep it at 0.0.",
    "Nash Equilibrium (50-50)": "The theoretical balance point where the generator's distribution p_g matches the true data distribution p_data. Here, the discriminator cannot distinguish real from fake, guessing 50% for both: D(x) = D(G(z)) = 0.50.",
    "Latent Space (z)": "A continuous low-dimensional vector space (e.g. z ~ N(0, I)). Navigating this space allows smooth interpolation between generated samples.",
    "Mode Collapse": "A common GAN pathology where the generator learns to produce only a single or limited subset of realistic outputs, ignoring latent variation.",
    "Vanishing Gradients": "Occurs when the discriminator becomes too strong too early (D(x) ≈ 1, D(G(z)) ≈ 0). Its output saturates, starving the generator of learning signal."
  }
};

export const getArchitectureTooltip = (architecture: string, label: string) => {
  const normLabel = label.toLowerCase();
  
  if (architecture === 'StandardNN') {
    if (normLabel.includes('input')) return "Receives raw data features. Each node represents a single feature from the dataset (e.g., a pixel value or a tabular data column).";
    if (normLabel.includes('hidden')) return "Applies weighted sums and activation functions to extract non-linear patterns from the previous layer.";
    if (normLabel.includes('output')) return "Produces the final prediction. In classification, these are often probabilities for each class.";
  }
  
  if (architecture === 'CNN') {
    if (normLabel.includes('input')) return "Raw 2D pixel data. The network views this as a grid of numerical values (0-255).";
    if (normLabel.includes('conv')) return "Slides convolutional filters over the input to detect spatial features like edges, curves, and textures.";
    if (normLabel.includes('pool')) return "Downsamples the spatial dimensions, reducing computation and making feature detection translation-invariant.";
    if (normLabel.includes('output')) return "Flattens the features into a 1D vector to produce final class probabilities.";
  }
  
  if (architecture === 'Transformer') {
    if (normLabel.includes('input')) return "Raw tokens are embedded into continuous vectors and combined with positional encodings.";
    if (normLabel.includes('attention')) return "Computes relationships between all tokens simultaneously, allowing the model to focus on relevant context regardless of distance.";
    if (normLabel.includes('output')) return "Projects the contextualized embeddings into probabilities for the next token in the sequence.";
  }

  if (architecture === 'DQN') {
    if (normLabel.includes('environment')) return "The current state of the world the agent observes. Here, it's the agent's position on the grid.";
    if (normLabel.includes('network')) return "Takes the state as input and estimates the expected future reward (Q-value) of each possible action.";
    if (normLabel.includes('q-value')) return "The network's estimate of how good each action is from the current state. The agent picks the action with the highest Q-value.";
  }

  if (architecture === 'GAN') {
    if (normLabel.includes('generator')) return "Takes random noise z and learns to transform it into realistic fake data via transposed convolutions.";
    if (normLabel.includes('discriminator')) return "A convolutional classifier that scores whether an image is real or synthetic. Its error gradients train the Generator.";
    if (normLabel.includes('latent') || normLabel === 'z') return "Random continuous values sampled from Gaussian noise z ~ N(0, I) that encode high-level image features.";
    if (normLabel.includes('real')) return "Ground-truth sample drawn from the training dataset. The Discriminator tries to classify this as 1.0.";
    if (normLabel.includes('fake')) return "Synthetic sample produced by G(z). The Generator wants D to classify this as 1.0, while D wants to classify it as 0.0.";
    if (normLabel.includes('equilibrium') || normLabel.includes('balance') || normLabel.includes('minimax')) return "Nash Equilibrium: When G matches the real distribution (p_g = p_data), D is completely uncertain, outputting 50% (0.50) for both real and fake.";
  }
  
  return "";
};
