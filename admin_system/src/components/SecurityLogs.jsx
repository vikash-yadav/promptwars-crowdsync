import React from 'react';
import { ShieldAlert, Terminal, Lock, ShieldCheck } from 'lucide-react';

const SecurityLogs = ({ logs }) => {
  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="glass-header" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={20} color="var(--accent-blue)" />
          System Security Logs
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '12px', fontWeight: 'bold' }}>
           <ShieldCheck size={16} /> SYSTEM SECURE
        </div>
      </div>

      <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: '500' }}>Timestamp</th>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: '500' }}>Event</th>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: '500' }}>Severity</th>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: '500' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  {new Date(log.time).toLocaleTimeString()}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={14} color="var(--accent-blue)" />
                    {log.event}
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    background: log.severity === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: log.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-blue)',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}>
                    {log.severity}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)' }}>
                    <Lock size={14} /> Encrypted
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SecurityLogs;
