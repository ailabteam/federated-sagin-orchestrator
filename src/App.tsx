// src/App.tsx

import { useState, useEffect } from 'react';
import FederatedNetwork from './components/FederatedNetwork';
import AccuracyChart from './components/AccuracyChart';
import './App.css';

interface HistoryItem {
  round: number;
  accuracy: number;
}

interface TrainingStatus {
  status: 'idle' | 'running' | 'finished' | 'failed';
  current_round: number;
  total_rounds: number;
  history: HistoryItem[];
  error_message: string | null;
}

function App() {
  const [status, setStatus] = useState<TrainingStatus>({ status: 'idle', current_round: 0, total_rounds: 0, history: [], error_message: null });
  const [activeClients, setActiveClients] = useState<number[]>([]);

  // Hook để lấy status theo chu kỳ
  useEffect(() => {
    if (status.status !== 'running') return;

    const intervalId = setInterval(() => {
      fetch('/api/get-status')
        .then(res => res.json())
        .then((data: TrainingStatus) => {
          setStatus(data);
          // Mô phỏng việc các client đang hoạt động thay đổi ngẫu nhiên
          const active = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
          setActiveClients(active);
        })
        .catch(console.error);
    }, 2000); // Cập nhật mỗi 2 giây

    return () => clearInterval(intervalId);
  }, [status.status]);

  const handleStartTraining = () => {
    setStatus({ ...status, status: 'running' }); // Cập nhật UI ngay lập tức
    setActiveClients([]); // Reset active clients
    fetch('/api/start-training', { method: 'POST' })
      .catch(err => {
        console.error(err);
        setStatus({ ...status, status: 'failed', error_message: 'Failed to start training.' });
      });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Federated SAGINs Orchestrator - PoC #3</h1>
        <div className="controls">
          <button onClick={handleStartTraining} disabled={status.status === 'running'}>
            {status.status === 'running' ? `Training... (Round ${status.current_round}/${status.total_rounds})` : 'Start Federated Training'}
          </button>
        </div>
      </header>
      <main className="app-main-split">
        <div className="panel network-panel">
          <h2>Network View</h2>
          <FederatedNetwork activeClients={activeClients} />
        </div>
        <div className="panel chart-panel">
          <h2>Global Model Accuracy</h2>
          <AccuracyChart history={status.history} />
          {status.status === 'finished' && <div className="overlay-text">Training Complete!</div>}
          {status.status === 'failed' && <div className="overlay-text error-text">Training Failed!</div>}
        </div>
      </main>
    </div>
  );
}

export default App;
