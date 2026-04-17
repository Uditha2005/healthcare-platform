import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const BrowseDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState('');
  const navigate = useNavigate();

  const fetchDoctors = (selectedSpecialty = '') => {
    setLoading(true);
    const query = selectedSpecialty ? `?specialty=${encodeURIComponent(selectedSpecialty)}` : '';
    API.get(`/appointment/doctors/search${query}`)
      .then(res => setDoctors(res.data.doctors || res.data || []))
      .catch(err => {
        console.error('Error fetching doctors:', err);
        toast.error('Failed to load doctors');
        setDoctors([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    fetchDoctors(specialty);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>👨‍⚕️ Browse Doctors</h2>
        <button style={styles.backBtn} onClick={() => navigate('/patient/dashboard')}>← Back</button>
      </div>
      <form style={styles.searchRow} onSubmit={handleSearch}>
        <input
          style={styles.search}
          placeholder="Search by specialty..."
          value={specialty}
          onChange={e => setSpecialty(e.target.value)}
        />
        <button style={styles.searchBtn} type="submit">Search</button>
      </form>
      {loading ? <p>Loading doctors...</p> : (
        doctors.length === 0 ? (
          <div style={styles.empty}>
            <p>No doctors found. Check back later!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {doctors.map((doc) => (
              <div key={doc._id || doc.id} style={styles.card}>
                <h3>Dr. {doc.name}</h3>
                <p>🏥 {doc.specialization || doc.specialty || 'General'}</p>
                <p>⭐ {doc.experience || 0} years experience</p>
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
  searchRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
  search: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px', boxSizing: 'border-box' },
  searchBtn: { padding: '12px 20px', background: '#2f855a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  card: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  btn: { marginTop: '12px', padding: '10px 20px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  backBtn: { padding: '10px 20px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  empty: { background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }
};

export default BrowseDoctors;
