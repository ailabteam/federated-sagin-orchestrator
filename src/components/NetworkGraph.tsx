// src/components/NetworkGraph.tsx

import { useCallback } from 'react';
import ReactFlow, {
  Controls, Background, useEdgesState, addEdge, Connection, Edge, BackgroundVariant, Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialEdges: Edge[] = [ /* ... giữ nguyên mảng edges ... */ 
    { id: 'e_LEO_1-LEO_2', source: 'LEO_1', target: 'LEO_2', animated: true }, { id: 'e_LEO_2-LEO_3', source: 'LEO_2', target: 'LEO_3', animated: true },
    { id: 'e_LEO_3-LEO_1', source: 'LEO_3', target: 'LEO_1', animated: true }, { id: 'e_LEO_1-GEO_1', source: 'LEO_1', target: 'GEO_1' },
    { id: 'e_LEO_2-GEO_1', source: 'LEO_2', target: 'GEO_1' }, { id: 'e_LEO_3-GEO_1', source: 'LEO_3', target: 'GEO_1' },
    { id: 'e_GEO_1-GS_Hanoi', source: 'GEO_1', target: 'GS_Hanoi' }, { id: 'e_GEO_1-GS_Singapore', source: 'GEO_1', target: 'GS_Singapore' },
    { id: 'e_GEO_1-GS_Frankfurt', source: 'GEO_1', target: 'GS_Frankfurt' }, { id: 'e_GEO_1-GS_NewYork', source: 'GEO_1', target: 'GS_NewYork' },
];

interface NetworkGraphProps {
  nodes: Node[];
  onNodesChange: (changes: any) => void; // Thêm prop này
}

const NetworkGraph = ({ nodes, onNodesChange }: NetworkGraphProps) => {
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),[setEdges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange} // Sử dụng hàm từ props
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodesDraggable={false}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default NetworkGraph;
