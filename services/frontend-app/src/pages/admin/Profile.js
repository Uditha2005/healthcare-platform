import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import ThemeToggle from '../../components/ThemeToggle';

const navItems = [
  { icon:'🏠', label:'Dashboard', route:'/admin/dashboard' },
  { icon:'👥', label:'Manage Users', route:'/admin/users' },
  { icon:'✅', label:'Verify Doctors', route:'/admin/verify-doctors' },
  { icon:'👤', label:'My Profile', route:'/admin/profile' },
];

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = window.location.pathname;
  const [form, setForm] = useState({ name: user?.name||'', phone:'', department:'Platform Management' });
  const [passwords, setPasswords] = useState({ current:'', newPass:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase() || 'AD';

  const upd = e => setForm({ ...form, [e.target.name]: e.target.value });
  const updP = e => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSave = async e => {
    e.preventDefault(); setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    toast.success('Profile updated!');
    setSaving(false);
  };

  const handlePassword = async e => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match!'); return; }
    if (passwords.newPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setChangingPass(true);
    await new Promise(r => setTimeout(r, 600));
    toast.success('Password changed!');
    setPasswords({ current:'', newPass:'', confirm:'' });
    setChangingPass(false);
  };

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo"><span>⚕ Medi<em>Connect</em></span></div>
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
            <div className="dash-header-title">Admin Profile</div>
            <div className="dash-header-sub">Manage your account settings</div>
          </div>
          <div className="dash-header-right">
            <ThemeToggle />
            <div className="dash-user-avatar" style={{width:36,height:36,fontSize:'0.8rem',background:'linear-gradient(135deg,#4f46e5,#0891b2)'}}>{initials}</div>
          </div>
        </div>

        <div className="dash-content">
          {/* Profile hero */}
          <div style={{background:'white',borderRadius:'20px',border:'1px solid #e0f2fe',padding:'28px 32px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'24px',boxShadow:'0 4px 16px rgba(8,145,178,0.08)'}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,#4f46e5,#0891b2)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'1.5rem',fontFamily:"'Outfit',sans-serif",flexShrink:0}}>
              {initials}
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Outfit',sans-serif",fontSize:'1.4rem',fontWeight:800,color:'#0c1a2e'}}>{user?.name}</div>
              <div style={{fontSize:'0.85rem',color:'#64748b',marginTop:'3px'}}>{user?.email}</div>
              <div style={{display:'flex',gap:'8px',marginTop:'8px'}}>
                <span style={{background:'#ede9fe',color:'#5b21b6',borderRadius:'999px',padding:'3px 12px',fontSize:'0.75rem',fontWeight:700}}>Administrator</span>
                <span style={{background:'#d1fae5',color:'#065f46',borderRadius:'999px',padding:'3px 12px',fontSize:'0.75rem',fontWeight:700}}>🔒 Full Access</span>
              </div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:'0.75rem',color:'#94a3b8',marginBottom:'4px'}}>Last login</div>
              <div style={{fontSize:'0.85rem',fontWeight:600,color:'#0c1a2e'}}>Today, {new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div>
              <div style={{fontSize:'0.75rem',color:'#94a3b8',marginTop:'8px',marginBottom:'4px'}}>Member since</div>
              <div style={{fontSize:'0.85rem',fontWeight:600,color:'#0c1a2e'}}>{new Date().getFullYear()}</div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',alignItems:'start'}}>
            {/* Left — account info */}
            <div>
              <form onSubmit={handleSave}>
                <div style={sectionStyle}>
                  <div style={sectionTitle}>👤 Account Information</div>
                  <label className="hc-label">Full Name</label>
                  <input className="hc-input" name="name" value={form.name} onChange={upd} placeholder="Your full name" />
                  <label className="hc-label">Email Address</label>
                  <input className="hc-input" value={user?.email||''} disabled style={{opacity:0.6,cursor:'not-allowed'}} />
                  <label className="hc-label">Phone Number</label>
                  <input className="hc-input" name="phone" value={form.phone} onChange={upd} placeholder="+94 11 234 5678" />
                  <label className="hc-label">Department</label>
                  <input className="hc-input" name="department" value={form.department} onChange={upd} placeholder="e.g. Platform Management" />
                </div>
                <button className="hc-btn hc-btn-accent" type="submit" disabled={saving} style={{width:'100%',justifyContent:'center',padding:'12px',fontSize:'0.95rem'}}>
                  {saving ? 'Saving...' : '✓ Save Changes'}
                </button>
              </form>
            </div>

            {/* Right — security */}
            <div>
              <form onSubmit={handlePassword}>
                <div style={sectionStyle}>
                  <div style={sectionTitle}>🔒 Change Password</div>
                  <label className="hc-label">Current Password</label>
                  <input className="hc-input" type="password" name="current" value={passwords.current} onChange={updP} placeholder="••••••••" required />
                  <label className="hc-label">New Password</label>
                  <input className="hc-input" type="password" name="newPass" value={passwords.newPass} onChange={updP} placeholder="Min. 6 characters" required />
                  <label className="hc-label">Confirm New Password</label>
                  <input className="hc-input" type="password" name="confirm" value={passwords.confirm} onChange={updP} placeholder="Repeat new password" required />
                </div>
                <button className="hc-btn hc-btn-danger" type="submit" disabled={changingPass} style={{width:'100%',justifyContent:'center',padding:'12px',fontSize:'0.95rem'}}>
                  {changingPass ? 'Updating...' : '🔑 Update Password'}
                </button>
              </form>

              <div style={{...sectionStyle, marginTop:'16px', background:'linear-gradient(135deg,#f5f3ff,#ede9fe)', border:'1px solid #c4b5fd'}}>
                <div style={{...sectionTitle, color:'#5b21b6'}}>🛡️ Admin Permissions</div>
                {['Manage all users','Verify doctor accounts','Access all patient data','Platform configuration'].map(p => (
                  <div key={p} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px',fontSize:'0.85rem',color:'#4c1d95'}}>
                    <span style={{color:'#7c3aed',fontWeight:700}}>✓</span> {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const sectionStyle = { background:'white', borderRadius:'16px', border:'1px solid #e0f2fe', padding:'24px', marginBottom:'0', boxShadow:'0 2px 8px rgba(8,145,178,0.06)' };
const sectionTitle = { fontFamily:"'Outfit',sans-serif", fontSize:'0.95rem', fontWeight:700, color:'#0c1a2e', marginBottom:'16px', paddingBottom:'10px', borderBottom:'1px solid #e0f2fe' };

export default AdminProfile;