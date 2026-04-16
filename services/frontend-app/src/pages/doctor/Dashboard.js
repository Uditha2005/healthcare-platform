import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Start Telemedicine Session
  const startSession = async () => {
    try {
      const res = await API.post('/sessions', {
        doctorId: user?.id || "demoDoctor",
        patientId: "demoPatient"
      });

      if (res.data?.meetingLink) {
        window.open(res.data.meetingLink, "_blank");
      } else {
        alert("Failed to create session");
      }
    } catch (err) {
      console.error(err);
      alert("Error starting session");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👨‍⚕️ Doctor Dashboard</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div style={styles.welcome}>
        <h2>Welcome, Dr. {user?.name || 'Doctor'}! 👋</h2>
        <p>Email: {user?.email} | Role: {user?.role}</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>📅 My Appointments</h3>
          <p>View today's appointments</p>
          <button style={styles.btn} onClick={() => navigate('/doctor/appointments')}>
            View Appointments
          </button>
        </div>

        <div style={styles.card}>
          <h3>🕐 My Availability</h3>
          <p>Manage your schedule</p>
          <button style={styles.btn} onClick={() => navigate('/doctor/availability')}>
            Set Availability
          </button>
        </div>

        <div style={styles.card}>
          <h3>💊 Prescriptions</h3>
          <p>Issue digital prescriptions</p>
          <button style={styles.btn}>
            Write Prescription
          </button>
        </div>

        <div style={styles.card}>
          <h3>🎥 Start Consultation</h3>
          <p>Begin telemedicine session</p>
          <button style={styles.btn} onClick={startSession}>
            Start Session
          </button>
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
  btn: { marginTop: '12px', padding: '10px 20px', background: '#38a169', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  logoutBtn: { padding: '10px 20px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default Dashboard;
