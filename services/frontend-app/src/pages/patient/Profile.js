import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { toast } from 'react-toastify';

const empty = {
  phone:'', address:'', dateOfBirth:'', gender:'', bloodType:'',
  emergencyContact:{ name:'', phone:'', relationship:'' }
};
const toDateInput = v => v ? new Date(v).toISOString().split('T')[0] : '';

const PatientProfile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ appointments:0, prescriptions:0, records:0 });
  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase() || 'P';

  useEffect(() => {
    API.get('/patient/profile')
      .then(res => {
        const p = res.data || {};
        setForm({
          phone: p.phone||'', address: p.address||'',
          dateOfBirth: toDateInput(p.dateOfBirth), gender: p.gender||'',
          bloodType: p.bloodType||'',
          emergencyContact:{ name:p.emergencyContact?.name||'', phone:p.emergencyContact?.phone||'', relationship:p.emergencyContact?.relationship||'' }
        });
      })
      .catch(err => { if (err.response?.status !== 404) toast.error('Failed to load profile'); })
      .finally(() => setLoading(false));

    // Load stats
    API.get('/appointment').then(res => {
      const apts = res.data || [];
      setStats(s => ({ ...s, appointments: apts.length }));
    }).catch(()=>{});
    API.get('/patient/prescriptions').then(res => {
      setStats(s => ({ ...s, prescriptions: (res.data||[]).length }));
    }).catch(()=>{});
    API.get('/patient/reports').then(res => {
      setStats(s => ({ ...s, records: (res.data||[]).length }));
    }).catch(()=>{});
  }, []);

  const upd = e => setForm({ ...form, [e.target.name]: e.target.value });
  const updE = e => setForm({ ...form, emergencyContact:{ ...form.emergencyContact, [e.target.name]: e.target.value } });

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try { await API.put('/patient/profile', form); toast.success('Profile saved!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <>
        <div className="dash-header">
          <div>
            <div className="dash-header-title">My Profile</div>
            <div className="dash-header-sub">Manage your personal information</div>
          </div>
        </div>

        <div className="dash-content">
          {/* Profile hero card */}
          <div style={{background:'white',borderRadius:'20px',border:'1px solid #e0f2fe',padding:'28px 32px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'24px',boxShadow:'0 4px 16px rgba(8,145,178,0.08)'}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,#0891b2,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'1.5rem',fontFamily:"'Outfit',sans-serif",flexShrink:0}}>
              {initials}
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Outfit',sans-serif",fontSize:'1.4rem',fontWeight:800,color:'#0c1a2e'}}>{user?.name}</div>
              <div style={{fontSize:'0.85rem',color:'#64748b',marginTop:'3px'}}>{user?.email}</div>
              <span style={{display:'inline-block',marginTop:'8px',background:'#ecfeff',color:'#0e7490',borderRadius:'999px',padding:'3px 12px',fontSize:'0.75rem',fontWeight:700}}>Patient</span>
            </div>
            {/* Stats */}
            <div style={{display:'flex',gap:'24px',flexShrink:0}}>
              {[{label:'Appointments',value:stats.appointments,icon:'📅'},{label:'Prescriptions',value:stats.prescriptions,icon:'💊'},{label:'Records',value:stats.records,icon:'📁'}].map(s => (
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
                {/* Left col */}
                <div>
                  <div style={sectionStyle}>
                    <div style={sectionTitle}>👤 Personal Information</div>
                    <label className="hc-label">Phone Number</label>
                    <input className="hc-input" name="phone" placeholder="+94 77 123 4567" value={form.phone} onChange={upd} />
                    <label className="hc-label">Date of Birth</label>
                    <input className="hc-input" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={upd} />
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                      <div>
                        <label className="hc-label">Gender</label>
                        <select className="hc-input" name="gender" value={form.gender} onChange={upd}>
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="hc-label">Blood Type</label>
                        <select className="hc-input" name="bloodType" value={form.bloodType} onChange={upd}>
                          <option value="">Select</option>
                          {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <label className="hc-label">Address</label>
                    <textarea className="hc-input" name="address" placeholder="Your home address" value={form.address} onChange={upd} style={{minHeight:'80px'}} />
                  </div>
                </div>

                {/* Right col */}
                <div>
                  <div style={sectionStyle}>
                    <div style={sectionTitle}>🚨 Emergency Contact</div>
                    <label className="hc-label">Full Name</label>
                    <input className="hc-input" name="name" placeholder="Contact name" value={form.emergencyContact.name} onChange={updE} />
                    <label className="hc-label">Relationship</label>
                    <input className="hc-input" name="relationship" placeholder="e.g. Parent, Spouse, Sibling" value={form.emergencyContact.relationship} onChange={updE} />
                    <label className="hc-label">Phone Number</label>
                    <input className="hc-input" name="phone" placeholder="+94 77 123 4567" value={form.emergencyContact.phone} onChange={updE} />
                  </div>

                  <div style={{...sectionStyle, background:'linear-gradient(135deg,#f0fdf4,#ecfeff)', border:'1px solid #a7f3d0'}}>
                    <div style={{...sectionTitle, color:'#065f46'}}>💡 Health Tip</div>
                    <p style={{fontSize:'0.85rem',color:'#047857',lineHeight:1.6}}>Keep your blood type and emergency contact up to date — this information is critical in medical emergencies.</p>
                  </div>
                </div>
              </div>

              <button className="hc-btn hc-btn-primary" type="submit" disabled={saving} style={{marginTop:'20px',width:'100%',justifyContent:'center',padding:'14px',fontSize:'1rem'}}>
                {saving ? 'Saving...' : '✓ Save Profile'}
              </button>
            </form>
          )}
        </div>
    </>
  );
};

const sectionStyle = { background:'white', borderRadius:'16px', border:'1px solid #e0f2fe', padding:'24px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(8,145,178,0.06)' };
const sectionTitle = { fontFamily:"'Outfit',sans-serif", fontSize:'0.95rem', fontWeight:700, color:'#0c1a2e', marginBottom:'16px', paddingBottom:'10px', borderBottom:'1px solid #e0f2fe' };

export default PatientProfile;