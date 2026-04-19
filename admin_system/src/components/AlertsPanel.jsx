import React from 'react';
import { AlertCircle, Info, AlertTriangle } from 'lucide-react';

const AlertsPanel = ({ alerts }) => {
  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="glass-header" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} color="var(--accent-blue)" />
          Coordinator Agent Alerts
        </h3>
        <span style={{ 
          background: 'rgba(59, 130, 246, 0.2)', 
          color: 'var(--accent-blue)', 
          padding: '4px 10px', 
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {alerts.length} Active
        </span>
      </div>
      
      <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
            No active alerts. System optimal.
          </div>
        ) : (
          alerts.map((alert, idx) => (
            <div 
              key={alert.id} 
              className="animate-slide-in"
              style={{ 
                animationDelay: `${idx * 0.1}s`,
                padding: '16px', 
                borderRadius: '12px',
                background: alert.type === 'critical' 
                  ? 'rgba(239, 68, 68, 0.1)' 
                  : alert.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                borderLeft: `4px solid ${
                  alert.type === 'critical' ? 'var(--accent-red)' 
                  : alert.type === 'warning' ? 'var(--accent-yellow)' : 'var(--accent-blue)'
                }`
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ marginTop: '2px' }}>
                  {alert.type === 'critical' ? <AlertCircle size={18} color="var(--accent-red)" /> : 
                   alert.type === 'warning' ? <AlertTriangle size={18} color="var(--accent-yellow)" /> :
                   <Info size={18} color="var(--accent-blue)" />}
                </div>
                <div>
                  <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>{alert.message}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {new Date(alert.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
