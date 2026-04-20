import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import DashboardLayout from './components/DashboardLayout';
import StadiumHeatmap from './components/StadiumHeatmap';
import PredictiveStadiumMap from './components/PredictiveStadiumMap';
import AgentRoster from './components/AgentRoster';
import SecurityLogs from './components/SecurityLogs';
import AlertsPanel from './components/AlertsPanel';

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
      totalAttendees={data.totalAttendees} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
    >
      <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 100, fontSize: '12px' }}>
        <span style={{ 
          padding: '4px 8px', borderRadius: '4px', 
          background: status === 'connected' ? 'var(--accent-green)' : 'var(--accent-red)',
          color: 'white'
        }}>
          Gateway: {status.toUpperCase()}
        </span>
      </div>

      {/* Center column: Main Content based on Tab */}
      {status === 'connected' && data.sectors.length > 0 ? (
        <>
          {activeTab === 'overview' && <StadiumHeatmap sectors={data.sectors} />}
          {activeTab === 'map' && <PredictiveStadiumMap sectors={data.sectors} />}
          {activeTab === 'agents' && <AgentRoster agents={data.agents} />}
          {activeTab === 'security' && <SecurityLogs logs={data.securityLogs} />}
        </>
      ) : (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div className="animate-pulse-soft" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-blue)' }}></div>
          <div>
            <h2 style={{ marginBottom: '8px' }}>Synchronizing with API Gateway...</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {status === 'error' ? 'Connection failed. Ensure the Cloud Run API Gateway is active and reachable.' : 'Awaiting live telemetry stream...'}
            </p>
          </div>
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          System Settings locked. Multi-factor authentication required.
        </div>
      )}

      {/* Right column: Alerts Panel */}
      <AlertsPanel alerts={data.alerts} />
    </DashboardLayout>
  );
}

export default App;
