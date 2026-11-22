import {
  analyzeQueryAndContext,
  buildSystemInstruction,
  buildStatelessCacheKey,
  type ChatHistoryTurn,
  type InferredIntent,
  type SimulationContextSnapshot,
} from '../server.ts';

interface EvalCase {
  id: number;
  message: string;
  expectedIntent: InferredIntent;
  history?: ChatHistoryTurn[];
  context?: SimulationContextSnapshot;
  expectStateless?: boolean;
  expectNotDeep?: boolean;
}

const INTENTS: InferredIntent[] = ['quick', 'tutor', 'math', 'debugger'];

const BASE_CONTEXT: SimulationContextSnapshot = {
  architecture: 'Standard NN',
  mode: 'Train',
  useCase: 'Classification',
  dataSource: 'Iris Flowers (Classification)',
  step: 12,
  hyperparams: {
    learningRate: 0.01,
    optimizer: 'Adam',
    lossFunction: 'Cross-Entropy',
    epochs: 100,
    batchSize: 32,
    failureMode: 'None',
  },
  latestMetrics: {
    step: 12,
    loss: 0.62,
    accuracy: 0.78,
    valLoss: 0.68,
    valAccuracy: 0.75,
  },
};

const EVAL_DATASET: EvalCase[] = [
  // ================= QUICK (36 cases) =================
  { id: 1, message: 'What is ReLU?', expectedIntent: 'quick', expectStateless: true },
  { id: 2, message: 'Define dropout briefly', expectedIntent: 'quick', expectStateless: true },
  { id: 3, message: 'What does Adam stand for?', expectedIntent: 'quick', expectStateless: true },
  { id: 4, message: 'TLDR batch normalization', expectedIntent: 'quick', expectStateless: true },
  { id: 5, message: 'What is an epoch?', expectedIntent: 'quick', expectStateless: true },
  { id: 6, message: 'Define stride in one sentence', expectedIntent: 'quick', expectStateless: true },
  { id: 7, message: 'Meaning of learning rate', expectedIntent: 'quick', expectStateless: true },
  { id: 8, message: 'What is a GAN?', expectedIntent: 'quick', expectStateless: true },
  { id: 9, message: 'What is a convolutional kernel?', expectedIntent: 'quick', expectStateless: true },
  { id: 10, message: 'What is max pooling?', expectedIntent: 'quick', expectStateless: true },
  { id: 11, message: 'What is validation accuracy?', expectedIntent: 'quick', expectStateless: true },
  { id: 12, message: 'Define positional encoding briefly', expectedIntent: 'quick', expectStateless: true },
  { id: 13, message: 'What is epsilon-greedy?', expectedIntent: 'quick', expectStateless: true },
  { id: 14, message: 'In short, what is RMSprop?', expectedIntent: 'quick', expectStateless: true },
  { id: 15, message: 'What is GELU?', expectedIntent: 'quick', expectStateless: true },
  { id: 16, message: 'What does BPTT stand for?', expectedIntent: 'quick', expectStateless: true },
  { id: 17, message: 'Define hidden state in 2 sentences', expectedIntent: 'quick', expectStateless: true },
  { id: 18, message: 'What is batch size?', expectedIntent: 'quick', expectStateless: true },
  { id: 19, message: 'Explain overfitting briefly', expectedIntent: 'quick', expectStateless: true },
  { id: 20, message: 'What is an activation function?', expectedIntent: 'quick', expectStateless: true },
  { id: 21, message: 'What is Huber loss briefly?', expectedIntent: 'quick', expectStateless: true },
  { id: 22, message: 'What is a receptive field?', expectedIntent: 'quick', expectStateless: true },
  { id: 23, message: 'TLDR layer normalization', expectedIntent: 'quick', expectStateless: true },
  { id: 24, message: 'What is teacher forcing?', expectedIntent: 'quick', expectStateless: true },
  { id: 25, message: 'Define latent space briefly', expectedIntent: 'quick', expectStateless: true },
  { id: 26, message: 'What is weight decay?', expectedIntent: 'quick', expectStateless: true },
  { id: 27, message: 'What are residual connections?', expectedIntent: 'quick', expectStateless: true },
  { id: 28, message: 'Quick summary of momentum in SGD', expectedIntent: 'quick', expectStateless: true },
  { id: 29, message: 'What is cosine annealing?', expectedIntent: 'quick', expectStateless: true },
  { id: 30, message: 'What is a token embedding?', expectedIntent: 'quick', expectStateless: true },
  { id: 31, message: 'Define Q-learning briefly', expectedIntent: 'quick', expectStateless: true },
  { id: 32, message: 'What is average pooling?', expectedIntent: 'quick', expectStateless: true },
  { id: 33, message: 'What does ONNX stand for?', expectedIntent: 'quick', expectStateless: true },
  { id: 34, message: 'Explain early stopping in one sentence', expectedIntent: 'quick', expectStateless: true },
  { id: 35, message: 'What is label smoothing?', expectedIntent: 'quick', expectStateless: true },
  { id: 36, message: 'What is a hyperparameter?', expectedIntent: 'quick', expectStateless: true },

  // ================= TUTOR (40 cases) =================
  { id: 37, message: 'How do CNNs learn hierarchical features from raw pixels?', expectedIntent: 'tutor', expectStateless: true },
  { id: 38, message: 'Why do LSTMs handle long sequences better than vanilla RNNs?', expectedIntent: 'tutor', expectStateless: true },
  { id: 39, message: 'How should I organise layers when building a small image classifier?', expectedIntent: 'tutor', expectStateless: true, context: { ...BASE_CONTEXT, architecture: 'GAN' } },
  { id: 40, message: 'Explain next-token prediction in autoregressive Transformers.', expectedIntent: 'tutor', expectStateless: true },
  { id: 41, message: 'How does exploration vs exploitation work in reinforcement learning?', expectedIntent: 'tutor', expectStateless: true },
  { id: 42, message: 'Walk me through how the generator and discriminator compete during training.', expectedIntent: 'tutor', expectStateless: true },
  { id: 43, message: 'What happens intuitively when you increase stride in a convolutional layer?', expectedIntent: 'tutor', expectStateless: true },
  { id: 44, message: 'When should I choose GRU instead of LSTM for sequence modeling?', expectedIntent: 'tutor', expectStateless: true },
  { id: 45, message: 'How does discount factor gamma change an RL agent’s behavior?', expectedIntent: 'tutor', expectStateless: true },
  { id: 46, message: 'How is Standard NN currently processing Iris Flowers with my current hyperparameters?', expectedIntent: 'tutor', expectStateless: false },
  { id: 47, message: 'Give me an experiment to try right now in the sidebar for CNN.', expectedIntent: 'tutor', expectStateless: false, context: { ...BASE_CONTEXT, architecture: 'CNN' } },
  { id: 48, message: 'Compare Adam and SGD with momentum for training deep networks.', expectedIntent: 'tutor', expectStateless: true },
  { id: 49, message: 'Why does multi-head attention help a Transformer attend to different roles?', expectedIntent: 'tutor', expectStateless: true },
  { id: 50, message: 'Explain the intuition behind residual skip connections in deep nets.', expectedIntent: 'tutor', expectStateless: true },
  { id: 51, message: 'How do convolutional filters detect edges before textures?', expectedIntent: 'tutor', expectStateless: true },
  { id: 52, message: 'Why do we split data into training and validation sets?', expectedIntent: 'tutor', expectStateless: true },
  { id: 53, message: 'How does latent space interpolation work in inference mode here?', expectedIntent: 'tutor', expectStateless: false, context: { ...BASE_CONTEXT, architecture: 'GAN', mode: 'Inference' } },
  { id: 54, message: 'Explain how batch size affects training stability and generalization.', expectedIntent: 'tutor', expectStateless: true },
  { id: 55, message: 'What is the role of the replay buffer in Deep Q-Networks?', expectedIntent: 'tutor', expectStateless: true },
  { id: 56, message: 'How does target network freezing stabilize DQN updates?', expectedIntent: 'tutor', expectStateless: true },
  { id: 57, message: 'Why do Transformers scale better across long contexts than RNNs?', expectedIntent: 'tutor', expectStateless: true },
  { id: 58, message: 'Explain what this active CNN visualizer is showing at step 12.', expectedIntent: 'tutor', expectStateless: false, context: { ...BASE_CONTEXT, architecture: 'CNN', step: 12 } },
  { id: 59, message: 'How does MSE regression behave on Housing Valuation in this sandbox?', expectedIntent: 'tutor', expectStateless: false, expectNotDeep: true, context: { ...BASE_CONTEXT, useCase: 'Regression', hyperparams: { ...BASE_CONTEXT.hyperparams, lossFunction: 'MSE' }, latestMetrics: { step: 5, loss: 120, accuracy: 0.4 } } },
  { id: 60, message: 'Why do we use non-linear activations between linear layers?', expectedIntent: 'tutor', expectStateless: true },
  { id: 61, message: 'What tradeoffs exist between Max Pooling and Average Pooling?', expectedIntent: 'tutor', expectStateless: true },
  { id: 62, message: 'Explain the role of temperature in sampling from a language model.', expectedIntent: 'tutor', expectStateless: true },
  { id: 63, message: 'How does causal masking preserve autoregression in decoder Transformers?', expectedIntent: 'tutor', expectStateless: true },
  { id: 64, message: 'Why is Nash equilibrium 50/50 for an ideal GAN discriminator?', expectedIntent: 'tutor', expectStateless: true },
  { id: 65, message: 'Explain how layer depth impacts representation capacity in MLPs.', expectedIntent: 'tutor', expectStateless: true },
  { id: 66, message: 'How does gradient clipping keep recurrent training from destabilizing?', expectedIntent: 'tutor', expectStateless: true },
  { id: 67, message: 'What makes Transformer self-attention permutation-equivariant without positional encodings?', expectedIntent: 'tutor', expectStateless: true },
  { id: 68, message: 'How does learning rate schedule warm-up help early training?', expectedIntent: 'tutor', expectStateless: true },
  { id: 69, message: 'Explain precision vs recall when evaluating an imbalanced churn classifier.', expectedIntent: 'tutor', expectStateless: true },
  { id: 70, message: 'Why does data augmentation reduce generalization error in vision models?', expectedIntent: 'tutor', expectStateless: true },
  { id: 71, message: 'Tell me what to watch on the canvas if I switch optimizer to SGD.', expectedIntent: 'tutor', expectStateless: false },
  { id: 72, message: 'How does tokenization affect sequence length in NLP models?', expectedIntent: 'tutor', expectStateless: true },
  { id: 73, message: 'Why do deeper networks need careful initialization like Xavier or He?', expectedIntent: 'tutor', expectStateless: true },
  { id: 74, message: 'What is the difference between pre-norm and post-norm Transformer blocks?', expectedIntent: 'tutor', expectStateless: true },
  { id: 75, message: 'How does greedy decoding differ from beam search in sequence generation?', expectedIntent: 'tutor', expectStateless: true },
  { id: 76, message: 'How can I tell from my current accuracy curve whether this model is improving?', expectedIntent: 'tutor', expectStateless: false },

  // ================= MATH / CODE (37 cases) =================
  { id: 77, message: 'What is a loss function in neural networks and how is Cross-Entropy written?', expectedIntent: 'math', expectStateless: true },
  { id: 78, message: 'Derive the scaled dot-product attention equation and its Q-K-V dimensions.', expectedIntent: 'math', expectStateless: true },
  { id: 79, message: 'Show the forward and backpropagation matrix equations for a 3-layer MLP.', expectedIntent: 'math', expectStateless: true },
  { id: 80, message: 'Write a clean PyTorch Conv2d classifier matching a 28x28 grayscale input.', expectedIntent: 'math', expectStateless: true },
  { id: 81, message: 'Why do we divide QK^T by sqrt(d_k) in softmax attention?', expectedIntent: 'math', expectStateless: true },
  { id: 82, message: 'Derive the gradient of binary cross-entropy combined with sigmoid.', expectedIntent: 'math', expectStateless: true },
  { id: 83, message: 'What is the output tensor shape after two 3x3 conv layers with stride 2 and 2x2 pooling?', expectedIntent: 'math', expectStateless: true },
  { id: 84, message: 'Write the Bellman optimality equation used by DQN.', expectedIntent: 'math', expectStateless: true },
  { id: 85, message: 'Show the GAN minimax objective formula and explain both expectations.', expectedIntent: 'math', expectStateless: true },
  { id: 86, message: 'Compute the Jacobian of softmax with respect to its logits.', expectedIntent: 'math', expectStateless: true },
  { id: 87, message: 'Implement a minimal multi-head attention module in PyTorch.', expectedIntent: 'math', expectStateless: true },
  { id: 88, message: 'Show the TensorFlow Keras Sequential code for an MLP with Adam.', expectedIntent: 'math', expectStateless: true },
  { id: 89, message: 'Explain KL divergence mathematically and how it relates to cross-entropy loss.', expectedIntent: 'math', expectStateless: true },
  { id: 90, message: 'Derive the chain rule step through an unrolled vanilla RNN hidden state.', expectedIntent: 'math', expectStateless: true },
  { id: 91, message: 'What are the LSTM forget, input, and output gate equations?', expectedIntent: 'math', expectStateless: true },
  { id: 92, message: 'How does L2 regularization modify the weight gradient update rule?', expectedIntent: 'math', expectStateless: true },
  { id: 93, message: 'Show the Adam update equations including bias-corrected first and second moments.', expectedIntent: 'math', expectStateless: true },
  { id: 94, message: 'What is the Hessian matrix and why does curvature matter for learning rate bounds?', expectedIntent: 'math', expectStateless: true },
  { id: 95, message: 'Write a snippet of PyTorch code for a training loop with gradient clipping.', expectedIntent: 'math', expectStateless: true },
  { id: 96, message: 'How do you calculate the number of parameters in a Conv2d layer?', expectedIntent: 'math', expectStateless: true },
  { id: 97, message: 'Prove why ReLU has constant gradient 1 for positive pre-activations.', expectedIntent: 'math', expectStateless: true },
  { id: 98, message: 'What matrix dimensions does matmul require for multi-head Q, K, and V?', expectedIntent: 'math', expectStateless: true },
  { id: 99, message: 'Compare MSE and Huber loss formulas mathematically.', expectedIntent: 'math', expectStateless: true },
  { id: 100, message: 'Show the eigenvalue condition under which repeated W_hh multiplication shrinks.', expectedIntent: 'math', expectStateless: true },
  { id: 101, message: 'How is cosine similarity formulated mathematically for embedding vectors?', expectedIntent: 'math', expectStateless: true },
  { id: 102, message: 'Show the formula for 2D discrete convolution output spatial dimensions.', expectedIntent: 'math', expectStateless: true },
  { id: 103, message: 'Write Keras code to compile a regression model with Huber loss.', expectedIntent: 'math', expectStateless: true },
  { id: 104, message: 'Derive the gradient of MSE loss with respect to linear layer weights.', expectedIntent: 'math', expectStateless: true },
  { id: 105, message: 'Explain the reparameterization trick equation in VAEs.', expectedIntent: 'math', expectStateless: true },
  { id: 106, message: 'How does RMSprop scale gradients using the exponential moving average?', expectedIntent: 'math', expectStateless: true },
  { id: 107, message: 'Show the softmax cross-entropy loss gradient with respect to logits.', expectedIntent: 'math', expectStateless: true },
  { id: 108, message: 'What tensor shape does an 8-token batch of 4-head attention scores have?', expectedIntent: 'math', expectStateless: true },
  { id: 109, message: 'Derive the optimal discriminator D*(x) in the minimax GAN game.', expectedIntent: 'math', expectStateless: true },
  { id: 110, message: 'Show the sinusoidal positional encoding formula.', expectedIntent: 'math', expectStateless: true },
  { id: 111, message: 'Implement scaled dot-product attention in clean PyTorch.', expectedIntent: 'math', expectStateless: true },
  { id: 112, message: 'Write the update equation for policy TD error in Q-learning.', expectedIntent: 'math', expectStateless: true },
  { id: 113, message: 'Derive that!', expectedIntent: 'math', history: [{ role: 'user', text: 'What is cross-entropy loss?' }, { role: 'model', text: 'Cross-entropy measures KL divergence plus entropy.' }] },

  // ================= DEBUGGER (37 cases) =================
  { id: 114, message: 'Why did loss hit NaN at step 20?', expectedIntent: 'debugger', expectStateless: false },
  { id: 115, message: 'My loss blew up to NaN, how do I fix it?', expectedIntent: 'debugger', expectStateless: false },
  { id: 116, message: 'I injected Overfitting on CNN with LR=0.01. Why is val loss rising?', expectedIntent: 'debugger', expectStateless: false, context: { ...BASE_CONTEXT, architecture: 'CNN', hyperparams: { ...BASE_CONTEXT.hyperparams, failureMode: 'Overfitting' } } },
  { id: 117, message: 'Why are gradients vanishing in my 5-layer network?', expectedIntent: 'debugger', expectStateless: false },
  { id: 118, message: 'My GAN keeps generating the exact same face in all 4 grid cells. Why?', expectedIntent: 'debugger', expectStateless: false, context: { ...BASE_CONTEXT, architecture: 'GAN', hyperparams: { ...BASE_CONTEXT.hyperparams, failureMode: 'Mode Collapse' } } },
  { id: 119, message: 'How do I diagnose discriminator overpowering in this GAN run?', expectedIntent: 'debugger', expectStateless: false, context: { ...BASE_CONTEXT, architecture: 'GAN', hyperparams: { ...BASE_CONTEXT.hyperparams, failureMode: 'Discriminator Overpowering' } } },
  { id: 120, message: 'Training loss is stuck in a plateau and not learning at all.', expectedIntent: 'debugger' },
  { id: 121, message: 'Why is the loss curve oscillating wildly with LR=0.1?', expectedIntent: 'debugger', expectStateless: false },
  { id: 122, message: 'Attention weights flattened into a uniform blur—what causes attention collapse?', expectedIntent: 'debugger' },
  { id: 123, message: 'Why is my DQN agent stuck looping in the same corner of the gridworld?', expectedIntent: 'debugger', expectStateless: false, context: { ...BASE_CONTEXT, architecture: 'DQN', hyperparams: { ...BASE_CONTEXT.hyperparams, failureMode: 'Poor Exploration' } } },
  { id: 124, message: 'Validation loss is diverging while training accuracy hits 99%. Fix?', expectedIntent: 'debugger' },
  { id: 125, message: 'Early tokens are completely forgotten in this vanilla RNN run.', expectedIntent: 'debugger', expectStateless: false, context: { ...BASE_CONTEXT, architecture: 'RNN', hyperparams: { ...BASE_CONTEXT.hyperparams, failureMode: 'Vanishing Gradients' } } },
  { id: 126, message: 'Troubleshoot why my current model stopped improving after epoch 3.', expectedIntent: 'debugger', expectStateless: false },
  { id: 127, message: 'What is wrong with this active simulation right now?', expectedIntent: 'debugger', expectStateless: false, context: { ...BASE_CONTEXT, hyperparams: { ...BASE_CONTEXT.hyperparams, failureMode: 'Exploding Gradients' }, latestMetrics: { step: 25, loss: Number.NaN, accuracy: 0.1 } } },
  { id: 128, message: 'Exploding gradients keep overflowing weights in my RNN.', expectedIntent: 'debugger', expectStateless: false },
  { id: 129, message: 'Why is my generator loss skyrocketing while discriminator loss drops to zero?', expectedIntent: 'debugger', expectStateless: false },
  { id: 130, message: 'My CNN is memorizing exact pixels instead of generalizing.', expectedIntent: 'debugger', expectStateless: false },
  { id: 131, message: 'How do I fix mode collapse without breaking adversarial balance?', expectedIntent: 'debugger' },
  { id: 132, message: 'Why is training diverging when I switch from Adam to high-LR SGD?', expectedIntent: 'debugger' },
  { id: 133, message: 'Dead neurons keep outputting zeros—how do I debug ReLU collapse?', expectedIntent: 'debugger' },
  { id: 134, message: 'Why is my model failing right now?', expectedIntent: 'debugger', expectStateless: false, context: { ...BASE_CONTEXT, hyperparams: { ...BASE_CONTEXT.hyperparams, failureMode: 'Overfitting' } } },
  { id: 135, message: 'My loss curve looks broken at step 40—what should I tweak?', expectedIntent: 'debugger', expectStateless: false, context: { ...BASE_CONTEXT, step: 40, hyperparams: { ...BASE_CONTEXT.hyperparams, failureMode: 'Vanishing Gradients' } } },
  { id: 136, message: 'How can I prevent overfitting when dataset size is tiny?', expectedIntent: 'debugger' },
  { id: 137, message: 'Why do gradients explode during backpropagation through long sequences?', expectedIntent: 'debugger' },
  { id: 138, message: 'Debug why this Transformer has uniform attention across every token.', expectedIntent: 'debugger', expectStateless: false, context: { ...BASE_CONTEXT, architecture: 'Transformer', hyperparams: { ...BASE_CONTEXT.hyperparams, failureMode: 'Attention Collapse' } } },
  { id: 139, message: 'My validation accuracy crashed even though train loss keeps dropping.', expectedIntent: 'debugger', expectStateless: false },
  { id: 140, message: 'What causes training instability in deep networks with sigmoid activations?', expectedIntent: 'debugger' },
  { id: 141, message: 'Why is this MSE loss spiking so badly right now?', expectedIntent: 'debugger', expectStateless: false, context: { ...BASE_CONTEXT, hyperparams: { ...BASE_CONTEXT.hyperparams, lossFunction: 'MSE' }, latestMetrics: { step: 20, loss: 15000, accuracy: 0.1 } } },
  { id: 142, message: 'How do I fix vanishing gradients in a 6-layer MLP?', expectedIntent: 'debugger' },
  { id: 143, message: 'Why is the agent stuck in a suboptimal loop in this RL simulation?', expectedIntent: 'debugger', expectStateless: false },
  { id: 144, message: 'My optimizer seems stuck—loss refuses to decrease below 2.3.', expectedIntent: 'debugger', expectStateless: false },
  { id: 145, message: 'Diagnose why my GAN diversity score dropped to 0.0.', expectedIntent: 'debugger', expectStateless: false },
  { id: 146, message: 'Why does training oscillate around the minimum instead of converging?', expectedIntent: 'debugger' },
  { id: 147, message: 'How do I troubleshoot NaN activations after step 15?', expectedIntent: 'debugger' },
  { id: 148, message: 'What is causing this current run to diverge?', expectedIntent: 'debugger', expectStateless: false, context: { ...BASE_CONTEXT, hyperparams: { ...BASE_CONTEXT.hyperparams, failureMode: 'Exploding Gradients' } } },
  { id: 149, message: 'Fix this overfitting curve in my current run.', expectedIntent: 'debugger', expectStateless: false },
  { id: 150, message: 'Why is the discriminator starving the generator of gradients here?', expectedIntent: 'debugger', expectStateless: false },
];

function runEvaluation() {
  const confusion: Record<InferredIntent, Record<InferredIntent, number>> = {
    quick: { quick: 0, tutor: 0, math: 0, debugger: 0 },
    tutor: { quick: 0, tutor: 0, math: 0, debugger: 0 },
    math: { quick: 0, tutor: 0, math: 0, debugger: 0 },
    debugger: { quick: 0, tutor: 0, math: 0, debugger: 0 },
  };

  const complexityCounts: Record<string, number> = {
    fast: 0,
    balanced: 0,
    analytical: 0,
    deep: 0,
  };

  let correct = 0;
  let statelessChecksTotal = 0;
  let statelessChecksPassed = 0;
  let mseCheckPassed = true;
  const failures: Array<{ id: number; expected: InferredIntent; predicted: InferredIntent; message: string }> = [];

  for (const test of EVAL_DATASET) {
    const ctx = test.context ?? BASE_CONTEXT;
    const hist = test.history ?? [];
    const decision = analyzeQueryAndContext(test.message, hist, ctx);

    confusion[test.expectedIntent][decision.intent] += 1;
    complexityCounts[decision.complexity] += 1;

    if (decision.intent === test.expectedIntent) {
      correct += 1;
    } else {
      failures.push({
        id: test.id,
        expected: test.expectedIntent,
        predicted: decision.intent,
        message: test.message,
      });
    }

    if (test.expectStateless !== undefined) {
      statelessChecksTotal += 1;
      const actualStateless = hist.length === 0 && !decision.refersToLiveRun;
      if (actualStateless === test.expectStateless) {
        statelessChecksPassed += 1;
      } else {
        console.warn(
          `[Stateless mismatch #${test.id}] expected=${test.expectStateless} actual=${actualStateless} msg="${test.message}"`
        );
      }
    }

    if (test.expectNotDeep && decision.complexity === 'deep') {
      mseCheckPassed = false;
      console.warn(`[MSE instability misfire #${test.id}] got complexity=deep for "${test.message}"`);
    }
  }

  // Verify cache determinism invariant across two divergent live snapshots
  const conceptualQuery = 'What is a loss function?';
  const ctxA: SimulationContextSnapshot = {
    architecture: 'GAN',
    step: 4,
    hyperparams: { learningRate: 0.01, failureMode: 'None' },
    latestMetrics: { step: 4, loss: 2.9, accuracy: 0.2 },
  };
  const ctxB: SimulationContextSnapshot = {
    architecture: 'GAN',
    step: 300,
    hyperparams: { learningRate: 0.1, failureMode: 'Mode Collapse' },
    latestMetrics: { step: 300, loss: Number.NaN, accuracy: 0.0 },
  };
  const routeA = analyzeQueryAndContext(conceptualQuery, [], ctxA);
  const routeB = analyzeQueryAndContext(conceptualQuery, [], ctxB);
  const sysA = buildSystemInstruction(routeA.intent, routeA.complexity, ctxA, { stateless: !routeA.refersToLiveRun });
  const sysB = buildSystemInstruction(routeB.intent, routeB.complexity, ctxB, { stateless: !routeB.refersToLiveRun });
  const keyA = buildStatelessCacheKey(routeA.primary.model, routeA.primary.thinkingLevel, sysA, conceptualQuery);
  const keyB = buildStatelessCacheKey(routeB.primary.model, routeB.primary.thinkingLevel, sysB, conceptualQuery);
  const determinismInvariantPassed =
    !routeA.refersToLiveRun && !routeB.refersToLiveRun && sysA === sysB && keyA === keyB;

  const accuracy = (correct / EVAL_DATASET.length) * 100;

  console.log('\n=== NeuralSight Router Evaluation Baseline ===');
  console.log(`Dataset size:       ${EVAL_DATASET.length} labelled prompts`);
  console.log(`Intent accuracy:    ${correct}/${EVAL_DATASET.length} (${accuracy.toFixed(1)}%)`);
  console.log(`Stateless checks:   ${statelessChecksPassed}/${statelessChecksTotal}`);
  console.log(`MSE loss=120 guard: ${mseCheckPassed ? 'PASS' : 'FAIL'}`);
  console.log(`Cache determinism:  ${determinismInvariantPassed ? 'PASS (identical stateless prompt & key)' : 'FAIL'}`);
  console.log(
    `Complexity tiers:   fast=${complexityCounts.fast}, balanced=${complexityCounts.balanced}, analytical=${complexityCounts.analytical}, deep=${complexityCounts.deep}`
  );

  console.log('\nConfusion Matrix (rows = expected, cols = predicted):');
  const header = ['expected \\ pred', ...INTENTS].map((s) => s.padEnd(14)).join(' | ');
  console.log(header);
  console.log('-'.repeat(header.length));
  for (const expected of INTENTS) {
    const row = [
      expected.padEnd(14),
      ...INTENTS.map((pred) => String(confusion[expected][pred]).padEnd(14)),
    ].join(' | ');
    console.log(row);
  }

  console.log('\nPer-Class Metrics:');
  for (const cls of INTENTS) {
    const tp = confusion[cls][cls];
    const fp = INTENTS.reduce((sum, r) => (r === cls ? sum : sum + confusion[r][cls]), 0);
    const fn = INTENTS.reduce((sum, c) => (c === cls ? sum : sum + confusion[cls][c]), 0);
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    console.log(
      `  ${cls.padEnd(9)} P=${(precision * 100).toFixed(1)}%  R=${(recall * 100).toFixed(1)}%  F1=${(f1 * 100).toFixed(1)}%`
    );
  }

  if (failures.length > 0) {
    console.log(`\nMisclassified Cases (${failures.length}):`);
    for (const f of failures.slice(0, 20)) {
      console.log(`  #${f.id} [expected=${f.expected}, got=${f.predicted}] "${f.message}"`);
    }
  } else {
    console.log('\nMisclassified Cases: 0');
  }
  console.log('');
}

runEvaluation();
