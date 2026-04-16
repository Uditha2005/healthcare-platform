import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const BrowseDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/doctor/profile/all')
      .then(res => setDoctors(res.data.doctors || []))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = specialty
    ? doctors.filter(d => d.specialty?.toLowerCase().includes(specialty.toLowerCase()))
    : doctors;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>👨‍⚕️ Browse Doctors</h2>
        <button style={styles.backBtn} onClick={() => navigate('/patient/dashboard')}>← Back</button>
      </div>
      <input
        style={styles.search}
        placeholder="Search by specialty..."
        value={specialty}
        onChange={e => setSpecialty(e.target.value)}
      />
      {loading ? <p>Loading doctors...</p> : (
        filtered.length === 0 ? (
          <div style={styles.empty}>
            <p>No doctors found. Check back later!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((doc, i) => (
              <div key={i} style={styles.card}>
                <h3>Dr. {doc.name}</h3>
                <p>🏥 {doc.specialty || 'General'}</p>
                <p>📧 {doc.email}</p>
                <button style={styles.btn} onClick={() => navigate('/patient/book-appointment', { state: { doctor: doc } })}>
                  Book Appointment
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
  search: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px', marginBottom: '20px', boxSizing: 'border-box' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  card: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  btn: { marginTop: '12px', padding: '10px 20px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  backBtn: { padding: '10px 20px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  empty: { background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }
};

export default BrowseDoctors;