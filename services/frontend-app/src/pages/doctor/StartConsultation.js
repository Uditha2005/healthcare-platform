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

const StartConsultation = () => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const [appointments, setAppointments] = useState([]);
  const [prescription, setPrescription] = useState({patientId:'',medication:'',dosage:'',instructions:''});
  const [loading, setLoading] = useState(true);
  const [showPrescription, setShowPrescription] = useState(false);
  const [startingSession, setStartingSession] = useState(null);
  const [endingSession, setEndingSession] = useState(null);

  useEffect(() => {
    API.get('/appointment')
      .then(res => { const data = res.data.appointments||res.data||[]; setAppointments(data.filter(a => a.status==='confirmed')); })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStartVideo = async apt => {
    setStartingSession(apt._id);
    try {
      const res = await API.post('/sessions',{doctorId:apt.doctorId,patientId:apt.patientId,appointmentId:apt._id});
      const meetingLink = res.data.meetingLink;
      await API.put(`/appointment/${apt._id}`,{meetingLink});
      setAppointments(prev => prev.map(a => a._id===apt._id?{...a,meetingLink}:a));
      toast.success('Session started!');
      window.open(meetingLink,'_blank');
    } catch (err) { toast.error(err.response?.data?.message||'Failed to start session'); }
    finally { setStartingSession(null); }
  };

  const handleEndSession = async apt => {
    setEndingSession(apt._id);
    try {
      await API.patch(`/sessions/appointment/${apt._id}/end`);
      await API.put(`/appointment/${apt._id}`,{meetingLink:''});
      await API.patch(`/appointment/${apt._id}/status`,{status:'completed'});
      setAppointments(prev => prev.filter(a => a._id!==apt._id));
      toast.success('Session ended and appointment completed.');
    } catch (err) { toast.error(err.response?.data?.message||'Failed to end session'); }
    finally { setEndingSession(null); }
  };

  const handlePrescription = async e => {
    e.preventDefault();
    try {
      await API.post('/patient/prescriptions', prescription);
      toast.success('Prescription issued!');
      setShowPrescription(false);
      setPrescription({patientId:'',medication:'',dosage:'',instructions:''});
    } catch (err) { toast.error(err.response?.data?.message||'Failed to issue prescription'); }
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
            <div className="dash-header-title">Start Consultation</div>
            <div className="dash-header-sub">Confirmed appointments ready for video session</div>
          </div>
          <div className="dash-header-right">
            <ThemeToggle />
            <span style={{background:'#10b981',color:'white',borderRadius:'999px',padding:'4px 12px',fontSize:'0.75rem',fontWeight:700}}>
              {appointments.length} Ready
            </span>
          </div>
        </div>

        <div className="dash-content">
          {loading ? <div className="hc-empty">Loading...</div>
          : appointments.length === 0 ? (
            <div className="hc-empty">
              <div style={{fontSize:'3rem',marginBottom:'16px'}}>🎥</div>
              <p style={{fontWeight:700,fontSize:'1rem',marginBottom:'8px'}}>No confirmed appointments</p>
              <p style={{fontSize:'0.85rem',marginBottom:'20px'}}>Accept pending appointments first to start consultations</p>
              <button className="hc-btn hc-btn-primary" onClick={() => navigate('/doctor/appointments')}>View Appointments →</button>
            </div>
          ) : (
            <div className="dash-services">
              {appointments.map((apt, i) => (
                <div key={i} className="dash-service-card hc-animate" style={{animationDelay:`${i*0.05}s`,cursor:'default',borderLeft:'3px solid #10b981'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
                    <div style={{width:46,height:46,borderRadius:'50%',background:'linear-gradient(135deg,#10b981,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'1rem',flexShrink:0}}>
                      {apt.patientName?.charAt(0)||'P'}
                    </div>
                    <div>
                      <div style={{fontWeight:700,fontSize:'0.95rem',color:'var(--text-primary)'}}>{apt.patientName||'Patient'}</div>
                      <div style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{apt.specialty}</div>
                    </div>
                    {apt.meetingLink && <span style={{marginLeft:'auto',background:'#d1fae5',color:'#065f46',borderRadius:'999px',padding:'3px 10px',fontSize:'0.72rem',fontWeight:700}}>🟢 Live</span>}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'16px'}}>
                    <div style={s.row}>📅 <span>{apt.date?new Date(apt.date).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'—'} at {apt.time}</span></div>
                    {apt.notes && <div style={s.row}>📝 <span style={{fontSize:'0.8rem'}}>{apt.notes}</span></div>}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'8px',borderTop:'1px solid var(--border)',paddingTop:'14px'}}>
                    {apt.meetingLink ? (
                      <>
                        <button className="hc-btn hc-btn-primary" style={{justifyContent:'center'}} onClick={() => window.open(apt.meetingLink,'_blank')}>🎥 Rejoin Video</button>
                        <button className="hc-btn hc-btn-danger" style={{justifyContent:'center'}} onClick={() => handleEndSession(apt)} disabled={endingSession===apt._id}>
                          {endingSession===apt._id?'Ending...':'⏹ End Session'}
                        </button>
                      </>
                    ) : (
                      <button className="hc-btn hc-btn-success" style={{justifyContent:'center'}} onClick={() => handleStartVideo(apt)} disabled={startingSession===apt._id}>
                        {startingSession===apt._id?'Starting...':'🎥 Start Video Call'}
                      </button>
                    )}
                    <button className="hc-btn hc-btn-accent" style={{justifyContent:'center'}} onClick={() => { setShowPrescription(true); setPrescription(p => ({...p,patientId:apt.patientId})); }}>
                      💊 Issue Prescription
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Prescription Modal */}
      {showPrescription && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(12,26,46,0.65)',backdropFilter:'blur(6px)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:300,padding:'20px'}}>
          <div style={{background:'var(--surface)',borderRadius:'24px',padding:'40px',width:'100%',maxWidth:'460px',boxShadow:'0 24px 64px rgba(0,0,0,0.25)',color:'var(--text-primary)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
              <div style={{width:44,height:44,borderRadius:'12px',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem'}}>💊</div>
              <div>
                <h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:'1.2rem',fontWeight:800}}>Issue Prescription</h3>
                <p style={{color:'var(--text-muted)',fontSize:'0.82rem',marginTop:'2px'}}>Fill in the medication details</p>
              </div>
            </div>
            <form onSubmit={handlePrescription}>
              <label className="hc-label">Medication Name</label>
              <input className="hc-input" placeholder="e.g. Paracetamol 500mg" value={prescription.medication} onChange={e => setPrescription({...prescription,medication:e.target.value})} required />
              <label className="hc-label">Dosage</label>
              <input className="hc-input" placeholder="e.g. 2 tablets twice daily" value={prescription.dosage} onChange={e => setPrescription({...prescription,dosage:e.target.value})} required />
              <label className="hc-label">Instructions</label>
              <textarea className="hc-input" placeholder="Additional instructions..." value={prescription.instructions} onChange={e => setPrescription({...prescription,instructions:e.target.value})} style={{minHeight:'80px'}} />
              <div style={{display:'flex',gap:'10px',marginTop:'8px'}}>
                <button type="submit" className="hc-btn hc-btn-success" style={{flex:1,justifyContent:'center',padding:'12px'}}>Issue Prescription</button>
                <button type="button" className="hc-btn hc-btn-ghost" style={{padding:'12px 20px'}} onClick={() => setShowPrescription(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const s = { row:{display:'flex',gap:'8px',fontSize:'0.85rem',color:'var(--text-secondary)',alignItems:'flex-start'} };
export default StartConsultation;