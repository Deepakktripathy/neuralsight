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
