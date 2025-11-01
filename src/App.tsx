// src/App.tsx

import { useState, useEffect, useRef } from 'react';
import FederatedNetwork from './components/FederatedNetwork';
import AccuracyChart from './components/AccuracyChart';
import './App.css';

// --- Định nghĩa các Kiểu dữ liệu ---
interface HistoryItem {
  round: number;
  accuracy: number;
}

interface TrainingStatus {
  status: 'idle' | 'running' | 'displaying' | 'finished' | 'failed';
  current_round: number;
  total_rounds: number;
  history: HistoryItem[];
  error_message: string | null;
}

// --- Component Chính ---
function App() {
  // State quản lý trạng thái chung của quá trình
  const [status, setStatus] = useState<TrainingStatus['status']>('idle');
  // State lưu trữ toàn bộ lịch sử 100 vòng nhận từ backend
  const [fullHistory, setFullHistory] = useState<HistoryItem[]>([]);
  // State lưu trữ lịch sử đang được hiển thị (tăng dần để tạo hiệu ứng)
  const [displayedHistory, setDisplayedHistory] = useState<HistoryItem[]>([]);
  // State mô phỏng các client đang hoạt động
  const [activeClients, setActiveClients] = useState<number[]>([]);
  // State để hiển thị số vòng hiện tại trên giao diện
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(100);

  // useRef để quản lý các interval một cách an toàn, tránh lỗi re-render
  const statusIntervalRef = useRef<number | null>(null);
  const displayIntervalRef = useRef<number | null>(null);

  // Hàm xử lý khi nhấn nút "Start"
  const handleStartTraining = () => {
    // Reset tất cả các state về trạng thái ban đầu
    setStatus('running');
    setFullHistory([]);
    setDisplayedHistory([]);
    setCurrentRound(0);
    setActiveClients([]);
    
    fetch('/api/start-training', { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error("Start request failed");
      })
      .catch(err => {
        console.error(err);
        setStatus('failed');
      });
  };

  // Hook 1: Kiểm tra trạng thái từ backend (chỉ chạy khi status là 'running')
  useEffect(() => {
    if (status !== 'running') {
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
      return;
    }

    statusIntervalRef.current = window.setInterval(() => {
      fetch('/api/get-status')
        .then(res => res.json())
        .then((data: TrainingStatus) => {
          // Khi backend đã chạy xong, lưu lại kết quả và chuyển sang trạng thái "displaying"
          if (data.status === 'finished') {
            setFullHistory(data.history);
            setTotalRounds(data.total_rounds);
            setStatus('displaying');
          } else if (data.status === 'failed') {
            setStatus('failed');
          }
        })
        .catch(console.error);
    }, 2000); // 2 giây hỏi thăm backend một lần

    // Dọn dẹp interval khi hook chạy lại hoặc component unmount
    return () => { if (statusIntervalRef.current) clearInterval(statusIntervalRef.current); };
  }, [status]);


  // Hook 2: "Tua lại" và hiển thị kết quả (chỉ chạy khi status là 'displaying')
  useEffect(() => {
    if (status !== 'displaying' || fullHistory.length === 0) {
      if (displayIntervalRef.current) clearInterval(displayIntervalRef.current);
      return;
    }

    displayIntervalRef.current = window.setInterval(() => {
      setDisplayedHistory(prev => {
        const nextRoundIndex = prev.length;
        if (nextRoundIndex < fullHistory.length) {
          // Cập nhật số vòng và client hoạt động cho giao diện
          setCurrentRound(fullHistory[nextRoundIndex].round);
          setActiveClients(Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)));
          // Thêm điểm dữ liệu tiếp theo vào mảng sẽ được vẽ
          return [...prev, fullHistory[nextRoundIndex]];
        } else {
          // Đã hiển thị xong toàn bộ 100 vòng
          if (displayIntervalRef.current) clearInterval(displayIntervalRef.current);
          setStatus('finished');
          setActiveClients([]);
          return prev;
        }
      });
    }, 400); // Tốc độ "vẽ": 0.4 giây cho mỗi điểm -> 40 giây cho 100 vòng

    // Dọn dẹp interval
    return () => { if (displayIntervalRef.current) clearInterval(displayIntervalRef.current); };
  }, [status, fullHistory]);
  
  // Hàm để hiển thị text trên nút bấm
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
              <li><strong>Waiting for Backend:</strong> The backend runs the full simulation (simulated for ~20 seconds to get the final results).</li>
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
            {/* Logic hiển thị các trạng thái khác nhau */}
            {status === 'idle' && <div className="chart-placeholder">Click "Start" to begin the simulation.</div>}
            {status === 'running' && <div className="chart-placeholder"><div className="spinner"></div>Waiting for backend to complete simulation...</div>}
            {(status === 'displaying' || status === 'finished') && <AccuracyChart history={displayedHistory} />}
          </div>
          {/* Sửa lỗi .at() bằng cú pháp truyền thống */}
          {status === 'finished' && <div className="overlay-text">Simulation Complete! Final Accuracy: {((fullHistory[fullHistory.length - 1]?.accuracy ?? 0) * 100).toFixed(2)}%</div>}
          {status === 'failed' && <div className="overlay-text error-text">Simulation Failed!</div>}
        </div>
      </main>
    </div>
  );
}

export default App;
