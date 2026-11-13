import React, { useState } from 'react';
import { Copy, Check, Terminal, Download } from 'lucide-react';
import { Architecture, Hyperparameters, UseCase, DataSource } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader className="flex-row items-center gap-2.5 pr-10">
          <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-400">
            <Terminal className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <DialogTitle>Export model code</DialogTitle>
            <DialogDescription>Generate a native script matching your sandbox architecture</DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/50 px-5 py-3">
          <Tabs value={framework} onValueChange={(value) => setFramework(value as 'pytorch' | 'keras')}>
            <TabsList className="grid w-auto grid-cols-2">
              <TabsTrigger value="pytorch">PyTorch</TabsTrigger>
              <TabsTrigger value="keras">TensorFlow / Keras</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy code'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
              <Download className="h-3.5 w-3.5" />
              Download .py
            </button>
          </div>
        </div>

        <div className="flex-1 select-all overflow-auto bg-slate-950/70 p-4 font-mono text-xs leading-relaxed text-slate-300">
          <pre className="whitespace-pre-wrap">{code}</pre>
        </div>
      </DialogContent>
    </Dialog>
  );
};
