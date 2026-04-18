import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const toDateInput = v => v ? new Date(v).toISOString().split('T')[0] : '';

const statusStyle = {
  pending:   'hc-badge hc-badge-pending',
  confirmed: 'hc-badge hc-badge-confirmed',
  cancelled: 'hc-badge hc-badge-cancelled',
  completed: 'hc-badge hc-badge-completed',
};

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({date:'',time:'',notes:''});

  const load = () => {
    setLoading(true);
    API.get('/appointment')
      .then(res => setAppointments(Array.isArray(res.data)?res.data:res.data.appointments||[]))
      .catch(err => { toast.error(err.response?.data?.message||'Failed to load'); setAppointments([]); })
      .finally(() => setLoading(false));
  };
  useEffect(load,[]);

  const beginEdit = a => { setEditingId(a._id); setEditForm({date:toDateInput(a.date),time:a.time||'',notes:a.notes||''}); };
  const cancel = async id => { try { await API.delete(`/appointment/${id}`); toast.success('Cancelled'); load(); } catch(e){ toast.error(e.response?.data?.message||'Failed'); } };
  const save = async e => {
    e.preventDefault();
    try { await API.put(`/appointment/${editingId}`,{date:new Date(editForm.date).toISOString(),time:editForm.time,notes:editForm.notes}); toast.success('Updated'); setEditingId(null); load(); }
    catch(e){ toast.error(e.response?.data?.message||'Failed'); }
  };

  return (
    <div style={{minHeight:'100vh',background:'#f0f9ff',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'32px 24px'}}>
        <div className="hc-page-header">
          <div>
            <div className="hc-page-title">My Appointments</div>
            <p style={{color:'#64748b',marginTop:'4px',fontSize:'0.9rem'}}>{appointments.length} appointment{appointments.length!==1?'s':''} found</p>
          </div>
          <div style={{display:'flex',gap:'10px'}}>
            <button className="hc-btn hc-btn-success" onClick={()=>navigate('/patient/browse-doctors')}>+ Book New</button>
            <button className="hc-btn hc-btn-ghost" onClick={()=>navigate('/patient/dashboard')}>← Back</button>
          </div>
        </div>

        {loading ? <div className="hc-empty">Loading appointments...</div>
        : appointments.length===0 ? (
          <div className="hc-empty">
            <div style={{fontSize:'2.5rem',marginBottom:'12px'}}>📅</div>
            <p style={{fontWeight:600,marginBottom:'8px'}}>No appointments yet</p>
            <p style={{fontSize:'0.85rem',marginBottom:'20px'}}>Book your first appointment with a doctor</p>
            <button className="hc-btn hc-btn-primary" onClick={()=>navigate('/patient/browse-doctors')}>Find Doctors</button>
          </div>
        ) : (
          <div className="hc-grid-3">
            {appointments.map(a => (
              <div key={a._id} className="hc-card hc-animate">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'14px'}}>
                  <h3 style={{fontSize:'1rem',fontWeight:700}}>{a.specialty||'Appointment'}</h3>
                  <span className={statusStyle[a.status]||'hc-badge'}>{a.status}</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'16px'}}>
                  <div style={s.row}>👨‍⚕️ <span>Dr. {a.doctorName||'N/A'}</span></div>
                  <div style={s.row}>📅 <span>{a.date?new Date(a.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Not set'}</span></div>
                  <div style={s.row}>🕐 <span>{a.time||'—'}</span></div>
                  {a.notes && <div style={s.row}>📝 <span style={{fontSize:'0.8rem'}}>{a.notes}</span></div>}
                </div>

                {editingId===a._id ? (
                  <form onSubmit={save} style={{borderTop:'1px solid #e0f2fe',paddingTop:'14px',marginTop:'4px'}}>
                    <input className="hc-input" type="date" value={editForm.date} onChange={e=>setEditForm({...editForm,date:e.target.value})} required />
                    <input className="hc-input" type="time" value={editForm.time} onChange={e=>setEditForm({...editForm,time:e.target.value})} required />
                    <textarea className="hc-input" value={editForm.notes} onChange={e=>setEditForm({...editForm,notes:e.target.value})} placeholder="Notes" style={{minHeight:'70px'}} />
                    <div style={{display:'flex',gap:'8px'}}>
                      <button className="hc-btn hc-btn-primary" type="submit" style={{flex:1,justifyContent:'center'}}>Save</button>
                      <button className="hc-btn hc-btn-ghost" type="button" onClick={()=>setEditingId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : a.status!=='cancelled'&&a.status!=='completed' ? (
                  <div style={{display:'flex',gap:'8px',borderTop:'1px solid #e0f2fe',paddingTop:'14px'}}>
                    <button className="hc-btn hc-btn-accent" style={{flex:1,justifyContent:'center',fontSize:'0.8rem'}} onClick={()=>beginEdit(a)}>Reschedule</button>
                    <button className="hc-btn hc-btn-danger" style={{flex:1,justifyContent:'center',fontSize:'0.8rem'}} onClick={()=>cancel(a._id)}>Cancel</button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const s = { row:{display:'flex',gap:'8px',fontSize:'0.85rem',color:'#475569',alignItems:'flex-start'} };
export default PatientAppointments;