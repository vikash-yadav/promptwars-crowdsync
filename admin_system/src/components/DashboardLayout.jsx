import React from 'react';
import { LayoutDashboard, Users, Map, Settings, ShieldAlert, Activity } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    background: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    transition: 'all 0.2s',
    borderLeft: active ? '3px solid var(--accent-blue)' : '3px solid transparent'
  }}
  onMouseOver={(e) => {
    if (!active) {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
      e.currentTarget.style.color = 'var(--text-primary)';
    }
  }}
  onMouseOut={(e) => {
    if (!active) {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = 'var(--text-secondary)';
    }
  }}>
    <Icon size={20} color={active ? 'var(--accent-blue)' : 'currentColor'} />
    <span style={{ fontWeight: active ? '600' : '400' }}>{label}</span>
  </div>
);

const DashboardLayout = ({ children, totalAttendees }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top Navbar */}
      <header className="glass-header" style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--gradient-brand)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity color="white" size={20} />
          </div>
          <h1 style={{ fontSize: '22px', margin: 0 }}>CrowdSync</h1>
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Staff Control
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Venue Attendance</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-green)' }}>
              {totalAttendees.toLocaleString()}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>JD</span>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        {/* Sidebar */}
        <nav className="glass-panel" style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '16px' }}>
            Menu
          </div>
          <SidebarItem icon={LayoutDashboard} label="Live Overview" active={true} />
          <SidebarItem icon={Map} label="Predictive Map" active={false} />
          <SidebarItem icon={Users} label="Agent Roster" active={false} />
          <SidebarItem icon={ShieldAlert} label="Security Logs" active={false} />
          
          <div style={{ marginTop: 'auto' }}>
            <SidebarItem icon={Settings} label="System Settings" active={false} />
          </div>
        </nav>

        {/* Dashboard Content */}
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
