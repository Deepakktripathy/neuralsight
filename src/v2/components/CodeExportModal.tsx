import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Download } from 'lucide-react';
import { Architecture, Hyperparameters, UseCase, DataSource } from '../types';

interface CodeExportModalProps {
  architecture: Architecture;
  hyperparams: Hyperparameters;
  useCase: UseCase;
  dataSource: DataSource;
  onClose: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({
  architecture,
  hyperparams,
  useCase,
  dataSource,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [framework, setFramework] = useState<'pytorch' | 'keras'>('pytorch');

  const generatePyTorchCode = () => {
    const lr = hyperparams.learningRate;
    const batchSize = hyperparams.batchSize;
    const epochs = hyperparams.epochs;
    const layers = hyperparams.layers;
    const optimizerName = hyperparams.optimizer;
    const lossFnName = hyperparams.lossFunction;

    let modelDefinition = '';
    let criterion = lossFnName === 'MSE' ? 'nn.MSELoss()' : (lossFnName === 'Huber' ? 'nn.SmoothL1Loss()' : 'nn.CrossEntropyLoss()');
    let optimizerStr = optimizerName === 'Adam' 
      ? `optim.Adam(model.parameters(), lr=${lr})` 
      : (optimizerName === 'RMSprop' ? `optim.RMSprop(model.parameters(), lr=${lr})` : `optim.SGD(model.parameters(), lr=${lr}, momentum=0.9)`);

    if (architecture === 'CNN') {
      modelDefinition = `class ConvNet(nn.Module):
    def __init__(self, num_classes=10):
        super(ConvNet, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
        )
        self.classifier = nn.Sequential(
            nn.Linear(64 * 7 * 7, 128),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)

model = ConvNet()`;
    } else if (architecture === 'Transformer') {
      modelDefinition = `class TransformerClassifier(nn.Module):
    def __init__(self, vocab_size=10000, d_model=128, nhead=4, num_layers=${Math.max(2, layers)}):
        super(TransformerClassifier, self).__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.pos_encoder = nn.Parameter(torch.zeros(1, 100, d_model))
        encoder_layer = nn.TransformerEncoderLayer(d_model=d_model, nhead=nhead, dim_feedforward=512, batch_first=True)
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.fc = nn.Linear(d_model, 2)

    def forward(self, x):
        x = self.embedding(x) + self.pos_encoder[:, :x.size(1), :]
        x = self.transformer(x)
        return self.fc(x.mean(dim=1))

model = TransformerClassifier()`;
    } else if (architecture === 'RNN') {
      modelDefinition = `class RecurrentNet(nn.Module):
    def __init__(self, input_dim=64, hidden_dim=128, num_layers=${Math.max(1, layers - 1)}):
        super(RecurrentNet, self).__init__()
        self.rnn = nn.RNN(input_dim, hidden_dim, num_layers=num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_dim, 10)

    def forward(self, x):
        out, h_n = self.rnn(x)
        return self.fc(out[:, -1, :])

model = RecurrentNet()`;
    } else {
      modelDefinition = `class NeuralNet(nn.Module):
    def __init__(self, in_features=4, hidden_dim=64, out_features=3):
        super(NeuralNet, self).__init__()
        layers = []
        curr = in_features
        for _ in range(${layers}):
            layers.append(nn.Linear(curr, hidden_dim))
            layers.append(nn.ReLU())
            curr = hidden_dim
        layers.append(nn.Linear(curr, out_features))
        self.net = nn.Sequential(*layers)

    def forward(self, x):
        return self.net(x)

model = NeuralNet()`;
    }

    return `import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

# ==========================================
# NeuralSight Export: ${architecture}
# Dataset: ${dataSource} | Task: ${useCase}
# ==========================================

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# 1. Architecture Model Definition
${modelDefinition}
model = model.to(device)

# 2. Loss & Optimization (${optimizerName}, LR=${lr})
criterion = ${criterion}
optimizer = ${optimizerStr}

# 3. Training Loop Simulation (${epochs} Epochs, Batch Size ${batchSize})
print(f"Training {model.__class__.__name__} for ${epochs} epochs...")
# for epoch in range(${epochs}):
#     for inputs, targets in dataloader:
#         inputs, targets = inputs.to(device), targets.to(device)
#         optimizer.zero_grad()
#         outputs = model(inputs)
#         loss = criterion(outputs, targets)
#         loss.backward()
#         optimizer.step()
`;
  };

  const generateKerasCode = () => {
    const lr = hyperparams.learningRate;
    const batchSize = hyperparams.batchSize;
    const epochs = hyperparams.epochs;
    const opt = hyperparams.optimizer.toLowerCase();
    const loss = hyperparams.lossFunction === 'Cross-Entropy' ? 'categorical_crossentropy' : (hyperparams.lossFunction === 'MSE' ? 'mean_squared_error' : 'huber');

    return `import tensorflow as tf
from tensorflow.keras import layers, models, optimizers

# ==========================================
# NeuralSight Export: ${architecture} (TensorFlow / Keras)
# Dataset: ${dataSource} | Task: ${useCase}
# ==========================================

model = models.Sequential([
    layers.Input(shape=(28, 28, 1)),
    layers.Conv2D(32, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')
])

model.compile(
    optimizer=optimizers.${hyperparams.optimizer}(learning_rate=${lr}),
    loss='${loss}',
    metrics=['accuracy']
)

# model.fit(x_train, y_train, epochs=${epochs}, batch_size=${batchSize})
`;
  };

  const code = framework === 'pytorch' ? generatePyTorchCode() : generateKerasCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neuralsight_${architecture.toLowerCase().replace(/\s+/g, '_')}.${framework === 'pytorch' ? 'py' : 'py'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Export Model Code</h3>
              <p className="text-xs text-slate-400">Generate native script matching your sandbox architecture</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between px-6 py-3 bg-slate-950/50 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFramework('pytorch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                framework === 'pytorch'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              PyTorch
            </button>
            <button
              onClick={() => setFramework('keras')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                framework === 'keras'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              TensorFlow / Keras
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download .py
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-slate-950/70 font-mono text-xs text-slate-300 leading-relaxed select-all">
          <pre className="whitespace-pre-wrap">{code}</pre>
        </div>
      </div>
    </div>
  );
};
