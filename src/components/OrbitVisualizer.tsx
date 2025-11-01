// src/components/OrbitVisualizer.tsx

import Plot from 'react-plotly.js';
import { Data, Layout } from 'plotly.js';

// --- Định nghĩa các Kiểu dữ liệu (Interfaces) ---
interface Position {
  x: number;
  y: number;
  z: number;
}

interface OrbitVisualizerProps {
  positions: Position[];
}

// --- Component Chính ---
const OrbitVisualizer = ({ positions }: OrbitVisualizerProps) => {

  // === BƯỚC 1: CHUẨN BỊ DỮ LIỆU CHO PLOTLY ===
  const xCoords = positions.map(p => p.x);
  const yCoords = positions.map(p => p.y);
  const zCoords = positions.map(p => p.z);

  const earthTrace: Data = {
    x: [0], y: [0], z: [0],
    mode: 'markers',
    type: 'scatter3d',
    name: 'Earth (Center)',
    marker: { color: '#2ca02c', size: 8, symbol: 'circle' }
  };

  const orbitTrace: Data = {
    x: xCoords, y: yCoords, z: zCoords,
    mode: 'lines',
    type: 'scatter3d',
    name: 'Satellite Orbit',
    line: { color: '#1f77b4', width: 4 }
  };

  // === BƯỚC 2: CẤU HÌNH GIAO DIỆN ĐỒ THỊ (LAYOUT) ===
  const layout: Partial<Layout> = {
    title: {
      text: 'Satellite Orbit (3D Visualization)'
    },
    autosize: true,
    scene: {
      // === SỬA LỖI NẰM Ở ĐÂY ===
      // Tiêu đề của các trục cũng phải là một object có thuộc tính 'text'
      xaxis: { title: { text: 'X (km)' } },
      yaxis: { title: { text: 'Y (km)' } },
      zaxis: { title: { text: 'Z (km)' } },
      aspectratio: { x: 1, y: 1, z: 1 },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.5 }
      }
    },
    margin: { l: 0, r: 0, b: 0, t: 40 },
    showlegend: true
  };

  // === BƯỚC 3: RENDER COMPONENT PLOT ===
  return (
    <Plot
      data={[orbitTrace, earthTrace]}
      layout={layout}
      style={{ width: '100%', height: '600px' }}
      config={{ responsive: true }}
    />
  );
};

export default OrbitVisualizer;
