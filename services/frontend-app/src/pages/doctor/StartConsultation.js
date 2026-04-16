import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const StartConsultation = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [prescription, setPrescription] = useState({ patientId: '', medication: '', dosage: '', instructions: '' });
  const [loading, setLoading] = useState(true);
  const [showPrescription, setShowPrescription] = useState(false);

  useEffect(() => {
    API.get('/appointment')
      .then(res => {
        const data = res.data.appointments || res.data || [];
        const confirmed = data.filter(a => a.status === 'confirmed');
        setAppointments(confirmed);
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const handlePrescription = async e => {
    e.preventDefault();
    try {
      await API.post('/patient/prescriptions', prescription);
      toast.success('Prescription issued!');
      setShowPrescription(false);
      setPrescription({ patientId: '', medication: '', dosage: '', instructions: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue prescription');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>🎥 Start Consultation</h2>
        <button style={styles.backBtn} onClick={() => navigate('/doctor/dashboard')}>← Back</button>
      </div>
      {loading ? <p>Loading...</p> : appointments.length === 0 ? (
        <div style={styles.empty}><p>No confirmed appointments for consultation.</p></div>
      ) : (
        <div style={styles.grid}>
          {appointments.map((apt, i) => (
            <div key={i} style={styles.card}>
              <h3>👤 {apt.patientName || 'Patient'}</h3>
              <p>📅 {new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
              <p>📝 {apt.reason}</p>
              <div style={styles.actions}>
                <button style={styles.startBtn} onClick={() => toast.info('Video session starting...')}>
                  🎥 Start Video
                </button>
                <button style={styles.prescribeBtn} onClick={() => { setShowPrescription(true); setPrescription(p => ({ ...p, patientId: apt.patientId })); }}>
                  💊 Prescribe
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPrescription && (
        <div style={styles.modal}>
          <div style={styles.modalCard}>
            <h3>💊 Issue Prescription</h3>
            <form onSubmit={handlePrescription}>
              <input style={styles.input} placeholder="Medicine name" value={prescription.medication} onChange={e => setPrescription({ ...prescription, medication: e.target.value })} required />
              <input style={styles.input} placeholder="Dosage (e.g. 2x daily)" value={prescription.dosage} onChange={e => setPrescription({ ...prescription, dosage: e.target.value })} required />
              <textarea style={styles.textarea} placeholder="Instructions for the patient..." value={prescription.instructions} onChange={e => setPrescription({ ...prescription, instructions: e.target.value })} />
              <div style={styles.actions}>
                <button type="submit" style={styles.startBtn}>Issue Prescription</button>
                <button type="button" style={styles.backBtn} onClick={() => setShowPrescription(false)}>Cancel</button>
              </div>
            </form>
          </div>
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
  startBtn: { padding: '8px 16px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  prescribeBtn: { padding: '8px 16px', background: '#38a169', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  backBtn: { padding: '8px 16px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalCard: { background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px' },
  input: { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px', boxSizing: 'border-box', minHeight: '80px' }
};

export default StartConsultation;