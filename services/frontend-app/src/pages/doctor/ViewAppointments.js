import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';
import ThemeToggle from '../../components/ThemeToggle';

const navItems = [
  { icon:'🏠', label:'Dashboard', route:'/doctor/dashboard' },
  { icon:'📅', label:'Appointments', route:'/doctor/appointments' },
  { icon:'🕐', label:'My Availability', route:'/doctor/availability' },
  { icon:'🎥', label:'Start Consultation', route:'/doctor/consultation' },
];

const statusClass = { pending:'hc-badge hc-badge-pending', confirmed:'hc-badge hc-badge-confirmed', cancelled:'hc-badge hc-badge-cancelled', completed:'hc-badge hc-badge-completed' };

const ViewAppointments = () => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    API.get('/appointment')
      .then(res => setAppointments(res.data || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/appointment/${id}/status`, { status });
      toast.success(`Appointment ${status}!`);
      setAppointments(appointments.map(a => a._id === id ? { ...a, status } : a));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const filtered = filterStatus === 'all' ? appointments : appointments.filter(a => a.status === filterStatus);

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo"><span>⚕ Medi<em>Connect</em></span></div>
        <div className="dash-user-card">
          <div className="dash-user-avatar" style={{background:'linear-gradient(135deg,#10b981,#6366f1)'}}>DR</div>
          <div className="dash-user-info"><strong>Doctor</strong><span>Doctor Portal</span></div>
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
          <button className="dash-logout-btn" onClick={() => navigate('/doctor/dashboard')}><span>←</span> Back to Dashboard</button>
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <div className="dash-header-title">My Appointments</div>
            <div className="dash-header-sub">{filtered.length} appointment{filtered.length !== 1 ? 's' : ''} shown</div>
          </div>
          <div className="dash-header-right">
            <ThemeToggle />
            {appointments.filter(a => a.status === 'pending').length > 0 && (
              <span style={{background:'#f59e0b',color:'white',borderRadius:'999px',padding:'4px 12px',fontSize:'0.75rem',fontWeight:700}}>
                {appointments.filter(a => a.status === 'pending').length} Pending
              </span>
            )}
          </div>
        </div>

        <div className="dash-content">
          {/* Filter tabs */}
          <div style={{display:'flex',gap:'8px',marginBottom:'24px',flexWrap:'wrap'}}>
            {['all','pending','confirmed','completed','cancelled'].map(f => (
              <button key={f} className={`hc-btn ${filterStatus===f?'hc-btn-primary':'hc-btn-ghost'}`} style={{padding:'8px 18px',fontSize:'0.82rem'}} onClick={() => setFilterStatus(f)}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
                <span style={{marginLeft:'6px',background:'rgba(255,255,255,0.25)',borderRadius:'999px',padding:'1px 7px',fontSize:'0.7rem'}}>
                  {f==='all'?appointments.length:appointments.filter(a=>a.status===f).length}
                </span>
              </button>
            ))}
          </div>

          {loading ? <div className="hc-empty">Loading appointments...</div>
          : filtered.length === 0 ? (
            <div className="hc-empty">
              <div style={{fontSize:'2.5rem',marginBottom:'12px'}}>📅</div>
              <p style={{fontWeight:600}}>No appointments found</p>
            </div>
          ) : (
            <div className="hc-grid-3">
              {filtered.map((apt, i) => (
                <div key={apt._id||i} className="dash-service-card hc-animate" style={{animationDelay:`${i*0.05}s`,cursor:'default'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#10b981,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'0.85rem',flexShrink:0}}>
                        {apt.patientName?.charAt(0)||'P'}
                      </div>
                      <div>
                        <div style={{fontWeight:700,fontSize:'0.95rem',color:'var(--text-primary)'}}>{apt.patientName||'Patient'}</div>
                        <div style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{apt.specialty||'—'}</div>
                      </div>
                    </div>
                    <span className={statusClass[apt.status]||'hc-badge'}>{apt.status}</span>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'16px'}}>
                    <div style={s.row}>📅 <span>{apt.date?new Date(apt.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'}</span></div>
                    <div style={s.row}>🕐 <span>{apt.time||'—'}</span></div>
                    {apt.notes && <div style={s.row}>📝 <span style={{fontSize:'0.8rem'}}>{apt.notes}</span></div>}
                  </div>
                  {apt.status === 'pending' && (
                    <div style={{display:'flex',gap:'8px',borderTop:'1px solid var(--border)',paddingTop:'14px'}}>
                      <button className="hc-btn hc-btn-success" style={{flex:1,justifyContent:'center',fontSize:'0.8rem'}} onClick={() => updateStatus(apt._id,'confirmed')}>✓ Accept</button>
                      <button className="hc-btn hc-btn-danger" style={{flex:1,justifyContent:'center',fontSize:'0.8rem'}} onClick={() => updateStatus(apt._id,'cancelled')}>✕ Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const s = { row:{display:'flex',gap:'8px',fontSize:'0.85rem',color:'var(--text-secondary)',alignItems:'flex-start'} };
export default ViewAppointments;