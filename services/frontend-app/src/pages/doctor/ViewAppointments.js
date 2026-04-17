import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const ViewAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/appointment')
      .then(res => setAppointments(res.data || []))
      .catch(err => {
        console.error('Error fetching appointments:', err);
        setAppointments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/appointment/${id}/status`, { status });
      toast.success(`Appointment ${status}!`);
      setAppointments(appointments.map(a => a._id === id ? { ...a, status } : a));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const statusColor = { pending: '#d69e2e', confirmed: '#38a169', cancelled: '#e53e3e', completed: '#3182ce' };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>📅 My Appointments</h2>
        <button style={styles.backBtn} onClick={() => navigate('/doctor/dashboard')}>← Back</button>
      </div>
      {loading ? <p>Loading...</p> : appointments.length === 0 ? (
        <div style={styles.empty}><p>No appointments yet.</p></div>
      ) : (
        <div style={styles.grid}>
          {appointments.map((apt, i) => (
            <div key={apt._id || i} style={styles.card}>
              <h3>👤 Patient</h3>
              <p>📅 {new Date(apt.date).toLocaleDateString()}</p>
              <p>🕐 {apt.time}</p>
              <p>📝 {apt.notes || apt.reason || 'No notes'}</p>
              <p style={{ color: statusColor[apt.status] }}>● {apt.status?.toUpperCase()}</p>
              {apt.status === 'pending' && (
                <div style={styles.actions}>
                  <button style={styles.acceptBtn} onClick={() => updateStatus(apt._id, 'confirmed')}>✅ Accept</button>
                  <button style={styles.rejectBtn} onClick={() => updateStatus(apt._id, 'cancelled')}>❌ Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
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
  actions: { display: 'flex', gap: '10px', marginTop: '12px' },
  acceptBtn: { padding: '8px 16px', background: '#38a169', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  rejectBtn: { padding: '8px 16px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  backBtn: { padding: '8px 16px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default ViewAppointments;
