import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Map, 
  Settings, 
  ShieldAlert, 
  Activity,
  Zap,
  Bell,
  User
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    className={`nav-item ${active ? 'active' : ''}`}
    onClick={onClick}
  >
    <div className="nav-item-icon">
      <Icon size={18} />
    </div>
    <span>{label}</span>
  </button>
);

const DashboardLayout = ({ children, totalAttendees, activeTab, onTabChange, status }) => {
  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="header-nav glass-header">
        <div className="logo-group">
          <div className="logo-icon">
            <Zap size={20} fill="white" />
          </div>
          <h1 className="logo-text">CrowdSync <span className="logo-accent">Admin</span></h1>
        </div>
        
        <div className="nav-actions">
          <div className={`status-badge ${status}`}>
            <div className="status-dot"></div>
            <span>{status === 'connected' ? 'Neural Link Active' : 'Gateway Offline'}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '24px' }}>
            <div style={{ textAlign: 'right', marginRight: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Venue Attendance</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                {totalAttendees?.toLocaleString() || '0'}
              </div>
            </div>
            <button className="nav-icon-button" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <Bell size={20} />
            </button>
            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={14} color="white" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Command</span>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Sidebar */}
        <aside className="sidebar">
          <div>
            <p className="nav-section-label">Main Menu</p>
            <div className="nav-items">
              <SidebarItem 
                icon={LayoutDashboard} 
                label="Live Overview" 
                active={activeTab === 'overview'} 
                onClick={() => onTabChange('overview')}
              />
              <SidebarItem 
                icon={Map} 
                label="Predictive Map" 
                active={activeTab === 'map'} 
                onClick={() => onTabChange('map')}
              />
              <SidebarItem icon={Users} label="Agent Roster" active={activeTab === 'agents'} onClick={() => onTabChange('agents')} />
              <SidebarItem icon={ShieldAlert} label="Security Logs" active={activeTab === 'security'} onClick={() => onTabChange('security')} />
            </div>
          </div>
          
          <div style={{ marginTop: 'auto' }}>
            <p className="nav-section-label">System</p>
            <SidebarItem icon={Settings} label="System Settings" active={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
          </div>
        </aside>

        {/* Dashboard Content */}
        <section className="content-area">
          {children}
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
