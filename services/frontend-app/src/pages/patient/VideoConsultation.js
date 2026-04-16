import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const VideoConsultation = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/appointment')
      .then(res => {
        const booked = (Array.isArray(res.data) ? res.data : res.data.appointments || []).filter(a => a.status === 'confirmed');
        setSessions(booked);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const joinSession = (sessionId) => {
    if (sessionId) {
      window.open(`/session/${sessionId}`, '_blank');
    } else {
      toast.info('Session link will be available when doctor starts the consultation.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>🎥 Video Consultations</h2>
        <button style={styles.backBtn} onClick={() => navigate('/patient/dashboard')}>← Back</button>
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
                <h3>📅 {new Date(session.date).toLocaleDateString()}</h3>
                <p>🕐 {session.time}</p>
                <p>Reason: {session.reason}</p>
                <p style={{ color: '#38a169' }}>Status: {session.status}</p>
                <button style={styles.btn} onClick={() => joinSession(session.sessionId)}>
                  🎥 Join Session
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  card: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  empty: { background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' },
  btn: { marginTop: '12px', padding: '10px 20px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  backBtn: { padding: '8px 16px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default VideoConsultation;
