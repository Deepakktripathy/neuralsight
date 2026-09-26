import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, X, Settings2, Code, Database, Box, Search, 
  Layers, Plus, Trash2, Cpu, RotateCcw, Copy, Check, Sliders, ChevronDown,
  ArrowLeft, ArrowRight, UploadCloud, Sparkles, AlertCircle
} from 'lucide-react';
import { 
  ReactFlow, Controls, Background, useNodesState, useEdgesState, 
  MarkerType, Handle, Position, Panel 
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { parseOnnxFile } from '../../lib/onnxParser';
import { ExportInstructions } from './ExportInstructions';

interface CustomModelVisualizerProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

export interface NodeData {
  id: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  inputs: string[];
  outputs: string[];
}

// Preset Architectures
export const PRESET_TEMPLATES: Record<string, { name: string; description: string; graph: NodeData[] }> = {
  mlp: {
    name: 'Dense Classifier (MLP)',
    description: 'Multi-layer perceptron for tabular & flattened image classification',
    graph: [
      { id: '1', type: 'Input', name: 'input_tensor', properties: { shape: '[B, 784]', dtype: 'float32' }, inputs: [], outputs: ['2'] },
      { id: '2', type: 'Dense', name: 'dense_1', properties: { units: 128, activation: 'ReLU' }, inputs: ['1'], outputs: ['3'] },
      { id: '3', type: 'Dropout', name: 'dropout_1', properties: { rate: 0.2 }, inputs: ['2'], outputs: ['4'] },
      { id: '4', type: 'Dense', name: 'dense_2', properties: { units: 64, activation: 'ReLU' }, inputs: ['3'], outputs: ['5'] },
      { id: '5', type: 'Dense', name: 'output_logits', properties: { units: 10, activation: 'Softmax' }, inputs: ['4'], outputs: [] },
    ]
  },
  convnet: {
    name: 'Mini-ConvNet (LeNet-style)',
    description: 'Convolutional feature extractor with pooling and dense head',
    graph: [
      { id: '1', type: 'Input', name: 'input_image', properties: { shape: '[B, 1, 28, 28]', dtype: 'float32' }, inputs: [], outputs: ['2'] },
      { id: '2', type: 'Conv2D', name: 'conv2d_1', properties: { filters: 32, kernel_size: '3x3', strides: '1x1', activation: 'ReLU' }, inputs: ['1'], outputs: ['3'] },
      { id: '3', type: 'MaxPool2D', name: 'maxpool_1', properties: { pool_size: '2x2', strides: '2x2' }, inputs: ['2'], outputs: ['4'] },
      { id: '4', type: 'Conv2D', name: 'conv2d_2', properties: { filters: 64, kernel_size: '3x3', strides: '1x1', activation: 'ReLU' }, inputs: ['3'], outputs: ['5'] },
      { id: '5', type: 'MaxPool2D', name: 'maxpool_2', properties: { pool_size: '2x2', strides: '2x2' }, inputs: ['4'], outputs: ['6'] },
      { id: '6', type: 'GlobalAveragePooling2D', name: 'gap', properties: {}, inputs: ['5'], outputs: ['7'] },
      { id: '7', type: 'Dense', name: 'dense_classifier', properties: { units: 10, activation: 'Softmax' }, inputs: ['6'], outputs: [] },
    ]
  },
  resnet: {
    name: 'ResNet Residual Block',
    description: 'Convolutional block with skip identity connection to avoid vanishing gradients',
    graph: [
      { id: '1', type: 'Input', name: 'input_tensor', properties: { shape: '[B, 64, 56, 56]', dtype: 'float32' }, inputs: [], outputs: ['2', 'skip_branch'] },
      { id: '2', type: 'Conv2D', name: 'res_conv1', properties: { filters: 64, kernel_size: '3x3', strides: '1x1', activation: 'ReLU' }, inputs: ['1'], outputs: ['3'] },
      { id: '3', type: 'BatchNormalization', name: 'res_bn1', properties: { momentum: 0.9 }, inputs: ['2'], outputs: ['4'] },
      { id: '4', type: 'Conv2D', name: 'res_conv2', properties: { filters: 64, kernel_size: '3x3', strides: '1x1', activation: 'Linear' }, inputs: ['3'], outputs: ['add_node'] },
      { id: 'skip_branch', type: 'Identity', name: 'residual_shortcut', properties: {}, inputs: ['1'], outputs: ['add_node'] },
      { id: 'add_node', type: 'Add', name: 'skip_add', properties: {}, inputs: ['4', 'skip_branch'], outputs: ['out_relu'] },
      { id: 'out_relu', type: 'ReLU', name: 'post_activation', properties: {}, inputs: ['add_node'], outputs: ['dense_out'] },
      { id: 'dense_out', type: 'Dense', name: 'fc_head', properties: { units: 1000, activation: 'Softmax' }, inputs: ['out_relu'], outputs: [] }
    ]
  }
};

// Parameter Estimator
export const estimateLayerParams = (node: NodeData, prevNode?: NodeData): number => {
  const type = node.type;
  const props = node.properties || {};

  if (type === 'Dense') {
    const units = Number(props.units) || 64;
    let inFeatures = 128;
    if (prevNode) {
      if (prevNode.type === 'Dense') inFeatures = Number(prevNode.properties?.units) || 128;
      else if (prevNode.type === 'Conv2D') inFeatures = Number(prevNode.properties?.filters) || 64;
      else if (prevNode.type === 'Input') {
        const shapeStr = String(prevNode.properties?.shape || '');
        const match = shapeStr.match(/\d+/g);
        if (match && match.length > 1) inFeatures = Number(match[match.length - 1]);
      }
    }
    return (inFeatures * units) + units; // weights + biases
  }

  if (type === 'Conv2D') {
    const filters = Number(props.filters) || 32;
    let inChannels = 3;
    if (prevNode) {
      if (prevNode.type === 'Conv2D') inChannels = Number(prevNode.properties?.filters) || 32;
      else if (prevNode.type === 'Input') {
        const shapeStr = String(prevNode.properties?.shape || '');
        const match = shapeStr.match(/\d+/g);
        if (match && match.length > 2) inChannels = Number(match[1]); // e.g. [B, C, H, W]
      }
    }
    // Parse kernel size: '3x3' or 3
    let k = 3;
    if (typeof props.kernel_size === 'string' && props.kernel_size.includes('x')) {
      k = Number(props.kernel_size.split('x')[0]) || 3;
    } else if (typeof props.kernel_size === 'number') {
      k = props.kernel_size;
    }
    return (k * k * inChannels * filters) + filters; // W + b
  }

  if (type === 'BatchNormalization' || type === 'LayerNorm') {
    let channels = 64;
    if (prevNode) {
      if (prevNode.type === 'Conv2D') channels = Number(prevNode.properties?.filters) || 64;
      else if (prevNode.type === 'Dense') channels = Number(prevNode.properties?.units) || 64;
    }
    return channels * 2; // gamma + beta
  }

  return 0;
};

// Calculate Total Model Parameters
export const calculateTotalParams = (graph: NodeData[]): number => {
  let total = 0;
  const nodeMap = new Map<string, NodeData>();
  graph.forEach(n => nodeMap.set(n.id, n));

  graph.forEach(node => {
    const prevId = node.inputs[0];
    const prevNode = prevId ? nodeMap.get(prevId) : undefined;
    total += estimateLayerParams(node, prevNode);
  });
  return total;
};

// Custom Node Component for React Flow
const ModelNode = ({ data }: { data: { nodeData: NodeData; isSelected: boolean; paramsCount?: number } }) => {
  const { nodeData, isSelected, paramsCount } = data;
  const isInput = nodeData.type === 'Input';
  const isOutput = nodeData.type === 'Output' || nodeData.outputs.length === 0;
  
  const bgColor = isInput || isOutput 
    ? 'bg-emerald-950/50' 
    : (nodeData.type.includes('Conv') ? 'bg-indigo-950/50' : (nodeData.type === 'Dense' ? 'bg-violet-950/50' : 'bg-slate-900/90'));
  
  const borderColor = isInput || isOutput 
    ? 'border-emerald-500/40' 
    : (nodeData.type.includes('Conv') ? 'border-indigo-500/40' : (nodeData.type === 'Dense' ? 'border-violet-500/40' : 'border-slate-700/70'));
  
  const textColor = isInput || isOutput 
    ? 'text-emerald-400' 
    : (nodeData.type.includes('Conv') ? 'text-indigo-400' : (nodeData.type === 'Dense' ? 'text-violet-400' : 'text-slate-300'));

  const detailBadge = useMemo(() => {
    if (nodeData.type === 'Dense') return `${nodeData.properties.units || 64} neurons`;
    if (nodeData.type === 'Conv2D') return `${nodeData.properties.filters || 32} filters`;
    if (nodeData.type === 'Dropout') return `rate: ${nodeData.properties.rate || 0.2}`;
    if (nodeData.type === 'Input') return nodeData.properties.shape || 'Tensor';
    return nodeData.properties.activation || '';
  }, [nodeData]);

  return (
    <div className={`relative px-3.5 py-2 min-w-[155px] rounded-xl border-2 ${
      isSelected ? 'border-indigo-400 ring-2 ring-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.35)] scale-105' : borderColor
    } ${bgColor} transition-all duration-150 backdrop-blur-md cursor-pointer hover:border-indigo-400/60 shadow-lg`}>
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-indigo-400 !border-none" />
      
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${textColor}`}>
            {nodeData.type}
          </span>
          {paramsCount !== undefined && paramsCount > 0 && (
            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {paramsCount > 1000 ? `${(paramsCount / 1000).toFixed(1)}k` : paramsCount}p
            </span>
          )}
        </div>

        <span className="text-xs font-medium text-slate-200 truncate max-w-[130px]">
          {nodeData.name}
        </span>

        {detailBadge && (
          <span className="text-[9.5px] font-mono text-slate-400 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800 mt-0.5">
            {detailBadge}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-indigo-400 !border-none" />
    </div>
  );
};

const nodeTypes = {
  modelNode: ModelNode,
};

// Layout function using Dagre
const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 75 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 170, height: 75 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    node.position = {
      x: nodeWithPosition.x - 170 / 2,
      y: nodeWithPosition.y - 75 / 2,
    };
    return node;
  });

  return { nodes, edges };
};

export const CustomModelVisualizer: React.FC<CustomModelVisualizerProps> = ({ file, setFile }) => {
  const [activeGraph, setActiveGraph] = useState<NodeData[]>(PRESET_TEMPLATES.mlp.graph);
  const [activeTemplateKey, setActiveTemplateKey] = useState<string>('mlp');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('2');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);

  // Landing page view state: false shows the original landing page, true shows the updated interactive UI
  const [isViewingModel, setIsViewingModel] = useState<boolean>(Boolean(file));
  const [isParsing, setIsParsing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [landingDragActive, setLandingDragActive] = useState(false);
  const landingFileInputRef = useRef<HTMLInputElement>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Selected node object reference
  const selectedNodeData = useMemo(() => {
    return activeGraph.find(n => n.id === selectedNodeId) || null;
  }, [activeGraph, selectedNodeId]);

  // Total trainable parameters count
  const totalParams = useMemo(() => {
    return calculateTotalParams(activeGraph);
  }, [activeGraph]);

  // Sync external file if uploaded
  useEffect(() => {
    if (!file) {
      if (activeTemplateKey === 'custom') {
        setIsViewingModel(false);
      }
      return;
    }

    setIsParsing(true);
    setUploadError(null);

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
            setActiveGraph(parsed);
            setSelectedNodeId(parsed[0].id);
            setActiveTemplateKey('custom');
            setIsViewingModel(true);
          } else {
            setUploadError("Invalid JSON structure: Expected an array of graph nodes with 'id' fields.");
          }
        } catch (err: any) {
          console.error("Failed to parse JSON graph", err);
          setUploadError(`Failed to parse JSON: ${err?.message || 'Syntax error'}`);
        } finally {
          setIsParsing(false);
        }
      };
      reader.onerror = () => {
        setUploadError("Could not read file from disk.");
        setIsParsing(false);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.onnx')) {
      parseOnnxFile(file)
        .then(parsedNodes => {
          if (parsedNodes && parsedNodes.length > 0) {
            setActiveGraph(parsedNodes);
            setSelectedNodeId(parsedNodes[0].id);
            setActiveTemplateKey('custom');
            setIsViewingModel(true);
          } else {
            setUploadError("ONNX file did not contain any parseable computational nodes.");
          }
        })
        .catch(err => {
          console.error("Failed to decode ONNX model proto", err);
          setUploadError("Failed to decode ONNX model protobuf. Ensure it is a valid ONNX graph.");
        })
        .finally(() => {
          setIsParsing(false);
        });
    } else {
      setUploadError("Unsupported file type. Please upload a .onnx or .json file.");
      setIsParsing(false);
    }
  }, [file]);

  // Rebuild React Flow nodes & edges whenever activeGraph changes
  useEffect(() => {
    const nodeMap = new Map<string, NodeData>();
    activeGraph.forEach(n => nodeMap.set(n.id, n));

    const initialNodes = activeGraph.map(node => {
      const prevId = node.inputs[0];
      const prevNode = prevId ? nodeMap.get(prevId) : undefined;
      const paramsCount = estimateLayerParams(node, prevNode);

      return {
        id: node.id,
        type: 'modelNode',
        data: { 
          nodeData: node, 
          isSelected: node.id === selectedNodeId,
          paramsCount 
        },
        position: { x: 0, y: 0 },
      };
    });

    const initialEdges: any[] = [];
    activeGraph.forEach(node => {
      node.outputs.forEach(outputId => {
        // verify target exists
        if (nodeMap.has(outputId)) {
          initialEdges.push({
            id: `${node.id}-${outputId}`,
            source: node.id,
            target: outputId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2, opacity: 0.7 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#6366f1',
            },
          });
        }
      });
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      'TB'
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [activeGraph, selectedNodeId, setNodes, setEdges]);

  // Search highlighting
  useEffect(() => {
    if (!searchQuery) {
      setNodes(nds => nds.map(n => ({ ...n, style: { ...n.style, opacity: 1 } })));
      return;
    }
    
    const query = searchQuery.toLowerCase();
    setNodes(nds => nds.map(n => {
      const nodeData = n.data.nodeData as NodeData;
      const matches = nodeData.name.toLowerCase().includes(query) || nodeData.type.toLowerCase().includes(query);
      return {
        ...n,
        style: { ...n.style, opacity: matches ? 1 : 0.25 }
      };
    }));
  }, [searchQuery, setNodes]);

  // Topology Mutator: Add Layer
  const handleAddLayer = (type: string) => {
    setIsAddMenuOpen(false);
    const newId = `node_${Date.now()}`;
    const targetAfterId = selectedNodeId || activeGraph[activeGraph.length - 1]?.id;

    // Default layer properties
    const defaultProps: Record<string, any> = {};
    if (type === 'Dense') {
      defaultProps.units = 64;
      defaultProps.activation = 'ReLU';
    } else if (type === 'Conv2D') {
      defaultProps.filters = 32;
      defaultProps.kernel_size = '3x3';
      defaultProps.strides = '1x1';
      defaultProps.activation = 'ReLU';
    } else if (type === 'MaxPool2D') {
      defaultProps.pool_size = '2x2';
      defaultProps.strides = '2x2';
    } else if (type === 'Dropout') {
      defaultProps.rate = 0.25;
    } else if (type === 'BatchNormalization') {
      defaultProps.momentum = 0.9;
    } else if (type === 'ReLU' || type === 'GELU' || type === 'Softmax') {
      // standard activation
    }

    const newNode: NodeData = {
      id: newId,
      type,
      name: `${type.toLowerCase()}_${activeGraph.length + 1}`,
      properties: defaultProps,
      inputs: targetAfterId ? [targetAfterId] : [],
      outputs: []
    };

    setActiveGraph(prev => {
      if (!targetAfterId) return [...prev, newNode];

      const targetIdx = prev.findIndex(n => n.id === targetAfterId);
      if (targetIdx === -1) return [...prev, newNode];

      const targetNode = prev[targetIdx];
      const oldOutputs = [...targetNode.outputs];

      // New node adopts target's old outputs
      newNode.outputs = oldOutputs;

      // Target node now outputs to new node
      const updatedTarget = { ...targetNode, outputs: [newId] };

      // Old target's children now take new node as input
      const updatedChildren = prev.map((n, idx) => {
        if (idx === targetIdx) return updatedTarget;
        if (oldOutputs.includes(n.id)) {
          return {
            ...n,
            inputs: n.inputs.map(inId => inId === targetAfterId ? newId : inId)
          };
        }
        return n;
      });

      // Insert new node immediately after target
      const result = [...updatedChildren];
      result.splice(targetIdx + 1, 0, newNode);
      return result;
    });

    setSelectedNodeId(newId);
  };

  // Topology Mutator: Remove Layer
  const handleRemoveLayer = (nodeId: string) => {
    const target = activeGraph.find(n => n.id === nodeId);
    if (!target) return;

    // Don't delete the only remaining node
    if (activeGraph.length <= 1) return;

    setActiveGraph(prev => {
      const inputs = target.inputs;
      const outputs = target.outputs;

      return prev
        .filter(n => n.id !== nodeId)
        .map(n => {
          let newInputs = [...n.inputs];
          let newOutputs = [...n.outputs];

          // If this node took the deleted node as input, bridge it to the deleted node's inputs
          if (newInputs.includes(nodeId)) {
            newInputs = newInputs.filter(id => id !== nodeId);
            inputs.forEach(inId => {
              if (!newInputs.includes(inId)) newInputs.push(inId);
            });
          }

          // If this node outputted to the deleted node, bridge it to the deleted node's outputs
          if (newOutputs.includes(nodeId)) {
            newOutputs = newOutputs.filter(id => id !== nodeId);
            outputs.forEach(outId => {
              if (!newOutputs.includes(outId)) newOutputs.push(outId);
            });
          }

          return { ...n, inputs: newInputs, outputs: newOutputs };
        });
    });

    // Reset selected node to previous or remaining node
    setSelectedNodeId(target.inputs[0] || activeGraph[0]?.id || null);
  };

  // Topology Mutator: Update Node Property
  const handleUpdateProperty = (propertyKey: string, val: any) => {
    if (!selectedNodeId) return;

    setActiveGraph(prev => prev.map(node => {
      if (node.id === selectedNodeId) {
        return {
          ...node,
          properties: {
            ...node.properties,
            [propertyKey]: val
          }
        };
      }
      return node;
    }));
  };

  // Switch Preset Template
  const handleSelectTemplate = (key: string) => {
    setIsPresetMenuOpen(false);
    const tmpl = PRESET_TEMPLATES[key];
    if (!tmpl) return;
    setActiveTemplateKey(key);
    setActiveGraph(tmpl.graph);
    setSelectedNodeId(tmpl.graph[1]?.id || tmpl.graph[0]?.id);
    setIsViewingModel(true);
    setUploadError(null);
    setFile(null);
  };

  // Export PyTorch Code Representation
  const generatePyTorchCode = () => {
    let layersCode = '';
    activeGraph.forEach(n => {
      if (n.type === 'Dense') {
        const units = n.properties.units || 64;
        layersCode += `        nn.Linear(..., ${units}),\n`;
        if (n.properties.activation === 'ReLU') layersCode += `        nn.ReLU(),\n`;
        else if (n.properties.activation === 'GELU') layersCode += `        nn.GELU(),\n`;
        else if (n.properties.activation === 'Sigmoid') layersCode += `        nn.Sigmoid(),\n`;
      } else if (n.type === 'Conv2D') {
        const filters = n.properties.filters || 32;
        layersCode += `        nn.Conv2d(in_channels=..., out_channels=${filters}, kernel_size=3, padding=1),\n`;
        layersCode += `        nn.ReLU(),\n`;
      } else if (n.type === 'MaxPool2D') {
        layersCode += `        nn.MaxPool2d(kernel_size=2, stride=2),\n`;
      } else if (n.type === 'Dropout') {
        layersCode += `        nn.Dropout(p=${n.properties.rate || 0.2}),\n`;
      } else if (n.type === 'BatchNormalization') {
        layersCode += `        nn.BatchNorm2d(...),\n`;
      }
    });

    return `import torch\nimport torch.nn as nn\n\nclass CustomNetwork(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.network = nn.Sequential(\n${layersCode}        )\n\n    def forward(self, x):\n        return self.network(x)\n\n# Total Parameters: ~${totalParams.toLocaleString()}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(generatePyTorchCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeGraph, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `custom_model_${activeTemplateKey}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Drag & drop file upload handling for toolbar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Landing page drag & drop handlers
  const handleLandingFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLandingDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleLandingFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Landing Page: Shown initially until the user decides to upload or select a template
  if (!isViewingModel) {
    return (
      <div className="w-full h-full overflow-y-auto bg-slate-950 font-sans p-6 md:p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header / Hero */}
          <div className="text-center space-y-3 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Custom Neural Network Explorer</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Custom Model Architecture Visualizer
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Upload your own ONNX or JSON model to explore layer tensor shapes, activations, and parameter connections, or choose a pre-configured architecture template below.
            </p>
          </div>

          {/* Error Banner if any */}
          {uploadError && (
            <div className="max-w-2xl mx-auto bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <div className="flex-1">{uploadError}</div>
              <button 
                onClick={() => setUploadError(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Main Upload Dropzone */}
          <div className="max-w-2xl mx-auto">
            <input 
              type="file" 
              ref={landingFileInputRef} 
              className="hidden" 
              accept=".onnx,.json" 
              onChange={handleLandingFileInput} 
            />
            <div 
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setLandingDragActive(true); }}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setLandingDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setLandingDragActive(false); }}
              onDrop={handleLandingFileDrop}
              onClick={() => landingFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 md:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                landingDragActive 
                  ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01] shadow-xl shadow-indigo-500/10' 
                  : 'border-slate-700 hover:border-indigo-500/60 bg-slate-900/60 hover:bg-slate-900 shadow-lg'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                {isParsing ? (
                  <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-1">
                {isParsing ? 'Parsing model graph...' : 'Drop your model file here, or click to browse'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Supports real-world <span className="text-indigo-400 font-mono">.onnx</span> files exported from PyTorch, TensorFlow, or JAX, and custom <span className="text-indigo-400 font-mono">.json</span> graphs.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select Model File</span>
                </button>
              </div>
            </div>
          </div>

          {/* Premade Templates Section */}
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Or explore pre-made templates
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a classic neural network architecture to immediately inspect its computation graph
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(PRESET_TEMPLATES).map(([key, tmpl]) => {
                const paramCount = calculateTotalParams(tmpl.graph);
                return (
                  <div
                    key={key}
                    onClick={() => handleSelectTemplate(key)}
                    className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {key === 'mlp' ? 'Feedforward' : key === 'convnet' ? 'Vision' : 'Residual'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {tmpl.graph.length} layers
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {tmpl.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                        <span>~{paramCount.toLocaleString()} params</span>
                      </div>
                      <span className="text-xs font-medium text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Instructions Component */}
          <div className="max-w-2xl mx-auto pt-2 pb-6">
            <ExportInstructions />
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex overflow-hidden bg-slate-950 font-sans">
      {/* Central Interactive Graph Workspace */}
      <div className="flex-1 h-full relative flex flex-col min-w-0">
        
        {/* Top Control Bar: Topology Presets, Add Layer, and Computational Metrics */}
        <div className="h-13 bg-slate-900/90 border-b border-slate-800/90 px-4 flex items-center justify-between gap-3 z-10 backdrop-blur-md shrink-0">
          
          {/* Left: Back button, Template Switcher & Add Layer Button */}
          <div className="flex items-center gap-2">
            {/* Back to Landing Page Button */}
            <button
              onClick={() => {
                setIsViewingModel(false);
                setFile(null);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white transition-colors mr-1"
              title="Return to custom model landing page & templates"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Back</span>
            </button>
            
            {/* Template Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsPresetMenuOpen(!isPresetMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Select model topology template"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span className="max-w-[140px] truncate">
                  {PRESET_TEMPLATES[activeTemplateKey]?.name || 'Custom Model'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isPresetMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Topology Templates
                  </div>
                  {Object.entries(PRESET_TEMPLATES).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => handleSelectTemplate(key)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col ${
                        activeTemplateKey === key 
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-semibold">{t.name}</span>
                      <span className="text-[10px] text-slate-400 leading-tight mt-0.5">{t.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* + Add Layer Button */}
            <div className="relative">
              <button
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-colors"
                title="Add a new layer to the computational graph"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Layer</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {isAddMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Insert Layer After Active Node
                  </div>
                  {[
                    { type: 'Dense', label: 'Dense (Linear)', desc: 'Fully-connected layer' },
                    { type: 'Conv2D', label: 'Conv2D', desc: 'Spatial feature convolution' },
                    { type: 'MaxPool2D', label: 'MaxPool2D', desc: 'Spatial downsampling' },
                    { type: 'BatchNormalization', label: 'BatchNorm', desc: 'Stabilize activations' },
                    { type: 'Dropout', label: 'Dropout', desc: 'Regularization mask' },
                    { type: 'ReLU', label: 'ReLU', desc: 'Activation function' },
                    { type: 'GELU', label: 'GELU', desc: 'Gaussian error linear unit' }
                  ].map(l => (
                    <button
                      key={l.type}
                      onClick={() => handleAddLayer(l.type)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium">{l.label}</span>
                      <span className="text-[9px] text-slate-500">{l.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Upload or Re-upload */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".onnx,.json" 
              onChange={handleFileUpload} 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
              title="Upload existing ONNX or JSON architecture"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Metrics & Code Export */}
          <div className="flex items-center gap-3">
            
            {/* Live Parameter Evaluation Badge */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400 text-[10.5px]">Parameters:</span>
              <span className="text-emerald-400 font-bold">
                {totalParams > 0 ? totalParams.toLocaleString() : 'Computed dynamically'}
              </span>
              <span className="text-slate-500 text-[10px]">({activeGraph.length} nodes)</span>
            </div>

            {/* Export Code / JSON */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                title="Copy generated PyTorch nn.Module code"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Code className="w-3 h-3 text-indigo-400" />}
                <span>{copiedCode ? 'Copied' : 'PyTorch'}</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                title="Export architecture as JSON graph"
              >
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* React Flow Diagram Canvas */}
        <div className="flex-1 relative w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={3.5}
            className="bg-slate-950"
          >
            <Background color="#334155" gap={24} size={1} opacity={0.3} />
            
            {/* Search Filter Panel */}
            <Panel position="top-left" className="m-3">
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-xl flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Search layer name or type..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-52"
                  />
                </div>
              </div>
            </Panel>

            <Controls className="bg-slate-900 border-slate-800 fill-slate-300 shadow-xl !rounded-xl overflow-hidden [&>button]:border-b-slate-800 [&>button:hover]:bg-slate-800" />
          </ReactFlow>
        </div>
      </div>

      {/* Right Property & Layer Editor Drawer */}
      <AnimatePresence>
        {selectedNodeData && (
          <motion.div 
            className="w-80 bg-slate-900/95 border-l border-slate-800 shadow-2xl flex flex-col shrink-0 z-20 backdrop-blur-xl absolute right-0 top-0 bottom-0"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
          >
            <div className="flex flex-col h-full">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 shrink-0">
                <h3 className="font-semibold text-xs text-slate-200 flex items-center gap-2 uppercase tracking-wide">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  Layer Architect & Inspector
                </h3>
                <button 
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                  title="Close inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                
                {/* Node Identity Card */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${
                      selectedNodeData.type === 'Input' ? 'bg-emerald-500/10 text-emerald-400' :
                      selectedNodeData.type.includes('Conv') ? 'bg-indigo-500/10 text-indigo-400' : 
                      selectedNodeData.type === 'Dense' ? 'bg-violet-500/10 text-violet-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      <Box className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-mono text-xs text-slate-200 font-bold">{selectedNodeData.type}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{selectedNodeData.name}</div>
                    </div>
                  </div>

                  {/* Remove Layer Button */}
                  {selectedNodeData.type !== 'Input' && (
                    <button
                      onClick={() => handleRemoveLayer(selectedNodeData.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                      title="Delete layer and auto-bridge connections"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Interactive Hyperparameters / Properties Editor */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Settings2 className="w-3 h-3" /> Configurable Layer Attributes
                  </h4>

                  {/* Dense Layer Units */}
                  {selectedNodeData.type === 'Dense' && (
                    <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-medium">Neuron Units</span>
                        <span className="font-mono text-indigo-400 font-bold">{selectedNodeData.properties.units || 64}</span>
                      </div>
                      <input 
                        type="range"
                        min={4}
                        max={512}
                        step={4}
                        value={selectedNodeData.properties.units || 64}
                        onChange={e => handleUpdateProperty('units', Number(e.target.value))}
                        className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-slate-500">
                        <span>4</span>
                        <span>128</span>
                        <span>256</span>
                        <span>512</span>
                      </div>
                    </div>
                  )}

                  {/* Conv2D Filters */}
                  {selectedNodeData.type === 'Conv2D' && (
                    <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-medium">Filter Count</span>
                        <span className="font-mono text-indigo-400 font-bold">{selectedNodeData.properties.filters || 32}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 mt-1">
                        {[16, 32, 64, 128].map(f => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => handleUpdateProperty('filters', f)}
                            className={`py-1 text-[10px] font-mono rounded border transition-colors ${
                              (selectedNodeData.properties.filters || 32) === f
                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                                : 'border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activation Selector */}
                  {(selectedNodeData.type === 'Dense' || selectedNodeData.type === 'Conv2D') && (
                    <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <label className="text-xs text-slate-300 font-medium block">
                        Activation Function
                      </label>
                      <select
                        value={selectedNodeData.properties.activation || 'ReLU'}
                        onChange={e => handleUpdateProperty('activation', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="ReLU">ReLU</option>
                        <option value="GELU">GELU</option>
                        <option value="Sigmoid">Sigmoid</option>
                        <option value="Tanh">Tanh</option>
                        <option value="Softmax">Softmax</option>
                        <option value="Linear">Linear (None)</option>
                      </select>
                    </div>
                  )}

                  {/* Dropout Rate */}
                  {selectedNodeData.type === 'Dropout' && (
                    <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-medium">Drop Probability</span>
                        <span className="font-mono text-indigo-400 font-bold">{selectedNodeData.properties.rate || 0.2}</span>
                      </div>
                      <input 
                        type="range"
                        min={0.05}
                        max={0.8}
                        step={0.05}
                        value={selectedNodeData.properties.rate || 0.2}
                        onChange={e => handleUpdateProperty('rate', Number(e.target.value))}
                        className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Generic Attributes Table */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    {Object.entries(selectedNodeData.properties || {}).map(([key, value], i, arr) => (
                      <div key={key} className={`flex items-center justify-between p-2.5 text-xs ${
                        i !== arr.length - 1 ? 'border-b border-slate-800/60' : ''
                      }`}>
                        <span className="text-slate-400 font-medium">{key}</span>
                        <span className="font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded max-w-[140px] truncate text-right">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Graph Connections */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Database className="w-3 h-3" /> Graph Connectivity
                  </h4>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block mb-1">INPUT EDGES:</span>
                      {selectedNodeData.inputs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedNodeData.inputs.map(inId => {
                            const n = activeGraph.find(node => node.id === inId);
                            return (
                              <button
                                key={inId}
                                onClick={() => setSelectedNodeId(inId)}
                                className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md font-mono text-[11px] text-indigo-300 flex items-center gap-1"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                {n?.name || inId}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Root tensor / No incoming edges</span>
                      )}
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] text-slate-500 font-medium block mb-1">OUTPUT EDGES:</span>
                      {selectedNodeData.outputs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedNodeData.outputs.map(outId => {
                            const n = activeGraph.find(node => node.id === outId);
                            return (
                              <button
                                key={outId}
                                onClick={() => setSelectedNodeId(outId)}
                                className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md font-mono text-[11px] text-emerald-300 flex items-center gap-1"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {n?.name || outId}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Leaf node / Model prediction output</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Add Layer After Current Node */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 font-medium block mb-2">QUICK INSERT AFTER:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleAddLayer('Dense')}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-indigo-400" /> + Dense
                    </button>
                    <button
                      onClick={() => handleAddLayer('Dropout')}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-indigo-400" /> + Dropout
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
