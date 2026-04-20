import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import DashboardLayout from './components/DashboardLayout';
import StadiumHeatmap from './components/StadiumHeatmap';
import PredictiveStadiumMap from './components/PredictiveStadiumMap';
import AgentRoster from './components/AgentRoster';
import SecurityLogs from './components/SecurityLogs';
import AlertsPanel from './components/AlertsPanel';
import { generateMockStadiumData } from './MockDataGenerator';
import './App.css';

// Connect to API Gateway (Production)
const socket = io('https://api-gateway-260084222656.us-central1.run.app');

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [status, setStatus] = useState('connecting');
  const [data, setData] = useState({
    sectors: [],
    alerts: [],
    agents: [],
    securityLogs: [],
    totalAttendees: 0
  });

  useEffect(() => {
    // Populate with mock data initially so the UI isn't empty
    const mockData = generateMockStadiumData();
    setData(mockData);

    socket.on('connect', () => {
      console.log('Connected to API Gateway WebSocket');
      setStatus('connected');
    });

    socket.on('connect_error', (err) => {
      console.error('Connection Error:', err);
      setStatus('error');
    });

    socket.on('stadium-update', (newData) => {
      console.log('Received Stadium Update:', newData);
      setData(newData);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('stadium-update');
    };
  }, []);

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      totalAttendees={data.totalAttendees}
      status={status}
    >
      <div className="animate-slide-up">
        {activeTab === 'overview' && <StadiumHeatmap sectors={data.sectors} />}
        {activeTab === 'map' && <PredictiveStadiumMap sectors={data.sectors} />}
        {activeTab === 'agents' && <AgentRoster agents={data.agents} />}
        {activeTab === 'security' && <SecurityLogs logs={data.securityLogs} />}
        
        {activeTab === 'settings' && (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>System Configuration</h2>
            <p>System Settings locked. Multi-factor authentication required for Command Level access.</p>
          </div>
        )}

        {status !== 'connected' && (
          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            background: 'rgba(245, 158, 11, 0.1)', 
            border: '1px solid rgba(245, 158, 11, 0.2)', 
            borderRadius: '8px',
            color: 'var(--accent-yellow)',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            <strong>Simulated Telemetry:</strong> Currently displaying local cache as the neural link to API Gateway is {status === 'error' ? 'offline' : 'connecting'}...
          </div>
        )}
      </div>
      <AlertsPanel alerts={data.alerts} />
    </DashboardLayout>
  );
}

export default App;

