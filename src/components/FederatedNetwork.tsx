// src/components/FederatedNetwork.tsx

import { memo } from 'react';
import ReactFlow, { Background, Controls, Edge, Node, Position } from 'reactflow';
import 'reactflow/dist/style.css';

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  style: { 
    borderRadius: '100%', 
    backgroundColor: '#fff', 
    width: 60, 
    height: 60, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    border: '2px solid #ccc',
    transition: 'all 0.3s ease',
  },
};

// Vị trí các client được xếp thành vòng tròn
const getCircularPosition = (index: number, total: number, radius: number, centerX: number, centerY: number) => {
  const angle = (index / total) * 2 * Math.PI;
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
};

const NUM_CLIENTS = 10;
const initialNodes: Node[] = [
  { 
    id: 'orchestrator', 
    position: { x: 400, y: 250 }, 
    data: { label: '🛰️' }, // Emoji cho Orchestrator
    ...nodeDefaults,
    style: { ...nodeDefaults.style, width: 80, height: 80, backgroundColor: '#FFD700', borderColor: '#DAA520' }
  },
  ...Array.from({ length: NUM_CLIENTS }, (_, i) => ({
    id: `client_${i}`,
    position: getCircularPosition(i, NUM_CLIENTS, 300, 400, 250),
    data: { label: `C${i}` },
    ...nodeDefaults,
  })),
];

const initialEdges: Edge[] = Array.from({ length: NUM_CLIENTS }, (_, i) => ({
  id: `e-orch-c${i}`,
  source: 'orchestrator',
  target: `client_${i}`,
}));

interface FederatedNetworkProps {
  activeClients: number[];
}

const FederatedNetwork = ({ activeClients }: FederatedNetworkProps) => {
  // Cập nhật style cho các node và edge đang hoạt động
  const nodes = initialNodes.map(node => {
    const isActive = activeClients.includes(Number(node.id.split('_')[1]));
    return {
      ...node,
      style: {
        ...node.style,
        borderColor: isActive ? '#007bff' : '#ccc',
        boxShadow: isActive ? '0 0 15px #007bff' : 'none',
      }
    };
  });

  const edges = initialEdges.map(edge => {
    const isTargetActive = activeClients.includes(Number(edge.target?.split('_')[1]));
    return {
      ...edge,
      animated: isTargetActive,
      style: { stroke: isTargetActive ? '#007bff' : '#ccc', strokeWidth: 2 },
    };
  });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Controls showInteractive={false} />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default memo(FederatedNetwork);
