import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { toast } from 'react-toastify';

const navItems = [
  { icon:'🏠', label:'Dashboard', route:'/doctor/dashboard' },
  { icon:'📅', label:'Appointments', route:'/doctor/appointments' },
  { icon:'🕐', label:'My Availability', route:'/doctor/availability' },
  { icon:'🎥', label:'Start Consultation', route:'/doctor/consultation' },
  { icon:'👤', label:'My Profile', route:'/doctor/profile' },
];

const empty = {
  specialization:'', licenseNumber:'', experience:'', consultationFee:'',
  hospital:'', phone:'', bio:''
};

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = window.location.pathname;
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [stats, setStats] = useState({ total:0, completed:0, pending:0 });
  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase() || 'DR';

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    API.get(`/doctors/user/${user.id}`)
      .then(res => {
        const d = res.data || {};
        setIsVerified(d.isVerified || false);
        setForm({
          specialization: d.specialization||'', licenseNumber: d.licenseNumber||'',
          experience: d.experience||'', consultationFee: d.consultationFee||'',
          hospital: d.hospital||'', phone: d.phone||'', bio: d.bio||''
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    API.get('/appointment').then(res => {
      const apts = res.data || [];
      setStats({
        total: apts.length,
        completed: apts.filter(a=>a.status==='completed').length,
        pending: apts.filter(a=>a.status==='pending').length,
      });
    }).catch(()=>{});
  }, [user]);

  const upd = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await API.put(`/doctors/user/${user.id}`, form);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

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
          <button className="dash-logout-btn" onClick={() => { logout(); navigate('/login'); }}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <div className="dash-header-title">My Profile</div>
            <div className="dash-header-sub">Manage your professional information</div>
          </div>
          <div className="dash-header-right">
            <button className="dash-notif-btn">🔔</button>
            <div className="dash-user-avatar" style={{width:36,height:36,fontSize:'0.8rem',background:'linear-gradient(135deg,#10b981,#6366f1)'}}>{initials}</div>
          </div>
        </div>

        <div className="dash-content">
          {/* Profile hero */}
          <div style={{background:'white',borderRadius:'20px',border:'1px solid #e0f2fe',padding:'28px 32px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'24px',boxShadow:'0 4px 16px rgba(8,145,178,0.08)'}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,#10b981,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'1.5rem',fontFamily:"'Outfit',sans-serif",flexShrink:0}}>
              {initials}
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Outfit',sans-serif",fontSize:'1.4rem',fontWeight:800,color:'#0c1a2e'}}>Dr. {user?.name}</div>
              <div style={{fontSize:'0.85rem',color:'#64748b',marginTop:'3px'}}>{user?.email}</div>
              <div style={{display:'flex',gap:'8px',marginTop:'8px',flexWrap:'wrap'}}>
                <span style={{background:'#f0fdf4',color:'#065f46',borderRadius:'999px',padding:'3px 12px',fontSize:'0.75rem',fontWeight:700}}>Doctor</span>
                <span style={{background: isVerified?'#d1fae5':'#fee2e2', color: isVerified?'#065f46':'#991b1b', borderRadius:'999px',padding:'3px 12px',fontSize:'0.75rem',fontWeight:700}}>
                  {isVerified ? '✓ Verified' : '✕ Not Verified'}
                </span>
                {form.specialization && <span style={{background:'#eff6ff',color:'#1e40af',borderRadius:'999px',padding:'3px 12px',fontSize:'0.75rem',fontWeight:700}}>{form.specialization}</span>}
              </div>
            </div>
            <div style={{display:'flex',gap:'24px',flexShrink:0}}>
              {[{label:'Total Patients',value:stats.total,icon:'👥'},{label:'Completed',value:stats.completed,icon:'✅'},{label:'Pending',value:stats.pending,icon:'⏳'}].map(s => (
                <div key={s.label} style={{textAlign:'center'}}>
                  <div style={{fontSize:'1.6rem',fontWeight:800,fontFamily:"'Outfit',sans-serif",color:'#0c1a2e'}}>{s.value}</div>
                  <div style={{fontSize:'0.72rem',color:'#94a3b8',marginTop:'2px'}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {loading ? <div className="hc-empty">Loading profile...</div> : (
            <form onSubmit={handleSubmit}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',alignItems:'start'}}>
                {/* Left */}
                <div>
                  <div style={sectionStyle}>
                    <div style={sectionTitle}>🩺 Professional Details</div>
                    <label className="hc-label">Specialization</label>
                    <input className="hc-input" name="specialization" placeholder="e.g. Cardiologist" value={form.specialization} onChange={upd} />
                    <label className="hc-label">SLMC License Number</label>
                    <input className="hc-input" name="licenseNumber" placeholder="e.g. SLMC/2018/4512" value={form.licenseNumber} onChange={upd} />
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                      <div>
                        <label className="hc-label">Experience (years)</label>
                        <input className="hc-input" name="experience" type="number" min="0" placeholder="e.g. 8" value={form.experience} onChange={upd} />
                      </div>
                      <div>
                        <label className="hc-label">Consultation Fee (LKR)</label>
                        <input className="hc-input" name="consultationFee" type="number" min="0" placeholder="e.g. 2500" value={form.consultationFee} onChange={upd} />
                      </div>
                    </div>
                    <label className="hc-label">Hospital / Clinic</label>
                    <input className="hc-input" name="hospital" placeholder="e.g. Nawaloka Hospital" value={form.hospital} onChange={upd} />
                  </div>
                </div>

                {/* Right */}
                <div>
                  <div style={sectionStyle}>
                    <div style={sectionTitle}>📞 Contact & Bio</div>
                    <label className="hc-label">Phone Number</label>
                    <input className="hc-input" name="phone" placeholder="+94 71 234 5678" value={form.phone} onChange={upd} />
                    <label className="hc-label">About / Bio</label>
                    <textarea className="hc-input" name="bio" placeholder="Brief description about your expertise and practice..." value={form.bio} onChange={upd} style={{minHeight:'120px'}} />
                  </div>

                  {!isVerified && (
                    <div style={{...sectionStyle, background:'#fff7ed', border:'1px solid #fed7aa'}}>
                      <div style={{...sectionTitle, color:'#92400e'}}>⏳ Verification Pending</div>
                      <p style={{fontSize:'0.85rem',color:'#b45309',lineHeight:1.6}}>Your account is awaiting admin verification. You will be able to accept patient appointments once verified.</p>
                    </div>
                  )}
                </div>
              </div>

              <button className="hc-btn hc-btn-success" type="submit" disabled={saving} style={{marginTop:'20px',width:'100%',justifyContent:'center',padding:'14px',fontSize:'1rem'}}>
                {saving ? 'Saving...' : '✓ Save Profile'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

const sectionStyle = { background:'white', borderRadius:'16px', border:'1px solid #e0f2fe', padding:'24px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(8,145,178,0.06)' };
const sectionTitle = { fontFamily:"'Outfit',sans-serif", fontSize:'0.95rem', fontWeight:700, color:'#0c1a2e', marginBottom:'16px', paddingBottom:'10px', borderBottom:'1px solid #e0f2fe' };

export default DoctorProfile;