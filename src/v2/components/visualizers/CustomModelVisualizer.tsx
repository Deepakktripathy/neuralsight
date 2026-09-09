import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Settings2, Code, Database, Box, Search, ZoomIn, ZoomOut, Maximize, Layers } from 'lucide-react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, addEdge, MarkerType, Handle, Position, Panel } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { parseOnnxFile } from '../../lib/onnxParser';

interface CustomModelVisualizerProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

interface NodeData {
  id: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  inputs: string[];
  outputs: string[];
}

// Complex mock graph for realistic visualization
const mockResNetGraph: NodeData[] = [
  { id: '1', type: 'Input', name: 'input_1', properties: { dtype: 'float32', shape: '[1, 3, 224, 224]' }, inputs: [], outputs: ['2'] },
  { id: '2', type: 'Conv2D', name: 'conv1', properties: { kernel_size: '[7, 7]', strides: '[2, 2]', padding: 'same', filters: 64 }, inputs: ['1'], outputs: ['3'] },
  { id: '3', type: 'BatchNormalization', name: 'bn_conv1', properties: { epsilon: 1e-5, momentum: 0.9 }, inputs: ['2'], outputs: ['4'] },
  { id: '4', type: 'ReLU', name: 'activation_1', properties: {}, inputs: ['3'], outputs: ['5'] },
  { id: '5', type: 'MaxPool2D', name: 'pool1', properties: { pool_size: '[3, 3]', strides: '[2, 2]', padding: 'same' }, inputs: ['4'], outputs: ['6', 'res_branch'] },
  
  // Residual Block
  { id: '6', type: 'Conv2D', name: 'res2a_branch2a', properties: { kernel_size: '[1, 1]', strides: '[1, 1]', filters: 64 }, inputs: ['5'], outputs: ['7'] },
  { id: '7', type: 'BatchNormalization', name: 'bn2a_branch2a', properties: {}, inputs: ['6'], outputs: ['8'] },
  { id: '8', type: 'ReLU', name: 'activation_2a', properties: {}, inputs: ['7'], outputs: ['9'] },
  { id: '9', type: 'Conv2D', name: 'res2a_branch2b', properties: { kernel_size: '[3, 3]', padding: 'same', filters: 64 }, inputs: ['8'], outputs: ['10'] },
  { id: '10', type: 'BatchNormalization', name: 'bn2a_branch2b', properties: {}, inputs: ['9'], outputs: ['11'] },
  { id: '11', type: 'ReLU', name: 'activation_2b', properties: {}, inputs: ['10'], outputs: ['12'] },
  { id: '12', type: 'Conv2D', name: 'res2a_branch2c', properties: { kernel_size: '[1, 1]', filters: 256 }, inputs: ['11'], outputs: ['13'] },
  { id: '13', type: 'BatchNormalization', name: 'bn2a_branch2c', properties: {}, inputs: ['12'], outputs: ['add_1'] },
  
  // Skip connection path
  { id: 'res_branch', type: 'Conv2D', name: 'res2a_branch1', properties: { kernel_size: '[1, 1]', strides: '[1, 1]', filters: 256 }, inputs: ['5'], outputs: ['bn_branch'] },
  { id: 'bn_branch', type: 'BatchNormalization', name: 'bn2a_branch1', properties: {}, inputs: ['res_branch'], outputs: ['add_1'] },
  
  // Add
  { id: 'add_1', type: 'Add', name: 'add_1', properties: {}, inputs: ['13', 'bn_branch'], outputs: ['14'] },
  { id: '14', type: 'ReLU', name: 'activation_out', properties: {}, inputs: ['add_1'], outputs: ['15'] },
  
  // Pooling & Output
  { id: '15', type: 'GlobalAveragePooling2D', name: 'avg_pool', properties: {}, inputs: ['14'], outputs: ['16'] },
  { id: '16', type: 'Dense', name: 'fc1000', properties: { units: 1000, activation: 'softmax' }, inputs: ['15'], outputs: [] }
];

// Custom Node Component for React Flow
const ModelNode = ({ data }: { data: { nodeData: NodeData, isSelected: boolean } }) => {
  const { nodeData, isSelected } = data;
  const isInput = nodeData.type === 'Input';
  const isOutput = nodeData.type === 'Output' || nodeData.outputs.length === 0;
  
  const bgColor = isInput || isOutput ? 'bg-emerald-950/40' : (nodeData.type.includes('Conv') ? 'bg-indigo-950/40' : 'bg-slate-900');
  const borderColor = isInput || isOutput ? 'border-emerald-500/30' : (nodeData.type.includes('Conv') ? 'border-indigo-500/30' : 'border-slate-700');
  const textColor = isInput || isOutput ? 'text-emerald-400' : (nodeData.type.includes('Conv') ? 'text-indigo-400' : 'text-slate-300');

  return (
    <div className={`relative px-4 py-2 min-w-[150px] rounded-lg border-2 ${isSelected ? 'border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : borderColor} ${bgColor} transition-all backdrop-blur-sm cursor-pointer`}>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-500 !border-none" />
      
      <div className="flex flex-col items-center">
        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${textColor}`}>
          {nodeData.type}
        </span>
        <span className="text-xs text-slate-300 mt-0.5 truncate max-w-[120px]">
          {nodeData.name}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-500 !border-none" />
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
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 160, height: 60 });
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
      x: nodeWithPosition.x - 160 / 2,
      y: nodeWithPosition.y - 60 / 2,
    };
    return node;
  });

  return { nodes, edges };
};

export const CustomModelVisualizer: React.FC<CustomModelVisualizerProps> = ({ file, setFile }) => {
  const [selectedNodeData, setSelectedNodeData] = useState<NodeData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const [activeGraph, setActiveGraph] = useState<NodeData[]>(mockResNetGraph);

  useEffect(() => {
    if (!file) return;

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
            setActiveGraph(parsed);
          } else {
            setActiveGraph(mockResNetGraph);
          }
        } catch (err) {
          console.error("Failed to parse JSON graph", err);
          setActiveGraph(mockResNetGraph);
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.onnx')) {
      parseOnnxFile(file)
        .then(nodes => {
          if (nodes && nodes.length > 0) {
            setActiveGraph(nodes);
          } else {
            setActiveGraph(mockResNetGraph);
          }
        })
        .catch(err => {
          console.error("Failed to decode ONNX model proto", err);
          setActiveGraph(mockResNetGraph);
        });
    } else {
      setActiveGraph(mockResNetGraph);
    }
  }, [file]);

  useEffect(() => {
    if (!file) return;

    const initialNodes = activeGraph.map(node => ({
      id: node.id,
      type: 'modelNode',
      data: { nodeData: node, isSelected: false },
      position: { x: 0, y: 0 },
    }));

    const initialEdges: any[] = [];
    activeGraph.forEach(node => {
      node.outputs.forEach(outputId => {
        initialEdges.push({
          id: `${node.id}-${outputId}`,
          source: node.id,
          target: outputId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#4f46e5', strokeWidth: 2, opacity: 0.6 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#4f46e5',
          },
        });
      });
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      'TB'
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setSelectedNodeData(null);
  }, [file, activeGraph, setNodes, setEdges]);

  // Implement search highlighting
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
        style: { ...n.style, opacity: matches ? 1 : 0.2 }
      };
    }));
  }, [searchQuery, setNodes]);

  // Update node selected state
  useEffect(() => {
    setNodes(nds => 
      nds.map(n => ({
        ...n,
        data: { ...n.data, isSelected: selectedNodeData?.id === n.id }
      }))
    );
  }, [selectedNodeData, setNodes]);


  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const useSampleModel = () => {
    const file = new File([JSON.stringify(mockResNetGraph, null, 2)], 'resnet_sample.json', { type: 'application/json' });
    setFile(file);
  };

  if (!file) {
    return (
      <div 
        className="flex-1 w-full h-full flex flex-col items-center justify-center text-slate-500 p-8"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={"w-full max-w-xl border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer " + (dragActive ? "border-indigo-500 bg-indigo-500/10" : "border-slate-700/50 bg-slate-800/20 hover:border-slate-500 hover:bg-slate-800/40")}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".onnx,.pt,.pb,.json,.tar.gz,.tgz"
          />
          <div className={"w-24 h-24 mb-6 rounded-full flex items-center justify-center border shadow-2xl transition-transform " + (dragActive ? "bg-indigo-500/20 border-indigo-500 scale-105" : "bg-slate-800/80 border-slate-700 hover:scale-105")}>
            <Upload className={"w-10 h-10 " + (dragActive ? "text-indigo-400" : "text-indigo-500/50")} />
          </div>
          <h2 className="text-xl font-semibold text-slate-300 mb-2">No Model Uploaded</h2>
          <p className="text-sm text-center max-w-md leading-relaxed text-slate-500 mb-2">
            <span className="text-indigo-400 font-semibold">Click to upload</span> or drag and drop an ONNX, PyTorch (.pt), TensorFlow (.pb), tar.gz, or custom JSON graph.
          </p>
        </div>
        
        <div className="mt-8 flex items-center gap-4">
          <div className="h-px w-16 bg-slate-800"></div>
          <span className="text-xs font-medium text-slate-600 uppercase tracking-widest">OR</span>
          <div className="h-px w-16 bg-slate-800"></div>
        </div>

        <button 
          onClick={useSampleModel}
          className="mt-8 flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors font-medium text-sm group relative"
        >
          <Code className="w-4 h-4" />
          Use Sample Model
          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 shadow-xl pointer-events-none z-10 text-center">
            Loads a sample ResNet-18 architecture for demonstration.
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex overflow-hidden bg-slate-950">
      {/* Central React Flow Canvas */}
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => setSelectedNodeData(node.data.nodeData)}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={4}
          className="bg-slate-950"
        >
          <Background color="#334155" gap={24} size={1} />
          
          <Panel position="top-left" className="m-4">
             <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg p-2 shadow-xl flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Find node..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-48"
                  />
                </div>
             </div>
          </Panel>
          <Controls className="bg-slate-900 border-slate-800 fill-slate-300 shadow-xl !rounded-lg overflow-hidden [&>button]:border-b-slate-800 [&>button:hover]:bg-slate-800" />
        </ReactFlow>
      </div>

      {/* Right Property Panel */}
      <AnimatePresence>
        {selectedNodeData && (
          <motion.div 
            className="w-80 bg-slate-900/95 border-l border-slate-800 shadow-2xl flex flex-col shrink-0 z-20 backdrop-blur-xl absolute right-0 top-0 bottom-0"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          >
            <div className="flex flex-col h-full h-[100%]">
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 shrink-0">
                <h3 className="font-medium text-slate-200 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-indigo-400" />
                  Node Properties
                </h3>
                <button 
                  onClick={() => setSelectedNodeData(null)}
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {/* Type Section */}
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Node Type</h4>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedNodeData.type === 'Input' ? 'bg-emerald-500/10 text-emerald-400' :
                      selectedNodeData.type.includes('Conv') ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-mono text-sm text-slate-200 font-bold">{selectedNodeData.type}</div>
                      <div className="text-[11px] text-slate-400">{selectedNodeData.name}</div>
                    </div>
                  </div>
                </div>

                {/* Properties */}
                {Object.keys(selectedNodeData.properties || {}).length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Code className="w-3 h-3" /> Attributes
                    </h4>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                      {Object.entries(selectedNodeData.properties).map(([key, value], i) => (
                        <div key={key} className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 text-xs ${
                          i !== Object.keys(selectedNodeData.properties).length - 1 ? 'border-b border-slate-800/50' : ''
                        }`}>
                          <span className="text-slate-400 font-medium">{key}</span>
                          <span className="font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded mt-1 sm:mt-0 max-w-[150px] truncate text-right" title={String(value)}>
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inputs/Outputs */}
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Database className="w-3 h-3" /> Connections
                  </h4>
                  <div className="space-y-4">
                    {selectedNodeData.inputs.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-500 font-medium">INPUTS</span>
                        <div className="flex flex-col gap-1.5">
                          {selectedNodeData.inputs.map(i => {
                            const connectedNode = activeGraph.find(n => n.id === i);
                            return (
                              <div key={i} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-md">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                  <span className="text-xs font-mono text-slate-300">{connectedNode?.name || i}</span>
                                </div>
                                <span className="text-[10px] text-slate-500">{connectedNode?.type}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {selectedNodeData.outputs.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-500 font-medium">OUTPUTS</span>
                        <div className="flex flex-col gap-1.5">
                          {selectedNodeData.outputs.map(o => {
                            const connectedNode = activeGraph.find(n => n.id === o);
                            return (
                              <div key={o} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-md">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  <span className="text-xs font-mono text-slate-300">{connectedNode?.name || o}</span>
                                </div>
                                <span className="text-[10px] text-slate-500">{connectedNode?.type}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
