// src/App.tsx

import { useState, useEffect } from 'react';
import FederatedNetwork from './components/FederatedNetwork';
import AccuracyChart from './components/AccuracyChart';
import './App.css';

// --- Định nghĩa các Kiểu dữ liệu ---
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

// --- Component Chính ---
function App() {
  const [status, setStatus] = useState<TrainingStatus>({ 
    status: 'idle', 
    current_round: 0, 
    total_rounds: 100, 
    history: [], 
    error_message: null 
  });
  
  const [activeClients, setActiveClients] = useState<number[]>([]);

  useEffect(() => {
    if (status.status !== 'running') {
      setActiveClients([]);
      return;
    }

    const intervalId = setInterval(() => {
      fetch('/api/get-status')
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch status");
            return res.json();
        })
        .then((data: TrainingStatus) => {
          setStatus(data);
          if(data.status === 'running') {
            const active = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
            setActiveClients(active);
          }
        })
        .catch(console.error);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [status.status]);

  const handleStartTraining = () => {
    setStatus({ 
        status: 'running', 
        current_round: 0, 
        total_rounds: 100, 
        history: [], 
        error_message: null 
    });
    
    fetch('/api/start-training', { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error("Failed to start training");
        return res.json();
      })
      .then(console.log)
      .catch(err => {
        console.error(err);
        setStatus(prev => ({ ...prev, status: 'failed', error_message: 'Failed to start training process.' }));
      });
  };

  const getButtonText = () => {
    switch (status.status) {
      case 'running':
        return `Training... (Round ${status.current_round}/${status.total_rounds})`;
      case 'finished':
        return 'Start Again';
      case 'failed':
        return 'Retry Training';
      default:
        return 'Start Federated Training (100 Rounds)';
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Federated SAGINs Orchestrator - PoC #3</h1>
        <div className="controls">
          <button onClick={handleStartTraining} disabled={status.status === 'running'}>
            {getButtonText()}
          </button>
        </div>
      </header>
      <main className="app-main-split">
        <div className="side-panel">
          <div className="explanation-box">
            <h3>About This PoC</h3>
            <p>This Proof-of-Concept demonstrates a **Federated Learning (FL)** simulation, a decentralized machine learning approach that preserves data privacy.</p>
            <h4>How it works:</h4>
            <ol>
              <li><strong>Start Training:</strong> The central orchestrator initiates a simulated 100-round training process.</li>
              <li><strong>Client Selection:</strong> In each round, a random subset of clients is selected to participate (highlighted in the Network View).</li>
              <li><strong>Local Training (Simulated):</strong> Each client trains the model on its private data. This demo simulates this process by replaying a pre-recorded training history.</li>
              <li><strong>Aggregation (Simulated):</strong> The orchestrator combines the learnings to create an improved global model.</li>
              <li><strong>Live Results:</strong> The global model's accuracy is plotted in real-time, showing its gradual improvement over 100 rounds.</li>
            </ol>
            <p>This demo showcases how collaborative learning can build a powerful AI model from decentralized, Non-IID data without centralizing sensitive information.</p>
          </div>
        </div>
        <div className="panel network-panel">
          <h2>Network View (Simulated)</h2>
          <FederatedNetwork activeClients={activeClients} />
        </div>
        <div className="panel chart-panel">
          <h2>Global Model Accuracy</h2>
          <div className="chart-wrapper">
            <AccuracyChart history={status.history} />
          </div>
          {/* === SỬA LỖI CÚ PHÁP Ở ĐÂY === */}
          {status.status === 'finished' && <div className="overlay-text">Training Complete! Final Accuracy: {((status.history[status.history.length - 1]?.accuracy ?? 0) * 100).toFixed(2)}%</div>}
          {status.status === 'failed' && <div className="overlay-text error-text">Training Failed!</div>}
        </div>
      </main>
    </div>
  );
}

export default App;
