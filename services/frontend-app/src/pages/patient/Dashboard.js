import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏥 Patient Dashboard</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.welcome}>
        <h2>Welcome, {user?.name}! 👋</h2>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>📅 My Appointments</h3>
          <p>View and manage your appointments</p>
          <button style={styles.btn}>View Appointments</button>
        </div>
        <div style={styles.card}>
          <h3>👨‍⚕️ Find Doctors</h3>
          <p>Browse and book doctors</p>
          <button style={styles.btn}>Browse Doctors</button>
        </div>
        <div style={styles.card}>
          <h3>📋 Medical History</h3>
          <p>View your medical records</p>
          <button style={styles.btn}>View History</button>
        </div>
        <div style={styles.card}>
          <h3>🎥 Video Consultation</h3>
          <p>Join your telemedicine session</p>
          <button style={styles.btn}>Join Session</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { color: '#2d3748', margin: 0 },
  welcome: { background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  card: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  btn: { marginTop: '12px', padding: '10px 20px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  logoutBtn: { padding: '10px 20px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default PatientDashboard;