import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const navItems = [
  { icon:'🏠', label:'Dashboard', route:'/admin/dashboard' },
  { icon:'👥', label:'Manage Users', route:'/admin/users' },
  { icon:'✅', label:'Verify Doctors', route:'/admin/verify-doctors' },
];

const roleStyle = {
  patient: { background:'#dbeafe', color:'#1e40af' },
  doctor:  { background:'#d1fae5', color:'#065f46' },
  admin:   { background:'#ede9fe', color:'#5b21b6' },
};

const ManageUsers = () => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    API.get('/auth/users')
      .then(res => setUsers(res.data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const deleteUser = async id => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/auth/users/${id}`);
      toast.success('User deleted!');
      setUsers(users.filter(u => u._id !== id));
    } catch { toast.error('Failed to delete user'); }
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

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
          <button className="dash-logout-btn" onClick={() => navigate('/admin/dashboard')}><span>← </span>Back to Dashboard</button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <div className="dash-header-title">Manage Users</div>
            <div className="dash-header-sub">{filtered.length} user{filtered.length !== 1 ? 's' : ''} shown</div>
          </div>
          <div className="dash-header-right">
            <button className="dash-notif-btn">🔔</button>
          </div>
        </div>

        <div className="dash-content">
          {/* Filter tabs */}
          <div style={{display:'flex',gap:'8px',marginBottom:'24px',flexWrap:'wrap'}}>
            {['all','patient','doctor','admin'].map(f => (
              <button key={f}
                className={`hc-btn ${filter===f?'hc-btn-primary':'hc-btn-ghost'}`}
                style={{padding:'8px 20px',fontSize:'0.85rem'}}
                onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
                {f !== 'all' && <span style={{marginLeft:'6px',background:'rgba(255,255,255,0.25)',borderRadius:'999px',padding:'1px 7px',fontSize:'0.72rem'}}>
                  {users.filter(u => u.role===f).length}
                </span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="hc-empty">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="hc-empty"><div style={{fontSize:'2.5rem',marginBottom:'12px'}}>👥</div><p>No users found.</p></div>
          ) : (
            <div style={{background:'white',borderRadius:'18px',border:'1px solid #e0f2fe',boxShadow:'0 4px 20px rgba(8,145,178,0.08)',overflow:'hidden'}}>
              {/* Table header */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 2fr 120px 110px',padding:'14px 28px',background:'#f8fafc',borderBottom:'1px solid #e0f2fe'}}>
                {['Name','Email','Role','Action'].map(h => (
                  <span key={h} style={{fontSize:'0.72rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</span>
                ))}
              </div>
              {/* Rows */}
              {filtered.map((user, i) => (
                <div key={i}
                  style={{display:'grid',gridTemplateColumns:'1fr 2fr 120px 110px',padding:'16px 28px',borderTop:'1px solid #f0f9ff',alignItems:'center',transition:'background 0.15s',cursor:'default'}}
                  onMouseEnter={e => e.currentTarget.style.background='#f0f9ff'}
                  onMouseLeave={e => e.currentTarget.style.background='white'}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#0891b2,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'0.72rem',flexShrink:0}}>
                      {user.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                    </div>
                    <span style={{fontWeight:600,fontSize:'0.9rem',color:'#0c1a2e'}}>{user.name}</span>
                  </div>
                  <span style={{fontSize:'0.85rem',color:'#64748b',wordBreak:'break-all'}}>{user.email}</span>
                  <span><span className="hc-badge" style={roleStyle[user.role]}>{user.role}</span></span>
                  <button className="hc-btn hc-btn-danger" style={{padding:'7px 14px',fontSize:'0.78rem'}} onClick={() => deleteUser(user._id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageUsers;