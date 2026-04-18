import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ThemeToggle from '../../components/ThemeToggle';

const navItems = [
  { icon:'🏠', label:'Dashboard', route:'/doctor/dashboard' },
  { icon:'📅', label:'Appointments', route:'/doctor/appointments' },
  { icon:'🕐', label:'My Availability', route:'/doctor/availability' },
  { icon:'🎥', label:'Start Consultation', route:'/doctor/consultation' },
  { icon:'👤', label:'My Profile', route:'/doctor/profile' },
];

const services = [
  { icon:'📅', label:'My Appointments', desc:"View and manage today's patient appointments", btn:'View Appointments', route:'/doctor/appointments', bg:'#eff6ff', accent:'#3b82f6' },
  { icon:'🕐', label:'My Availability', desc:'Set your weekly schedule and time slots', btn:'Set Availability', route:'/doctor/availability', bg:'#ecfeff', accent:'#0891b2' },
  { icon:'💊', label:'Prescriptions', desc:'Issue digital prescriptions to your patients', btn:'Write Prescription', route:'/doctor/consultation', bg:'#f0fdf4', accent:'#10b981' },
  { icon:'🎥', label:'Start Consultation', desc:'Begin a live telemedicine video session', btn:'Start Session', route:'/doctor/consultation', bg:'#fdf4ff', accent:'#a855f7' },
];

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const [stats, setStats] = useState([
    { icon:'📅', label:'Today\'s Appointments', value:'...', iconBg:'#dbeafe' },
    { icon:'✅', label:'Completed', value:'...', iconBg:'#d1fae5' },
    { icon:'⏳', label:'Pending', value:'...', iconBg:'#fed7aa' },
    { icon:'👥', label:'Total Patients', value:'...', iconBg:'#ede9fe' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/appointments');
        const appointments = res.data;
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = appointments.filter(a => a.date && a.date.startsWith(today)).length;
        const completed = appointments.filter(a => a.status === 'completed').length;
        const pending = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
        const uniquePatients = new Set(appointments.map(a => a.patientId)).size;
        setStats([
          { icon:'📅', label:'Today\'s Appointments', value: String(todayAppts), iconBg:'#dbeafe' },
          { icon:'✅', label:'Completed', value: String(completed), iconBg:'#d1fae5' },
          { icon:'⏳', label:'Pending', value: String(pending), iconBg:'#fed7aa' },
          { icon:'👥', label:'Total Patients', value: String(uniquePatients), iconBg:'#ede9fe' },
        ]);
      } catch (err) {
        console.error('Failed to fetch doctor stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo"><span>⚕ Medi<em>Connect</em></span></div>
        <div className="dash-user-card">
          <div className="dash-user-avatar" style={{background:'linear-gradient(135deg,#10b981,#6366f1)'}}>{initials}</div>
          <div className="dash-user-info">
            <strong>Dr. {user?.name}</strong>
            <span>Doctor</span>
          </div>
        </div>
        <nav className="dash-nav">
          <div className="dash-nav-label">Doctor Panel</div>
          {navItems.map(item => (
            <button key={item.route} className={`dash-nav-item ${currentPath===item.route?'active':''}`} onClick={() => navigate(item.route)}>
              <span className="dash-nav-icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="dash-sidebar-footer">
          <button className="dash-logout-btn" onClick={handleLogout}><span>🚪</span> Sign Out</button>
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <div className="dash-header-title">Doctor Dashboard</div>
            <div className="dash-header-sub">{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
          </div>
          <div className="dash-header-right">
            <ThemeToggle />
            <div className="dash-user-avatar" style={{width:36,height:36,fontSize:'0.8rem',background:'linear-gradient(135deg,#10b981,#6366f1)'}}>{initials}</div>
          </div>
        </div>

        <div className="dash-content">
          {/* Hero */}
          <div className="dash-hero hc-animate" style={{background:'linear-gradient(135deg,#065f46 0%,#10b981 50%,#6366f1 100%)'}}>
            <div className="dash-hero-text">
              <div className="dash-hero-eyebrow">🩺 Doctor Portal</div>
              <h1>{greeting}, Dr. {user?.name?.split(' ')[0]}! 👋</h1>
              <p>Manage your appointments, set your availability, and start telemedicine consultations — all in one place.</p>
              <div className="dash-hero-actions">
                <button className="dash-hero-btn dash-hero-btn-primary" onClick={() => navigate('/doctor/appointments')}>📅 View Appointments</button>
                <button className="dash-hero-btn dash-hero-btn-ghost" onClick={() => navigate('/doctor/consultation')}>🎥 Start Consultation</button>
              </div>
            </div>
            <div className="dash-hero-visual">
              <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" style={{width:220,height:160}}>
                <circle cx="120" cy="52" r="30" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                <circle cx="120" cy="43" r="15" fill="rgba(255,255,255,0.25)"/>
                <path d="M88 96 Q88 76 120 76 Q152 76 152 96 L157 132 Q157 142 120 142 Q83 142 83 132 Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5"/>
                <rect x="109" y="103" width="24" height="8" rx="4" fill="rgba(255,255,255,0.55)"/>
                <rect x="117" y="95" width="8" height="24" rx="4" fill="rgba(255,255,255,0.55)"/>
                <path d="M100 103 Q92 118 97 134 Q103 152 120 152 Q137 152 143 134 Q148 118 140 103" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="120" cy="155" r="8" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5"/>
                <circle cx="120" cy="155" r="4" fill="rgba(255,255,255,0.35)"/>
                <polyline points="28,170 50,170 62,150 75,185 88,155 98,170 210,170" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="62" cy="150" r="3" fill="rgba(255,255,255,0.65)"/>
                <circle cx="88" cy="155" r="3" fill="rgba(255,255,255,0.65)"/>
                <circle cx="38" cy="48" r="3" fill="rgba(255,255,255,0.25)"/>
                <circle cx="210" cy="80" r="2.5" fill="rgba(255,255,255,0.2)"/>
              </svg>
            </div>
          </div>

          {/* Stats */}
          <div className="dash-stats hc-animate" style={{animationDelay:'0.1s'}}>
            {stats.map((st, i) => (
              <div key={i} className="dash-stat-card">
                <div className="dash-stat-icon" style={{background:st.iconBg}}>{st.icon}</div>
                <div className="dash-stat-info">
                  <div className="dash-stat-value">{st.value}</div>
                  <div className="dash-stat-label">{st.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Services */}
          <div className="dash-section-title hc-animate" style={{animationDelay:'0.15s'}}>Quick Access</div>
          <div className="dash-services">
            {services.map((svc, i) => (
              <div key={svc.label} className="dash-service-card hc-animate" style={{animationDelay:`${0.15+i*0.06}s`}} onClick={() => navigate(svc.route)}>
                <div className="dash-service-icon-wrap" style={{background:svc.bg}}>{svc.icon}</div>
                <div className="dash-service-title">{svc.label}</div>
                <div className="dash-service-desc">{svc.desc}</div>
                <div className="dash-service-arrow" style={{color:svc.accent}}>{svc.btn} <span>→</span></div>
              </div>
            ))}
          </div>

          {/* Info strip */}
          <div className="dash-info-strip hc-animate" style={{animationDelay:'0.45s'}}>
            <div className="dash-info-card">
              <div className="dash-info-card-header"><div className="dash-info-card-title">💡 Reminder</div></div>
              <p style={{fontSize:'0.9rem',color:'var(--text-secondary)',lineHeight:1.6}}>Keep your availability up to date so patients can book appointments with you at the right times.</p>
            </div>
            <div className="dash-info-card">
              <div className="dash-info-card-header"><div className="dash-info-card-title">🎥 Telemedicine</div></div>
              <p style={{fontSize:'0.9rem',color:'var(--text-secondary)',lineHeight:1.6,marginBottom:'14px'}}>Only confirmed appointments appear in the consultation panel. Accept pending appointments first.</p>
              <button className="hc-btn hc-btn-success" style={{fontSize:'0.82rem',padding:'8px 16px'}} onClick={() => navigate('/doctor/appointments')}>View Pending →</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;