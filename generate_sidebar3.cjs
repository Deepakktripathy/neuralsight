const fs = require('fs');

let content = fs.readFileSync('v1_sidebar.txt', 'utf8');

// Add "Custom Model" to architectures
content = content.replace(
  "const architectures: Architecture[] = ['Standard NN', 'CNN', 'Transformer', 'RNN', 'DQN', 'Traditional ML', 'GAN'];",
  "const architectures: Architecture[] = ['Standard NN', 'CNN', 'Transformer', 'RNN', 'DQN', 'Traditional ML', 'GAN', 'Custom Model'];"
);

// Add customModelFile to props
content = content.replace(
  "  onPreviewDataset: (d: Dataset, file: File | null) => void;\n}",
  "  onPreviewDataset: (d: Dataset, file: File | null) => void;\n  customModelFile: File | null;\n  setCustomModelFile: (file: File | null) => void;\n}"
);

content = content.replace(
  "  onPreviewDataset,\n}) => {",
  "  onPreviewDataset,\n  customModelFile,\n  setCustomModelFile,\n}) => {"
);

// Add state and refs
const refAndHandlers = `  const modelInputRef = useRef<HTMLInputElement>(null);
  const [modelDragActive, setModelDragActive] = useState(false);

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setCustomModelFile(e.target.files[0]);
    }
  };

  const handleModelDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setModelDragActive(true);
    } else if (e.type === "dragleave") {
      setModelDragActive(false);
    }
  };

  const handleModelDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModelDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCustomModelFile(e.dataTransfer.files[0]);
    }
  };

`;

content = content.replace(
  "  const datasetsByArch",
  refAndHandlers + "  const datasetsByArch"
);

// Imports
content = content.replace(
  "import { Settings2, SlidersHorizontal, BookOpen, BrainCircuit, X, ChevronRight, Activity, Play, Square, Info } from 'lucide-react';",
  "import { Settings2, SlidersHorizontal, BookOpen, BrainCircuit, X, ChevronRight, Activity, Play, Square, Info, Upload, File as FileIcon } from 'lucide-react';"
);

// The block to insert:
const customModelBlock = `        {architecture === 'Custom Model' && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-[11px] font-medium text-slate-300">Upload Model</label>
            {!customModelFile ? (
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer",
                  modelDragActive ? "border-indigo-500 bg-indigo-500/10" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/50"
                )}
                onDragEnter={handleModelDrag}
                onDragLeave={handleModelDrag}
                onDragOver={handleModelDrag}
                onDrop={handleModelDrop}
                onClick={() => modelInputRef.current?.click()}
              >
                <input
                  ref={modelInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleModelChange}
                  accept=".onnx,.pt,.pb,.json,.tar.gz,.tgz"
                />
                <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                <p className="text-xs text-slate-400">
                  <span className="text-indigo-400 font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Supports .onnx, .pt, .pb, .tar.gz</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-1.5 bg-indigo-500/20 rounded-md shrink-0">
                    <FileIcon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-medium text-slate-200 truncate">{customModelFile.name}</span>
                    <span className="text-[10px] text-slate-500">{(customModelFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <button 
                  onClick={() => { setCustomModelFile(null); resetSimulation(); }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-md transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
`;

content = content.replace(
  `          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
                <label className="block text-[11px] font-medium text-slate-300">Dataset</label>`,
  customModelBlock + `        {architecture !== 'Custom Model' && <>\n          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
                <label className="block text-[11px] font-medium text-slate-300">Dataset</label>`
);

content = content.replace(
  "        {/* Failure Mode Sandbox - options are architecture-specific */}",
  "        </>}\n        {/* Failure Mode Sandbox - options are architecture-specific */}"
);

content = content.replace(
  "{FAILURE_MODES_BY_ARCH[architecture].map((fm) => (",
  "{(FAILURE_MODES_BY_ARCH[architecture] || []).map((fm) => ("
);

console.log('Upload Model inserted:', content.includes('Upload Model'));

fs.writeFileSync('src/v2/components/Sidebar.tsx', content);
