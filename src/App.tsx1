// src/App.tsx

import { useState, useEffect } from 'react';
import NetworkGraph from './components/NetworkGraph';
import { Node, useNodesState } from 'reactflow';
import './App.css';

// --- Định nghĩa các hằng số ---
const NODE_NAMES = ['GEO_1', 'GS_Frankfurt', 'GS_Hanoi', 'GS_NewYork', 'GS_Singapore', 'LEO_1', 'LEO_2', 'LEO_3'];
const SEQUENCE_LENGTH = 10;
const STATUS_COLORS = { normal: '#89CFF0', warning: '#FFD700', anomaly: '#FF6347' };

const initialPositions: Record<string, { x: number, y: number }> = {
    LEO_1: { x: 100, y: 100 }, LEO_2: { x: 300, y: 0 }, LEO_3: { x: 500, y: 100 },
    GEO_1: { x: 300, y: 200 }, GS_Hanoi: { x: 0, y: 400 }, GS_Frankfurt: { x: 200, y: 400 },
    GS_NewYork: { x: 400, y: 400 }, GS_Singapore: { x: 600, y: 400 },
};

const initialNodes: Node[] = NODE_NAMES.map(name => ({
    id: name,
    position: initialPositions[name],
    data: { label: name },
    style: { backgroundColor: STATUS_COLORS.normal, border: '1px solid black', transition: 'background-color 0.5s ease' },
}));

// --- Dữ liệu "Vàng" và Hàm tạo Snapshot ---
const normalSnapshotSample = {
  "nodes": [{"name": "LEO_1", "load": 0.1991194729071161, "queue_size": 14.751752022185556}, {"name": "LEO_2", "load": 0.1833768536868968, "queue_size": 10.104058355996456}, {"name": "LEO_3", "load": 0.1537933992835856, "queue_size": 15.55410914858765}, {"name": "GEO_1", "load": 0.4693672742565909, "queue_size": 37.45420333868986}, {"name": "GS_Hanoi", "load": 0.0924873484060394, "queue_size": 6.452704232785333}, {"name": "GS_Frankfurt", "load": 0.1034499820206779, "queue_size": 5.886890170599905}, {"name": "GS_NewYork", "load": 0.0407942375990939, "queue_size": 3.803612464326134}, {"name": "GS_Singapore", "load": 0.1212933972265546, "queue_size": 9.9853645778979}],
  "edges": [{"source": "LEO_1", "target": "LEO_2", "latency": 2.8070014451416023, "bandwidth": 0.1596642852318578}, {"source": "LEO_1", "target": "LEO_3", "latency": 2.403318696252855, "bandwidth": 0.2926385225982777}, {"source": "LEO_1", "target": "GEO_1", "latency": 1.666199575683577, "bandwidth": 0.3352847932791422}, {"source": "LEO_2", "target": "LEO_3", "latency": 3.223534121806184, "bandwidth": 0.1748043830120914}, {"source": "LEO_2", "target": "GEO_1", "latency": 1.6682898739865084, "bandwidth": 0.2707342495558735}, {"source": "LEO_3", "target": "GEO_1", "latency": 1.668969615828773, "bandwidth": 0.2102625518190134}, {"source": "GEO_1", "target": "GS_Hanoi", "latency": 21.27517364029218, "bandwidth": 0.2726352116392666}, {"source": "GEO_1", "target": "GS_Frankfurt", "latency": 21.275173640292174, "bandwidth": 0.2943445085299953}, {"source": "GEO_1", "target": "GS_NewYork", "latency": 21.275173640292177, "bandwidth": 0.2401806232163067}, {"source": "GEO_1", "target": "GS_Singapore", "latency": 21.275173640292177, "bandwidth": 0.299268228894895}]
};

const createAnomalousSnapshot = (targetNode: string, intensity: number) => {
    const newSnapshot = JSON.parse(JSON.stringify(normalSnapshotSample));
    for (const node of newSnapshot.nodes) {
        if (node.name === targetNode) {
            node.load = 0.3 + (0.95 - 0.3) * intensity;
            node.queue_size = 20 + (95 - 20) * intensity;
            break;
        }
    }
    return newSnapshot;
};

// --- Component Chính ---
function App() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [systemRisk, setSystemRisk] = useState(0);
    const [anomalyTarget, setAnomalyTarget] = useState<string | null>(null);
    const [intensity, setIntensity] = useState(1.0);
    const [apiStatus, setApiStatus] = useState('Idle');
  
    useEffect(() => {
      const intervalId = setInterval(() => {
        setApiStatus('Calling API...');
        let sequence = anomalyTarget 
            ? [...Array(5).fill(normalSnapshotSample), ...Array.from({ length: 5 }, () => createAnomalousSnapshot(anomalyTarget, intensity))]
            : Array(SEQUENCE_LENGTH).fill(normalSnapshotSample);
        
        fetch('/api/forecast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sequence }) })
        .then(res => { if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`); return res.json(); })
        .then(data => { setSystemRisk(data.anomaly_probability); setApiStatus('Success'); })
        .catch(err => { console.error("API call failed:", err); setApiStatus('Failed'); });
      }, 3000);
      return () => clearInterval(intervalId);
    }, [anomalyTarget, intensity]);

    useEffect(() => {
        setNodes((currentNodes) =>
          currentNodes.map((node) => {
            let color = STATUS_COLORS.normal;
            if (node.id === anomalyTarget && systemRisk > 0.5) {
              color = systemRisk > 0.8 ? STATUS_COLORS.anomaly : STATUS_COLORS.warning;
            }
            return { ...node, style: { ...node.style, backgroundColor: color, border: anomalyTarget === node.id ? '3px solid red' : '1px solid black', color: (node.id === anomalyTarget && systemRisk > 0.5) ? 'white' : 'black', fontWeight: (node.id === anomalyTarget && systemRisk > 0.5) ? 'bold' : 'normal'}};
          })
        );
      }, [systemRisk, anomalyTarget, setNodes]);
  
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>GNN Anomaly Forecaster - PoC #2</h1>
          <div className="controls">
            <div className="control-group">
              <label htmlFor="anomaly-target">Inject Anomaly on: </label>
              <select id="anomaly-target" onChange={(e) => {
                  // === SỬA LỖI GÕ NHẦM Ở ĐÂY ===
                  const newTarget = e.target.value || null;
                  setAnomalyTarget(newTarget);
                  setSystemRisk(0);
              }} value={anomalyTarget || ''}>
                <option value="">-- No Anomaly --</option>
                {NODE_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            {anomalyTarget && (
              <div className="control-group">
                <label htmlFor="intensity">Intensity ({intensity.toFixed(2)}): </label>
                <input id="intensity" type="range" min="0" max="1" step="0.05" value={intensity} 
                       onChange={(e) => setIntensity(parseFloat(e.target.value))} />
              </div>
            )}
            <div className="status-indicator">
              API Status: {apiStatus} | System Anomaly Probability: <strong>{systemRisk.toFixed(4)}</strong>
            </div>
          </div>
        </header>
        <main className="app-main">
          <NetworkGraph nodes={nodes} onNodesChange={onNodesChange} />
        </main>
      </div>
    );
}

export default App;
