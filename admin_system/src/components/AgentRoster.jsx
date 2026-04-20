import React from 'react';
import { Users, Activity, CheckCircle, AlertCircle } from 'lucide-react';

const AgentRoster = ({ agents }) => {
  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="glass-header" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="var(--accent-blue)" />
          Active AI Agent Roster
        </h3>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)'}}></div> Operational
          </span>
        </div>
      </div>

      <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {agents.map((agent) => (
            <div 
              key={agent.id}
              style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    background: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Activity size={20} color="var(--accent-blue)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>{agent.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ID: {agent.id}</span>
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '12px', 
                  color: 'var(--accent-green)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}>
                  <CheckCircle size={14} /> ACTIVE
                </div>
              </div>

              <div style={{ display: 'grid', gridCols: '2', gap: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px' }}>
                   <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Tasks Processed</div>
                   <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{agent.tasks}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px' }}>
                   <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Last Heartbeat</div>
                   <div style={{ fontSize: '12px' }}>{new Date(agent.heartbeat).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentRoster;
