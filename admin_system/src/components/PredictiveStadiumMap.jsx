import React from 'react';
import { MapPin, Info } from 'lucide-react';

const PredictiveStadiumMap = ({ sectors }) => {
  const getSectorStatus = (id) => {
    const sector = sectors.find(s => s.id === id);
    if (!sector) return { color: '#333', opacity: 0.2, percentage: 0 };
    
    let color = 'var(--accent-green)';
    if (sector.status === 'critical') color = 'var(--accent-red)';
    else if (sector.status === 'warning') color = 'var(--accent-yellow)';
    
    return {
      color,
      opacity: 0.4 + (sector.current / sector.capacity) * 0.6,
      percentage: Math.round((sector.current / sector.capacity) * 100),
      name: sector.name,
      current: sector.current,
      capacity: sector.capacity
    };
  };

  const sectorsToRender = [
    { id: 'sec-north', d: "M 100 100 Q 400 50 700 100 L 700 200 Q 400 150 100 200 Z", labelPos: { x: 400, y: 120 } },
    { id: 'sec-south', d: "M 100 600 Q 400 650 700 600 L 700 500 Q 400 550 100 500 Z", labelPos: { x: 400, y: 580 } },
    { id: 'sec-east', d: "M 720 120 Q 780 350 720 580 L 620 580 Q 680 350 620 120 Z", labelPos: { x: 670, y: 350 } },
    { id: 'sec-west', d: "M 80 120 Q 20 350 80 580 L 180 580 Q 120 350 180 120 Z", labelPos: { x: 130, y: 350 } }
  ];

  const amenities = [
    { id: 'restroom-101', x: 220, y: 180, label: 'R101' },
    { id: 'restroom-102', x: 580, y: 520, label: 'R102' },
    { id: 'food-grill', x: 220, y: 520, label: 'Grill' },
    { id: 'food-pizza', x: 580, y: 180, label: 'Pizza' }
  ];

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="glass-header" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={20} color="var(--accent-blue)" />
          Predictive Spatial Map
        </h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent-red)', opacity: 0.6 }}></div> High Load
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent-green)', opacity: 0.6 }}></div> Optimal
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
        <svg viewBox="0 0 800 700" style={{ maxWidth: '100%', maxHeight: '100%', filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}>
          {/* Pitch */}
          <rect x="250" y="250" width="300" height="200" fill="#1a472a" stroke="#ffffff44" strokeWidth="2" rx="4" />
          <circle cx="400" cy="350" r="40" fill="none" stroke="#ffffff44" strokeWidth="2" />
          <line x1="400" y1="250" x2="400" y2="450" stroke="#ffffff44" strokeWidth="2" />

          {/* Main Sectors */}
          {sectorsToRender.map(sector => {
            const status = getSectorStatus(sector.id);
            return (
              <g key={sector.id}>
                <path 
                  d={sector.d} 
                  fill={status.color} 
                  fillOpacity={status.opacity} 
                  stroke={status.color} 
                  strokeWidth="2"
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text 
                  x={sector.labelPos.x} 
                  y={sector.labelPos.y} 
                  fill="white" 
                  fontSize="14" 
                  fontWeight="bold" 
                  textAnchor="middle"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {status.name}
                </text>
                <text 
                  x={sector.labelPos.x} 
                  y={sector.labelPos.y + 20} 
                  fill="rgba(255,255,255,0.7)" 
                  fontSize="12" 
                  textAnchor="middle"
                >
                  {status.percentage}% Cap
                </text>
              </g>
            );
          })}

          {/* Amenities */}
          {amenities.map(item => {
            const status = getSectorStatus(item.id);
            return (
              <g key={item.id}>
                <rect 
                  x={item.x - 30} 
                  y={item.y - 15} 
                  width="60" 
                  height="30" 
                  rx="6" 
                  fill="rgba(0,0,0,0.6)" 
                  stroke={status.color} 
                  strokeWidth="1" 
                />
                <circle 
                  cx={item.x - 20} 
                  cy={item.y} 
                  r="4" 
                  fill={status.color} 
                  className={status.color === 'var(--accent-red)' ? 'animate-pulse' : ''}
                />
                <text x={item.x + 5} y={item.y + 5} fill="white" fontSize="10" fontWeight="600">{item.label}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '24px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} color="var(--accent-blue)" />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Live flow analysis active. Predicting 15min congestion shifts.
            </span>
         </div>
      </div>
    </div>
  );
};

export default PredictiveStadiumMap;
