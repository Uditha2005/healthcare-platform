import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const navItems = [
  { icon:'👤', label:'My Profile', route:'/admin/profile' },
  { icon:'🏠', label:'Dashboard', route:'/admin/dashboard' },
  { icon:'👥', label:'Manage Users', route:'/admin/users' },
  { icon:'✅', label:'Verify Doctors', route:'/admin/verify-doctors' },
];

const services = [
  { icon:'👥', label:'Manage Users', desc:'View, manage and delete all patient, doctor and admin accounts', btn:'View Users', route:'/admin/users', bg:'#eff6ff', accent:'#3b82f6' },
  { icon:'✅', label:'Verify Doctors', desc:'Review pending doctor registrations and approve or reject them', btn:'Verify Now', route:'/admin/verify-doctors', bg:'#f0fdf4', accent:'#10b981' },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const [stats, setStats] = useState([
    { icon:'👥', label:'Total Users', value:'...', iconBg:'#dbeafe' },
    { icon:'👨‍⚕️', label:'Doctors', value:'...', iconBg:'#d1fae5' },
    { icon:'🧑', label:'Patients', value:'...', iconBg:'#ede9fe' },
    { icon:'⏳', label:'Pending Verify', value:'...', iconBg:'#fed7aa' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/auth/users');
        const users = res.data;
        const total = users.length;
        const doctors = users.filter(u => u.role === 'doctor').length;
        const patients = users.filter(u => u.role === 'patient').length;
        const pendingVerify = users.filter(u => u.role === 'doctor' && !u.isVerified).length;
        setStats([
          { icon:'👥', label:'Total Users', value: String(total), iconBg:'#dbeafe' },
          { icon:'👨‍⚕️', label:'Doctors', value: String(doctors), iconBg:'#d1fae5' },
          { icon:'🧑', label:'Patients', value: String(patients), iconBg:'#ede9fe' },
          { icon:'⏳', label:'Pending Verify', value: String(pendingVerify), iconBg:'#fed7aa' },
        ]);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dash-shell">
      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo">
          <span>⚕ Medi<em>Connect</em></span>
        </div>

        <div className="dash-user-card">
          <div className="dash-user-avatar" style={{background:'linear-gradient(135deg,#4f46e5,#0891b2)'}}>{initials}</div>
          <div className="dash-user-info">
            <strong>{user?.name}</strong>
            <span>Administrator</span>
          </div>
        </div>

        <nav className="dash-nav">
          <div className="dash-nav-label">Admin Panel</div>
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
          <button className="dash-logout-btn" onClick={handleLogout}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="dash-main">
        {/* Header */}
        <div className="dash-header">
          <div>
            <div className="dash-header-title">Admin Control Panel</div>
            <div className="dash-header-sub">{new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</div>
          </div>
          <div className="dash-header-right">
            <button className="dash-notif-btn">🔔</button>
            <div className="dash-user-avatar" style={{width:36,height:36,fontSize:'0.8rem',background:'linear-gradient(135deg,#4f46e5,#0891b2)'}}>{initials}</div>
          </div>
        </div>

        {/* Content */}
        <div className="dash-content">

          {/* Hero */}
          <div className="dash-hero hc-animate" style={{background:'linear-gradient(135deg,#312e81 0%,#4f46e5 50%,#0891b2 100%)'}}>
            <div className="dash-hero-text">
              <div className="dash-hero-eyebrow">🛡️ Admin Portal</div>
              <h1>{greeting}, {user?.name?.split(' ')[0]}!</h1>
              <p>Manage your platform — review users, verify doctors, and keep everything running smoothly.</p>
              <div className="dash-hero-actions">
                <button className="dash-hero-btn dash-hero-btn-primary" onClick={() => navigate('/admin/users')}>
                  👥 Manage Users
                </button>
                <button className="dash-hero-btn dash-hero-btn-ghost" onClick={() => navigate('/admin/verify-doctors')}>
                  ✅ Verify Doctors
                </button>
              </div>
            </div>
            <div className="dash-hero-visual">
              <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" style={{width:220,height:160}}>
                {/* Shield */}
                <path d="M120 20 L170 45 L170 95 Q170 140 120 160 Q70 140 70 95 L70 45 Z" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                <path d="M120 35 L158 55 L158 98 Q158 132 120 148 Q82 132 82 98 L82 55 Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                {/* Checkmark */}
                <polyline points="100,95 115,110 142,80" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                {/* People icons */}
                <circle cx="35" cy="60" r="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
                <circle cx="35" cy="55" r="6" fill="rgba(255,255,255,0.2)"/>
                <path d="M20 78 Q20 68 35 68 Q50 68 50 78" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
                <circle cx="205" cy="60" r="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
                <circle cx="205" cy="55" r="6" fill="rgba(255,255,255,0.2)"/>
                <path d="M190 78 Q190 68 205 68 Q220 68 220 78" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
                {/* Dots */}
                <circle cx="35" cy="130" r="3" fill="rgba(255,255,255,0.25)"/>
                <circle cx="205" cy="130" r="3" fill="rgba(255,255,255,0.25)"/>
                <circle cx="120" cy="175" r="2.5" fill="rgba(255,255,255,0.2)"/>
              </svg>
            </div>
          </div>

          {/* Stats */}
          <div className="dash-stats hc-animate" style={{animationDelay:'0.1s'}}>
            {stats.map((s, i) => (
              <div key={i} className="dash-stat-card">
                <div className="dash-stat-icon" style={{background: s.iconBg}}>{s.icon}</div>
                <div className="dash-stat-info">
                  <div className="dash-stat-value">{s.value}</div>
                  <div className="dash-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Services */}
          <div className="dash-section-title hc-animate" style={{animationDelay:'0.15s'}}>Admin Actions</div>
          <div className="dash-services" style={{gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))'}}>
            {services.map((svc, i) => (
              <div
                key={svc.label}
                className="dash-service-card hc-animate"
                style={{animationDelay:`${0.2 + i * 0.08}s`}}
                onClick={() => navigate(svc.route)}
              >
                <div className="dash-service-icon-wrap" style={{background: svc.bg, fontSize:'1.8rem', width:60, height:60}}>
                  {svc.icon}
                </div>
                <div className="dash-service-title" style={{fontSize:'1.1rem'}}>{svc.label}</div>
                <div className="dash-service-desc">{svc.desc}</div>
                <div className="dash-service-arrow" style={{color: svc.accent}}>
                  {svc.btn} <span>→</span>
                </div>
              </div>
            ))}
          </div>

          {/* Info strip */}
          <div className="dash-info-strip hc-animate" style={{animationDelay:'0.4s'}}>
            <div className="dash-info-card">
              <div className="dash-info-card-header">
                <div className="dash-info-card-title">📌 Platform Note</div>
              </div>
              <p style={{fontSize:'0.9rem',color:'var(--text-secondary)',lineHeight:1.6}}>New doctor registrations require manual verification before they can accept appointments. Check the Verify Doctors section regularly.</p>
            </div>
            <div className="dash-info-card">
              <div className="dash-info-card-header">
                <div className="dash-info-card-title">🔒 Security</div>
              </div>
              <p style={{fontSize:'0.9rem',color:'var(--text-secondary)',lineHeight:1.6}}>All user data is encrypted and access is role-based. Only verified administrators can access this panel.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;