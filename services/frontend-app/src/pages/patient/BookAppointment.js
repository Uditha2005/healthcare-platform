import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const BookAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = location.state?.doctor || null;
  const [form, setForm] = useState({ 
    date: '', 
    time: '', 
    notes: '', 
    doctorId: doctor?._id || doctor?.id || '',
    specialty: doctor?.specialization || doctor?.specialty || ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.date || !form.time || !form.doctorId) {
      toast.error('Please complete all required fields');
      return;
    }

    const payload = {
      doctorId: form.doctorId,
      specialty: form.specialty,
      date: new Date(form.date).toISOString(),
      time: form.time,
      notes: form.notes
    };

    navigate('/patient/payment', {
      state: {
        appointmentPayload: payload,
        doctor
      }
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>📅 Book Appointment</h2>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        </div>
        {doctor && (
          <div style={styles.doctorInfo}>
            <p>Dr. {doctor.name} - {doctor.specialization || doctor.specialty || 'General'}</p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Date</label>
          <input style={styles.input} type="date" name="date" value={form.date} onChange={handleChange} required />
          <label style={styles.label}>Time</label>
          <input style={styles.input} type="time" name="time" value={form.time} onChange={handleChange} required />
          <label style={styles.label}>Notes</label>
          <textarea style={styles.textarea} name="notes" placeholder="Additional notes for the doctor..." value={form.notes} onChange={handleChange} />
          <button style={styles.btn} type="submit">
            Confirm Appointment
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', padding: '24px', display: 'flex', justifyContent: 'center' },
  card: { background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px', height: 'fit-content' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  doctorInfo: { background: '#ebf8ff', padding: '12px', borderRadius: '8px', marginBottom: '20px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#4a5568' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px', boxSizing: 'border-box', minHeight: '100px' },
  btn: { width: '100%', padding: '12px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  backBtn: { padding: '8px 16px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default BookAppointment;
