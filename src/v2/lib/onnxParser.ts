import { onnx } from 'onnx-proto';

export interface NodeData {
  id: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  inputs: string[];
  outputs: string[];
}

export async function parseOnnxFile(file: File): Promise<NodeData[]> {
  const buffer = await file.arrayBuffer();
  const modelProto = onnx.ModelProto.decode(new Uint8Array(buffer));
  const graph = modelProto.graph;

  if (!graph) return [];

  const parsedNodes: NodeData[] = [];
  const tensorSourceMap = new Map<string, string>();

  if (graph.input) {
    graph.input.forEach((input, index) => {
      parsedNodes.push({
        id: input.name || `input_${index}`,
        type: 'Input',
        name: input.name || 'Input',
        properties: {},
        inputs: [],
        outputs: []
      });
    });
  }

  if (graph.node) {
    graph.node.forEach((node, index) => {
      const properties: Record<string, any> = {};
      
      if (node.attribute) {
        node.attribute.forEach(attr => {
          if (attr.name) {
            if (attr.f !== undefined && attr.f !== 0) properties[attr.name] = attr.f;
            else if (attr.i !== undefined) properties[attr.name] = Number(attr.i);
            else if (attr.s) properties[attr.name] = new TextDecoder().decode(attr.s);
            else if (attr.floats && attr.floats.length) properties[attr.name] = `[${attr.floats.join(', ')}]`;
            else if (attr.ints && attr.ints.length) properties[attr.name] = `[${attr.ints.join(', ')}]`;
            else properties[attr.name] = '...';
          }
        });
      }

      const nodeId = node.output && node.output[0] ? node.output[0] : `node_${index}`;

      if (node.output) {
        node.output.forEach(outName => {
          tensorSourceMap.set(outName, nodeId);
        });
      }

      parsedNodes.push({
        id: nodeId,
        type: node.opType || 'Unknown',
        name: node.name || node.opType || 'Node',
        properties,
        inputs: node.input ? Array.from(node.input).filter(Boolean) : [],
        outputs: []
      });
    });
  }

  if (graph.output) {
    graph.output.forEach((output, index) => {
      const outName = output.name || `output_${index}`;
      parsedNodes.push({
        id: outName + '_outnode',
        type: 'Output',
        name: output.name || 'Output',
        properties: {},
        inputs: [outName],
        outputs: []
      });
    });
  }

  const idToNode = new Map<string, NodeData>();
  parsedNodes.forEach(n => idToNode.set(n.id, n));

  parsedNodes.forEach(n => {
    n.inputs.forEach((inputTensorName, idx) => {
      let sourceNodeId = tensorSourceMap.get(inputTensorName);
      
      if (!sourceNodeId && idToNode.has(inputTensorName)) {
         sourceNodeId = inputTensorName;
      }

      if (sourceNodeId) {
        const sourceNode = idToNode.get(sourceNodeId);
        if (sourceNode) {
          if (!sourceNode.outputs.includes(n.id)) {
            sourceNode.outputs.push(n.id);
          }
          n.inputs[idx] = sourceNodeId;
        }
      }
    });
  });

  return parsedNodes;
}
