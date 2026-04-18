import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';
import ThemeToggle from '../../components/ThemeToggle';

const navItems = [
  { icon:'🏠', label:'Dashboard', route:'/admin/dashboard' },
  { icon:'👥', label:'Manage Users', route:'/admin/users' },
  { icon:'✅', label:'Verify Doctors', route:'/admin/verify-doctors' },
];

const VerifyDoctors = () => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/auth/users')
      .then(res => setDoctors((res.data.users || []).filter(u => u.role === 'doctor')))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const verify = async (id, isVerified) => {
    try {
      await API.put(`/auth/users/${id}/verify`, { isVerified });
      toast.success(`Doctor ${isVerified ? 'verified' : 'unverified'}!`);
      setDoctors(doctors.map(d => d._id === id ? { ...d, isVerified } : d));
    } catch { toast.error('Failed to update verification'); }
  };

  const initials = name => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DR';
  const pending = doctors.filter(d => !d.isVerified).length;

  return (
    <div className="dash-shell">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo"><span>⚕ Medi<em>Connect</em></span></div>
        <div className="dash-user-card">
          <div className="dash-user-avatar" style={{background:'linear-gradient(135deg,#4f46e5,#0891b2)'}}>AD</div>
          <div className="dash-user-info"><strong>Admin</strong><span>Administrator</span></div>
        </div>
        <nav className="dash-nav">
          <div className="dash-nav-label">Admin Panel</div>
          {navItems.map(item => (
            <button key={item.route} className={`dash-nav-item ${currentPath===item.route?'active':''}`} onClick={() => navigate(item.route)}>
              <span className="dash-nav-icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="dash-sidebar-footer">
          <button className="dash-logout-btn" onClick={() => navigate('/admin/dashboard')}><span>←</span> Back to Dashboard</button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <div className="dash-header-title">Verify Doctors</div>
            <div className="dash-header-sub">{pending} pending verification · {doctors.length} total doctors</div>
          </div>
          <div className="dash-header-right">
            <ThemeToggle />
            {pending > 0 && (
              <span style={{background:'#ef4444',color:'white',borderRadius:'999px',padding:'4px 12px',fontSize:'0.75rem',fontWeight:700}}>
                {pending} Pending
              </span>
            )}
          </div>
        </div>

        <div className="dash-content">
          {loading ? (
            <div className="hc-empty">Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div className="hc-empty">
              <div style={{fontSize:'2.5rem',marginBottom:'12px'}}>👨‍⚕️</div>
              <p style={{fontWeight:600}}>No doctors registered yet</p>
            </div>
          ) : (
            <>
              {/* Pending section */}
              {pending > 0 && (
                <>
                  <div className="dash-section-title" style={{color:'#ef4444'}}>⏳ Pending Verification ({pending})</div>
                  <div className="dash-services" style={{marginBottom:'32px'}}>
                    {doctors.filter(d => !d.isVerified).map((doc, i) => (
                      <div key={i} className="dash-service-card hc-animate" style={{animationDelay:`${i*0.05}s`,borderLeft:'3px solid #ef4444'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'16px'}}>
                          <div style={{width:50,height:50,borderRadius:'50%',background:'linear-gradient(135deg,#94a3b8,#64748b)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'1rem',flexShrink:0}}>
                            {initials(doc.name)}
                          </div>
                          <div>
                            <div style={{fontWeight:700,fontSize:'0.95rem',color:'var(--text-primary)'}}>Dr. {doc.name}</div>
                            <div style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{doc.email}</div>
                            {doc.specialization && <div style={{fontSize:'0.78rem',color:'#0891b2',fontWeight:600,marginTop:'2px'}}>{doc.specialization}</div>}
                          </div>
                        </div>
                        <span className="hc-badge" style={{background:'#fee2e2',color:'#991b1b',marginBottom:'14px'}}>✕ Not Verified</span>
                        <button className="hc-btn hc-btn-success" style={{width:'100%',justifyContent:'center',padding:'11px'}} onClick={() => verify(doc._id, true)}>
                          ✓ Verify Doctor
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Verified section */}
              {doctors.filter(d => d.isVerified).length > 0 && (
                <>
                  <div className="dash-section-title" style={{color:'#10b981'}}>✅ Verified Doctors ({doctors.filter(d=>d.isVerified).length})</div>
                  <div className="dash-services">
                    {doctors.filter(d => d.isVerified).map((doc, i) => (
                      <div key={i} className="dash-service-card hc-animate" style={{animationDelay:`${i*0.05}s`,borderLeft:'3px solid #10b981'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'16px'}}>
                          <div style={{width:50,height:50,borderRadius:'50%',background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'1rem',flexShrink:0}}>
                            {initials(doc.name)}
                          </div>
                          <div>
                            <div style={{fontWeight:700,fontSize:'0.95rem',color:'var(--text-primary)'}}>Dr. {doc.name}</div>
                            <div style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{doc.email}</div>
                            {doc.specialization && <div style={{fontSize:'0.78rem',color:'#0891b2',fontWeight:600,marginTop:'2px'}}>{doc.specialization}</div>}
                          </div>
                        </div>
                        <span className="hc-badge" style={{background:'#d1fae5',color:'#065f46',marginBottom:'14px'}}>✓ Verified</span>
                        <button className="hc-btn hc-btn-danger" style={{width:'100%',justifyContent:'center',fontSize:'0.82rem'}} onClick={() => verify(doc._id, false)}>
                          ✕ Revoke Verification
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default VerifyDoctors;