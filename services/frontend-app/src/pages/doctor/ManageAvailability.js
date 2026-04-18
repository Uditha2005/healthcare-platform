import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const navItems = [
  { icon:'🏠', label:'Dashboard', route:'/doctor/dashboard' },
  { icon:'📅', label:'Appointments', route:'/doctor/appointments' },
  { icon:'🕐', label:'My Availability', route:'/doctor/availability' },
  { icon:'🎥', label:'Start Consultation', route:'/doctor/consultation' },
];

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const ManageAvailability = () => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const { user } = useAuth();
  const [slots, setSlots] = useState([{day:'Monday',startTime:'09:00',endTime:'17:00'}]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user?.id) {
      API.get(`/doctors/user/${user.id}`)
        .then(res => { if (res.data.availability?.length > 0) setSlots(res.data.availability); })
        .catch(() => {})
        .finally(() => setFetching(false));
    } else setFetching(false);
  }, [user]);

  const addSlot = () => setSlots([...slots, {day:'Monday',startTime:'09:00',endTime:'17:00'}]);
  const removeSlot = i => setSlots(slots.filter((_,idx) => idx !== i));
  const handleChange = (i, field, value) => { const u = [...slots]; u[i][field] = value; setSlots(u); };

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try { await API.put(`/doctors/user/${user.id}/availability`, {availability:slots}); toast.success('Availability updated!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setLoading(false); }
  };

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
            <div className="dash-header-title">Manage Availability</div>
            <div className="dash-header-sub">Set your weekly schedule for patient appointments</div>
          </div>
          <div className="dash-header-right"><button className="dash-notif-btn">🔔</button></div>
        </div>

        <div className="dash-content">
          <div style={{maxWidth:'760px'}}>
            {fetching ? <div className="hc-empty">Loading availability...</div> : (
              <form onSubmit={handleSubmit}>
                <div className="dash-section-title" style={{marginBottom:'16px'}}>🕐 Weekly Time Slots</div>
                <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'24px'}}>
                  {slots.map((slot, i) => (
                    <div key={i} style={{display:'flex',gap:'12px',alignItems:'center',background:'white',border:'1px solid #e0f2fe',borderRadius:'14px',padding:'16px 20px',flexWrap:'wrap',boxShadow:'0 2px 8px rgba(8,145,178,0.06)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px',marginRight:'4px'}}>
                        <span style={{fontSize:'1.1rem'}}>📆</span>
                        <select className="hc-input" style={{margin:0,flex:'1',minWidth:'140px',fontWeight:600}} value={slot.day} onChange={e => handleChange(i,'day',e.target.value)}>
                          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'10px',flex:1,minWidth:'260px'}}>
                        <input className="hc-input" style={{margin:0,flex:1}} type="time" value={slot.startTime} onChange={e => handleChange(i,'startTime',e.target.value)} />
                        <span style={{color:'#94a3b8',fontWeight:700,fontSize:'0.85rem',flexShrink:0}}>→</span>
                        <input className="hc-input" style={{margin:0,flex:1}} type="time" value={slot.endTime} onChange={e => handleChange(i,'endTime',e.target.value)} />
                      </div>
                      <button type="button" className="hc-btn hc-btn-danger" style={{padding:'9px 14px',fontSize:'0.85rem',flexShrink:0}} onClick={() => removeSlot(i)}>✕</button>
                    </div>
                  ))}
                </div>

                <div style={{display:'flex',gap:'12px'}}>
                  <button type="button" className="hc-btn hc-btn-accent" onClick={addSlot} style={{padding:'11px 20px'}}>+ Add Time Slot</button>
                  <button type="submit" className="hc-btn hc-btn-success" style={{flex:1,justifyContent:'center',padding:'11px',fontSize:'0.95rem'}} disabled={loading}>
                    {loading ? 'Saving...' : '✓ Save Availability'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageAvailability;