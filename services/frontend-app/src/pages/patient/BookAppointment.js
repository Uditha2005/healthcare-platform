import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/api';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const generateTimeSlots = (startTime, endTime) => {
  const slots = [];
  let [h,m] = startTime.split(':').map(Number);
  const [eh,em] = endTime.split(':').map(Number);
  while (h < eh || (h===eh && m<em)) {
    slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    m+=30; if(m>=60){h++;m=0;}
  }
  return slots;
};

const BookAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = location.state?.doctor || null;
  const [form, setForm] = useState({ date:'', time:'', notes:'', doctorId:doctor?._id||doctor?.id||'', specialty:doctor?.specialization||doctor?.specialty||'' });
  const [availability, setAvailability] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    if (doctor?._id||doctor?.id) {
      API.get(`/doctors/${doctor._id||doctor.id}/availability`)
        .then(res => setAvailability(res.data.availability||[]))
        .catch(() => setAvailability([]));
    }
  }, [doctor]);

  useEffect(() => {
    if (!form.date||availability.length===0){setAvailableSlots([]);return;}
    const day = DAYS[new Date(form.date).getDay()];
    const slots = availability.filter(a=>a.day===day).flatMap(s=>generateTimeSlots(s.startTime,s.endTime));
    setAvailableSlots(slots);
    if (!slots.includes(form.time)) setForm(f=>({...f,time:''}));
  }, [form.date, availability]);

  const handleChange = e => setForm({...form,[e.target.name]:e.target.value});

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.date||!form.time||!form.doctorId){toast.error('Please complete all required fields');return;}
    navigate('/patient/payment',{state:{appointmentPayload:{doctorId:form.doctorId,specialty:form.specialty,date:new Date(form.date).toISOString(),time:form.time,notes:form.notes},doctor}});
  };

  const initials = doctor?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'DR';

  return (
    <div style={{minHeight:'100vh',background:'#f0f9ff',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'32px 24px',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div className="hc-form-card" style={{maxWidth:'520px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
          <div>
            <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:'1.5rem',fontWeight:800}}>Book Appointment</h2>
            <p style={{color:'#64748b',fontSize:'0.88rem',marginTop:'4px'}}>Fill in the details below</p>
          </div>
          <button className="hc-btn hc-btn-ghost" onClick={()=>navigate(-1)}>← Back</button>
        </div>

        {doctor && (
          <div style={{display:'flex',alignItems:'center',gap:'14px',background:'#ecfeff',border:'1px solid #a5f3fc',borderRadius:'12px',padding:'14px 18px',marginBottom:'24px'}}>
            <div className="hc-doc-avatar" style={{margin:0,width:40,height:40,fontSize:'0.9rem'}}>{initials}</div>
            <div>
              <div style={{fontWeight:700,color:'#0c1a2e'}}>Dr. {doctor.name}</div>
              <div style={{fontSize:'0.82rem',color:'#0891b2',fontWeight:600}}>{doctor.specialization||doctor.specialty||'General'}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="hc-label">Select Date</label>
          <input className="hc-input" type="date" name="date" value={form.date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />

          {form.date && availableSlots.length===0 && (
            <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'8px',padding:'10px 14px',marginBottom:'16px',fontSize:'0.85rem',color:'#dc2626'}}>
              ⚠️ No available slots on this date. Please pick another day.
            </div>
          )}

          <label className="hc-label">Time Slot</label>
          {availableSlots.length > 0 ? (
            <select className="hc-input" name="time" value={form.time} onChange={handleChange} required>
              <option value="">Select a time slot</option>
              {availableSlots.map(slot=><option key={slot} value={slot}>{slot}</option>)}
            </select>
          ) : (
            <select className="hc-input" disabled><option>{form.date?'No slots available':'Select a date first'}</option></select>
          )}

          <label className="hc-label">Notes (optional)</label>
          <textarea className="hc-input" name="notes" placeholder="Additional notes for the doctor..." value={form.notes} onChange={handleChange} style={{minHeight:'100px',resize:'vertical'}} />

          <button className="hc-btn hc-btn-primary" type="submit" style={{width:'100%',justifyContent:'center',padding:'13px',fontSize:'1rem',marginTop:'8px'}}>
            Confirm & Proceed to Payment →
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;