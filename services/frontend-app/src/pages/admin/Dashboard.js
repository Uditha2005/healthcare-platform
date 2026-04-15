import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🛡️ Admin Dashboard</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.welcome}>
        <h2>Welcome, Admin {user?.name}! 👋</h2>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>👥 Manage Users</h3>
          <p>View and manage all users</p>
          <button style={styles.btn}>View Users</button>
        </div>
        <div style={styles.card}>
          <h3>✅ Verify Doctors</h3>
          <p>Approve doctor registrations</p>
          <button style={styles.btn}>Verify Doctors</button>
        </div>
        <div style={styles.card}>
          <h3>📊 Reports</h3>
          <p>View platform statistics</p>
          <button style={styles.btn}>View Reports</button>
        </div>
        <div style={styles.card}>
          <h3>⚙️ Settings</h3>
          <p>Manage platform settings</p>
          <button style={styles.btn}>Settings</button>
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
  btn: { marginTop: '12px', padding: '10px 20px', background: '#805ad5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  logoutBtn: { padding: '10px 20px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default AdminDashboard;