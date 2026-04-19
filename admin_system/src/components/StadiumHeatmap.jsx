import React from 'react';
import { Users, Clock, MapPin } from 'lucide-react';

const StadiumHeatmap = ({ sectors }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'var(--accent-red)';
      case 'warning': return 'var(--accent-yellow)';
      default: return 'var(--accent-green)';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'critical': return 'rgba(239, 68, 68, 0.15)';
      case 'warning': return 'rgba(245, 158, 11, 0.15)';
      default: return 'rgba(16, 185, 129, 0.15)';
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="glass-header" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={20} color="var(--accent-blue)" />
          Live Stadium Heatmap
        </h3>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)'}}></div> Normal</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-yellow)'}}></div> Warning</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-red)'}} className="animate-pulse-soft"></div> Critical</span>
        </div>
      </div>

      <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {sectors.map((sector) => {
            const ratio = sector.current / sector.capacity;
            const percentage = Math.round(ratio * 100);
            
            return (
              <div 
                key={sector.id}
                style={{ 
                  background: getStatusBg(sector.status),
                  border: `1px solid ${getStatusColor(sector.status)}`,
                  borderRadius: '16px',
                  padding: '20px',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Background progress bar indicator */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, left: 0, height: '4px', 
                  width: `${percentage}%`, 
                  background: getStatusColor(sector.status),
                  transition: 'width 1s ease-in-out'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600' }}>{sector.name}</h4>
                  <span style={{ 
                    fontSize: '12px', fontWeight: 'bold', 
                    color: getStatusColor(sector.status),
                    background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '12px'
                  }}>
                    {percentage}%
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={16} /> Current
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      {sector.current.toLocaleString()} / {sector.capacity.toLocaleString()}
                    </span>
                  </div>

                  {(sector.type === 'restroom' || sector.type === 'concession') && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={16} /> Est. Wait
                      </div>
                      <span style={{ 
                        color: sector.waitTime > 10 ? 'var(--accent-red)' : sector.waitTime > 5 ? 'var(--accent-yellow)' : 'var(--accent-green)', 
                        fontWeight: '600' 
                      }}>
                        {sector.waitTime} mins
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StadiumHeatmap;
