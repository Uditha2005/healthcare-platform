import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AISymptomChatWidget from '../../components/patient/AISymptomChatWidget';
import ThemeToggle from '../../components/ThemeToggle';
import API from '../../services/api';

const services = [
  { icon:'🔍', label:'Find Doctors', desc:'Browse specialists and book appointments instantly', btn:'Browse Now', route:'/patient/browse-doctors', bg:'#eff6ff', accent:'#3b82f6' },
  { icon:'📅', label:'My Appointments', desc:'View, reschedule or cancel your upcoming visits', btn:'View All', route:'/patient/appointments', bg:'#ecfeff', accent:'#0891b2' },
  { icon:'🗂️', label:'Medical Records', desc:'Access your full health history, prescriptions and lab reports', btn:'Open Records', route:'/patient/medical-records', bg:'#f0fdf4', accent:'#10b981' },
  { icon:'📋', label:'Upload Reports', desc:'Securely upload and store your medical documents', btn:'Upload', route:'/patient/upload-reports', bg:'#fff7ed', accent:'#f59e0b' },
  { icon:'🎥', label:'Video Consult', desc:'Join a live telemedicine session with your doctor', btn:'Join Now', route:'/patient/video-consultation', bg:'#fdf4ff', accent:'#a855f7' },
  { icon:'👤', label:'My Profile', desc:'Keep your personal and emergency contact details updated', btn:'Edit Profile', route:'/patient/profile', bg:'#fef2f2', accent:'#ef4444' },
];

const HeroSVG = () => (
  <svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" style={{width:260,height:180}}>
    <circle cx="140" cy="52" r="32" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
    <circle cx="140" cy="42" r="16" fill="rgba(255,255,255,0.25)"/>
    <path d="M106 100 Q106 78 140 78 Q174 78 174 100 L180 140 Q180 150 140 150 Q100 150 100 140 Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
    <rect x="128" y="108" width="26" height="9" rx="4.5" fill="rgba(255,255,255,0.55)"/>
    <rect x="136" y="100" width="9" height="26" rx="4.5" fill="rgba(255,255,255,0.55)"/>
    <path d="M116 108 Q107 125 112 142 Q118 160 140 160 Q162 160 168 142 Q173 125 164 108" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="140" cy="163" r="9" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5"/>
    <circle cx="140" cy="163" r="4.5" fill="rgba(255,255,255,0.35)"/>
    <polyline points="30,178 55,178 67,155 80,195 95,162 106,178 220,178" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="67" cy="155" r="3.5" fill="rgba(255,255,255,0.7)"/>
    <circle cx="95" cy="162" r="3.5" fill="rgba(255,255,255,0.7)"/>
    <rect x="22" y="88" width="24" height="11" rx="5.5" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
    <line x1="34" y1="88" x2="34" y2="99" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
    <rect x="220" y="65" width="24" height="11" rx="5.5" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" transform="rotate(-25 232 70)"/>
    <circle cx="44" cy="48" r="3" fill="rgba(255,255,255,0.3)"/>
    <circle cx="242" cy="110" r="2.5" fill="rgba(255,255,255,0.25)"/>
    <circle cx="35" cy="145" r="2" fill="rgba(255,255,255,0.2)"/>
    <circle cx="250" cy="148" r="3" fill="rgba(255,255,255,0.2)"/>
    <path d="M258 28 Q268 40 258 52 Q248 64 258 76" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M268 28 Q258 40 268 52 Q278 64 268 76" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round"/>
    <line x1="258" y1="40" x2="268" y2="40" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5"/>
    <line x1="258" y1="52" x2="268" y2="52" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5"/>
    <line x1="258" y1="64" x2="268" y2="64" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5"/>
  </svg>
);

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);
  const [stats, setStats] = useState([
    { icon:'📅', label:'Appointments', value:'0', bg:'#eff6ff', iconBg:'#dbeafe' },
    { icon:'💊', label:'Prescriptions', value:'0', bg:'#f0fdf4', iconBg:'#d1fae5' },
    { icon:'📋', label:'Reports', value:'0', bg:'#fff7ed', iconBg:'#fed7aa' },
    { icon:'🎥', label:'Consultations', value:'0', bg:'#fdf4ff', iconBg:'#ede9fe' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [aptsRes, prescRes, reportsRes] = await Promise.all([
          API.get('/appointments').catch(() => ({ data: [] })),
          API.get('/patient/prescriptions').catch(() => ({ data: [] })),
          API.get('/patient/reports').catch(() => ({ data: [] })),
        ]);
        const appointments = Array.isArray(aptsRes.data) ? aptsRes.data : [];
        const prescriptions = Array.isArray(prescRes.data) ? prescRes.data : (prescRes.data?.prescriptions || []);
        const reports = Array.isArray(reportsRes.data) ? reportsRes.data : (reportsRes.data?.reports || []);
        const consultations = appointments.filter(a => a.status === 'completed').length;
        setStats([
          { icon:'📅', label:'Appointments', value: String(appointments.length), bg:'#eff6ff', iconBg:'#dbeafe' },
          { icon:'💊', label:'Prescriptions', value: String(prescriptions.length), bg:'#f0fdf4', iconBg:'#d1fae5' },
          { icon:'📋', label:'Reports', value: String(reports.length), bg:'#fff7ed', iconBg:'#fed7aa' },
          { icon:'🎥', label:'Consultations', value: String(consultations), bg:'#fdf4ff', iconBg:'#ede9fe' },
        ]);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      }
    };
    fetchStats();
  }, []);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
        <div className="dash-header">
          <div>
            <div className="dash-header-title">Patient Dashboard</div>
            <div className="dash-header-sub">{new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</div>
          </div>
          <div className="dash-header-right">
            <ThemeToggle />
            <div className="dash-user-avatar" style={{width:36,height:36,fontSize:'0.8rem'}}>{initials}</div>
          </div>
        </div>

        <div className="dash-content">

          {/* Hero */}
          <div className="dash-hero hc-animate">
            <div className="dash-hero-text">
              <div className="dash-hero-eyebrow">✦ Patient Portal</div>
              <h1>{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
              <p>Your health, managed in one place. Book appointments, consult doctors, and access your records anytime.</p>
              <div className="dash-hero-actions">
                <button className="dash-hero-btn dash-hero-btn-primary" onClick={() => navigate('/patient/browse-doctors')}>
                  🔍 Find a Doctor
                </button>
                <button className="dash-hero-btn dash-hero-btn-ghost" onClick={() => navigate('/patient/appointments')}>
                  📅 My Appointments
                </button>
              </div>
            </div>
            <div className="dash-hero-visual">
              <HeroSVG />
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
          <div className="dash-section-title hc-animate" style={{animationDelay:'0.15s'}}>Quick Access</div>
          <div className="dash-services">
            {services.map((svc, i) => (
              <div
                key={svc.label}
                className="dash-service-card hc-animate"
                style={{animationDelay:`${0.15 + i * 0.06}s`}}
                onClick={() => navigate(svc.route)}
              >
                <div className="dash-service-icon-wrap" style={{background: svc.bg}}>
                  {svc.icon}
                </div>
                <div className="dash-service-title">{svc.label}</div>
                <div className="dash-service-desc">{svc.desc}</div>
                <div className="dash-service-arrow" style={{color: svc.accent}}>
                  {svc.btn} <span>→</span>
                </div>
              </div>
            ))}
          </div>

          {/* Health tip + AI strip */}
          <div className="dash-info-strip hc-animate" style={{animationDelay:'0.5s'}}>
            <div className="dash-info-card">
              <div className="dash-info-card-header">
                <div className="dash-info-card-title">💡 Health Tip</div>
              </div>
              <p style={{fontSize:'0.9rem',color:'var(--text-secondary)',lineHeight:1.6}}>Stay hydrated! Drinking 8 glasses of water daily helps your kidneys function properly and keeps your skin healthy.</p>
            </div>
            <div className="dash-info-card">
              <div className="dash-info-card-header">
                <div className="dash-info-card-title">🩺 AI Symptom Checker</div>
              </div>
              <p style={{fontSize:'0.9rem',color:'var(--text-secondary)',lineHeight:1.6,marginBottom:'14px'}}>Describe your symptoms to our AI and get instant guidance on next steps.</p>
              {/* This button now opens the AI widget */}
              <button
                className="hc-btn hc-btn-accent"
                style={{fontSize:'0.82rem',padding:'8px 16px'}}
                onClick={() => setAiOpen(true)}
              >
                Check Symptoms →
              </button>
            </div>
          </div>

        </div>

      {/* AI widget — controlled by aiOpen state */}
      <AISymptomChatWidget open={aiOpen} setOpen={setAiOpen} />
    </>
  );
};

export default PatientDashboard;