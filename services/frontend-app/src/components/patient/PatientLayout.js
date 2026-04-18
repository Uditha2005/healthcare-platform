import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon:'🏠', label:'Dashboard', route:'/patient/dashboard' },
  { icon:'📅', label:'Appointments', route:'/patient/appointments' },
  { icon:'🔍', label:'Find Doctors', route:'/patient/browse-doctors' },
  { icon:'🗂️', label:'Medical Records', route:'/patient/medical-records' },
  { icon:'📋', label:'Upload Reports', route:'/patient/upload-reports' },
  { icon:'🎥', label:'Video Consult', route:'/patient/video-consultation' },
  { icon:'👤', label:'My Profile', route:'/patient/profile' },
];

const PatientLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const currentPath = useLocation().pathname;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P';

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo">
          <span>⚕ Medi<em>Connect</em></span>
        </div>

        <div className="dash-user-card">
          <div className="dash-user-avatar">{initials}</div>
          <div className="dash-user-info">
            <strong>{user?.name}</strong>
            <span>Patient</span>
          </div>
        </div>

        <nav className="dash-nav">
          <div className="dash-nav-label">Navigation</div>
          {navItems.map(item => (
            <button
              key={item.route}
              className={`dash-nav-item ${currentPath === item.route ? 'active' : ''}`}
              onClick={() => navigate(item.route)}
            >
              <span className="dash-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          <button className="dash-logout-btn" onClick={() => { logout(); navigate('/login'); }}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      <main className="dash-main">
        {children}
      </main>
    </div>
  );
};

export default PatientLayout;
