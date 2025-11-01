// src/App.tsx

import { useState, useEffect, useRef } from 'react';
import FederatedNetwork from './components/FederatedNetwork';
import AccuracyChart from './components/AccuracyChart';
import './App.css';

interface HistoryItem { round: number; accuracy: number; }
interface TrainingStatus {
  status: 'idle' | 'running' | 'displaying' | 'finished' | 'failed';
  current_round: number;
  total_rounds: number;
  history: HistoryItem[];
  error_message: string | null;
}

function App() {
  const [status, setStatus] = useState<TrainingStatus['status']>('idle');
  const [fullHistory, setFullHistory] = useState<HistoryItem[]>([]);
  const [displayedHistory, setDisplayedHistory] = useState<HistoryItem[]>([]);
  const [activeClients, setActiveClients] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(100);

  const statusIntervalRef = useRef<number | null>(null);
  const displayIntervalRef = useRef<number | null>(null);

  const handleStartTraining = () => {
    setStatus('running'); setFullHistory([]); setDisplayedHistory([]);
    setCurrentRound(0); setActiveClients([]);
    fetch('/api/start-training', { method: 'POST' })
      .then(res => { if (!res.ok) throw new Error("Start failed"); })
      .catch(() => setStatus('failed'));
  };

  useEffect(() => {
    if (status !== 'running') {
        if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
        return;
    }
    statusIntervalRef.current = window.setInterval(() => {
      fetch('/api/get-status')
        .then(res => res.json())
        .then((data: TrainingStatus) => {
          if (data.status === 'finished') {
            setFullHistory(data.history);
            setTotalRounds(data.total_rounds);
            setStatus('displaying');
          } else if (data.status === 'failed') {
            setStatus('failed');
          }
        });
    }, 2000);
    return () => { if (statusIntervalRef.current) clearInterval(statusIntervalRef.current); };
  }, [status]);

  useEffect(() => {
    if (status !== 'displaying' || fullHistory.length === 0) {
        if (displayIntervalRef.current) clearInterval(displayIntervalRef.current);
        return;
    }
    displayIntervalRef.current = window.setInterval(() => {
      setDisplayedHistory(prev => {
        const nextRoundIndex = prev.length;
        if (nextRoundIndex < fullHistory.length) {
          setCurrentRound(fullHistory[nextRoundIndex].round);
          setActiveClients(Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)));
          return [...prev, fullHistory[nextRoundIndex]];
        } else {
          if (displayIntervalRef.current) clearInterval(displayIntervalRef.current);
          setStatus('finished');
          setActiveClients([]);
          return prev;
        }
      });
    }, 200);
    return () => { if (displayIntervalRef.current) clearInterval(displayIntervalRef.current); };
  }, [status, fullHistory]);
  
  const getButtonText = () => {
    switch (status) {
      case 'running': return `Waiting for Backend... (Simulating ~20s)`;
      case 'displaying': return `Visualizing... (Round ${currentRound}/${totalRounds})`;
      case 'finished': return 'Start Again';
      case 'failed': return 'Retry Training';
      default: return 'Start Federated Training (100 Rounds)';
    }
  };

  return (
    <div className="app-container">
        <header className="app-header">
          <h1>Federated SAGINs Orchestrator - PoC #3</h1>
          <div className="controls">
            <button onClick={handleStartTraining} disabled={status === 'running' || status === 'displaying'}>
              {getButtonText()}
            </button>
          </div>
        </header>
        <main className="app-main-split">
          <div className="side-panel">
            <div className="explanation-box">
              <h3>About This PoC</h3>
              <p>This demo simulates a **Federated Learning (FL)** process, a decentralized ML approach that preserves data privacy.</p>
              <h4>How it works:</h4>
              <ol>
                <li><strong>Start Training:</strong> Initiates a pre-computed 100-round training simulation on the backend.</li>
                <li><strong>Waiting for Backend:</strong> The backend runs the full simulation (simulated for ~20 seconds).</li>
                <li><strong>Visualizing Results:</strong> The frontend receives the complete training history and "replays" it, plotting the accuracy growth and highlighting active clients for each round in real-time.</li>
              </ol>
              <p>This showcases how collaborative learning can build a powerful AI model from decentralized, Non-IID data without centralizing sensitive information.</p>
            </div>
          </div>
          <div className="panel network-panel">
            <h2>Network View (Simulated)</h2>
            <FederatedNetwork activeClients={activeClients} />
          </div>
          <div className="panel chart-panel">
            <h2>Global Model Accuracy</h2>
            <div className="chart-wrapper">
              <AccuracyChart history={displayedHistory} />
            </div>
            {/* === SỬA LỖI CÚ PHÁP Ở ĐÂY === */}
            {status === 'finished' && <div className="overlay-text">Simulation Complete! Final Accuracy: {((fullHistory[fullHistory.length - 1]?.accuracy ?? 0) * 100).toFixed(2)}%</div>}
            {status === 'failed' && <div className="overlay-text error-text">Simulation Failed!</div>}
          </div>
        </main>
      </div>
  );
}

export default App;
