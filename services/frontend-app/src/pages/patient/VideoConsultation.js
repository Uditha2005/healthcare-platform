import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';
import ThemeToggle from '../../components/ThemeToggle';

const VideoConsultation = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(() => {
    API.get('/appointment')
      .then(res => {
        const all = Array.isArray(res.data) ? res.data : res.data.appointments || [];
        const relevant = all.filter(a => a.status === 'confirmed' || a.status === 'completed');
        setSessions(relevant);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAppointments();
    // Poll every 10 seconds to detect when doctor starts a session
    const interval = setInterval(fetchAppointments, 10000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const joinSession = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    } else {
      toast.info('Session link will be available when doctor starts the consultation.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>🎥 Video Consultations</h2>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <ThemeToggle />
          <button style={styles.backBtn} onClick={() => navigate('/patient/dashboard')}>← Back</button>
        </div>
      </div>
      {loading ? <p>Loading sessions...</p> : (
        sessions.length === 0 ? (
          <div style={styles.empty}>
            <h3>No active sessions</h3>
            <p>You have no confirmed appointments for video consultation yet.</p>
            <button style={styles.btn} onClick={() => navigate('/patient/browse-doctors')}>Book Appointment</button>
          </div>
        ) : (
          <div style={styles.grid}>
            {sessions.map((session, i) => (
              <div key={i} style={styles.card}>
                <h3>👨‍⚕️ Dr. {session.doctorName || 'Doctor'}</h3>
                <p>📅 {new Date(session.date).toLocaleDateString()}</p>
                <p>🕐 {session.time}</p>
                <p>🏥 {session.specialty}</p>
                {session.notes && <p>📝 {session.notes}</p>}
                {session.meetingLink ? (
                  <>
                    <p style={{ color: '#38a169', fontWeight: 'bold' }}>✅ Doctor has started the session</p>
                    <button style={styles.joinBtn} onClick={() => joinSession(session.meetingLink)}>
                      🎥 Join Session
                    </button>
                  </>
                ) : session.status === 'completed' ? (
                  <>
                    <p style={{ color: '#718096', fontWeight: 'bold' }}>✔ Session has ended</p>
                    <button style={styles.endedBtn} disabled>
                      Session Completed
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ color: '#d69e2e', fontWeight: 'bold' }}>⏳ Waiting for doctor to start...</p>
                    <button style={styles.waitingBtn} disabled>
                      🎥 Waiting for Doctor
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

const styles = {
  container: { padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
  card: { background: 'var(--surface)', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', color: 'var(--text-primary)' },
  empty: { background: 'var(--surface)', padding: '40px', borderRadius: '12px', textAlign: 'center', color: 'var(--text-primary)', border: '1px solid var(--border)' },
  joinBtn: { marginTop: '12px', padding: '10px 20px', background: '#38a169', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  waitingBtn: { marginTop: '12px', padding: '10px 20px', background: '#cbd5e0', color: '#718096', border: 'none', borderRadius: '8px', cursor: 'not-allowed', width: '100%' },
  endedBtn: { marginTop: '12px', padding: '10px 20px', background: '#e2e8f0', color: '#718096', border: 'none', borderRadius: '8px', cursor: 'not-allowed', width: '100%' },
  btn: { marginTop: '12px', padding: '10px 20px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  backBtn: { padding: '8px 16px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default VideoConsultation;
