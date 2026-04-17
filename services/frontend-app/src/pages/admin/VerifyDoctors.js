import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const VerifyDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/auth/users')
      .then(res => {
        const docs = (res.data.users || []).filter(u => u.role === 'doctor');
        setDoctors(docs);
      })
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const verifyDoctor = async (id, isVerified) => {
    try {
      await API.put(`/auth/users/${id}/verify`, { isVerified });
      toast.success(`Doctor ${isVerified ? 'verified' : 'unverified'}!`);
      setDoctors(doctors.map(d => d._id === id ? { ...d, isVerified } : d));
    } catch (err) {
      toast.error('Failed to update verification');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>✅ Verify Doctors</h2>
        <button style={styles.backBtn} onClick={() => navigate('/admin/dashboard')}>← Back</button>
      </div>
      {loading ? <p>Loading...</p> : doctors.length === 0 ? (
        <div style={styles.empty}><p>No doctors registered yet.</p></div>
      ) : (
        <div style={styles.grid}>
          {doctors.map((doc, i) => (
            <div key={i} style={styles.card}>
              <h3>👨‍⚕️ Dr. {doc.name}</h3>
              <p>📧 {doc.email}</p>
              <p style={{ color: doc.isVerified ? '#38a169' : '#e53e3e', fontWeight: 'bold' }}>
                {doc.isVerified ? '✅ Verified' : '❌ Not Verified'}
              </p>
              <div style={styles.actions}>
                {!doc.isVerified ? (
                  <button style={styles.verifyBtn} onClick={() => verifyDoctor(doc._id, true)}>✅ Verify</button>
                ) : (
                  <button style={styles.unverifyBtn} onClick={() => verifyDoctor(doc._id, false)}>❌ Unverify</button>
                )}
              </div>
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
  actions: { marginTop: '12px' },
  verifyBtn: { padding: '8px 16px', background: '#38a169', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  unverifyBtn: { padding: '8px 16px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  backBtn: { padding: '8px 16px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default VerifyDoctors;