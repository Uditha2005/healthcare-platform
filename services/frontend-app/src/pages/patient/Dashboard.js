import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AISymptomChatWidget from '../../components/patient/AISymptomChatWidget';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏥 Patient Dashboard</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>
      <div style={styles.welcome}>
        <h2>Welcome, {user?.name}! 👋</h2>
        <p>Email: {user?.email} | Role: {user?.role}</p>
      </div>
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Profile</h3>
          <p>Keep your contact and emergency details current</p>
          <button style={styles.btn} onClick={() => navigate('/patient/profile')}>Edit Profile</button>
        </div>
        <div style={styles.card}>
          <h3>📅 My Appointments</h3>
          <p>View and manage your appointments</p>
          <button style={styles.btn} onClick={() => navigate('/patient/appointments')}>Manage Appointments</button>
        </div>
        <div style={styles.card}>
          <h3>👨‍⚕️ Find Doctors</h3>
          <p>Browse and book doctors</p>
          <button style={styles.btn} onClick={() => navigate('/patient/browse-doctors')}>Browse Doctors</button>
        </div>
        <div style={styles.card}>
          <h3>Medical Records</h3>
          <p>View prescriptions, reports, and medical history</p>
          <button style={styles.btn} onClick={() => navigate('/patient/medical-records')}>View Records</button>
        </div>
        <div style={styles.card}>
          <h3>📋 Upload Reports</h3>
          <p>Upload your medical records</p>
          <button style={styles.btn} onClick={() => navigate('/patient/upload-reports')}>Upload Report</button>
        </div>
        <div style={styles.card}>
          <h3>🎥 Video Consultation</h3>
          <p>Join your telemedicine session</p>
          <button style={styles.btn} onClick={() => navigate('/patient/video-consultation')}>Join Session</button>
        </div>
      </div>
      <AISymptomChatWidget />
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
