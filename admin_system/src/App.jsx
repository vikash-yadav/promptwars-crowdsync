import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import DashboardLayout from './components/DashboardLayout';
import StadiumHeatmap from './components/StadiumHeatmap';
import AlertsPanel from './components/AlertsPanel';

// Connect to API Gateway
const socket = io('http://localhost:4000');

function App() {
  const [data, setData] = useState({
    sectors: [],
    alerts: [],
    totalAttendees: 0
  });

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to API Gateway WebSocket');
    });

    socket.on('stadium-update', (newData) => {
      setData(newData);
    });

    return () => {
      socket.off('connect');
      socket.off('stadium-update');
    };
  }, []);

  return (
    <DashboardLayout totalAttendees={data.totalAttendees}>
      {/* Center column: Heatmap */}
      <StadiumHeatmap sectors={data.sectors} />

      {/* Right column: Alerts Panel */}
      <AlertsPanel alerts={data.alerts} />
    </DashboardLayout>
  );
}

export default App;
