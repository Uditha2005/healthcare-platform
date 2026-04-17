import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const toDateInput = value => {
  if (!value) return '';
  return new Date(value).toISOString().split('T')[0];
};

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', time: '', notes: '' });

  const loadAppointments = () => {
    setLoading(true);
    API.get('/appointment')
      .then(res => setAppointments(Array.isArray(res.data) ? res.data : res.data.appointments || []))
      .catch(err => {
        toast.error(err.response?.data?.message || 'Failed to load appointments');
        setAppointments([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const beginEdit = appointment => {
    setEditingId(appointment._id);
    setEditForm({
      date: toDateInput(appointment.date),
      time: appointment.time || '',
      notes: appointment.notes || ''
    });
  };

  const cancelAppointment = async id => {
    try {
      await API.delete(`/appointment/${id}`);
      toast.success('Appointment cancelled');
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const rescheduleAppointment = async e => {
    e.preventDefault();
    try {
      await API.put(`/appointment/${editingId}`, {
        date: new Date(editForm.date).toISOString(),
        time: editForm.time,
        notes: editForm.notes
      });
      toast.success('Appointment updated');
      setEditingId(null);
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update appointment');
    }
  };

  const statusColor = {
    pending: '#d69e2e',
    confirmed: '#38a169',
    cancelled: '#e53e3e',
    completed: '#3182ce'
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>My Appointments</h2>
        <div style={styles.headerActions}>
          <button style={styles.bookBtn} onClick={() => navigate('/patient/browse-doctors')}>Book Appointment</button>
          <button style={styles.backBtn} onClick={() => navigate('/patient/dashboard')}>Back</button>
        </div>
      </div>

      {loading ? <p>Loading appointments...</p> : appointments.length === 0 ? (
        <div style={styles.empty}>
          <p>No appointments yet.</p>
          <button style={styles.bookBtn} onClick={() => navigate('/patient/browse-doctors')}>Find Doctors</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {appointments.map(appointment => (
            <div key={appointment._id} style={styles.card}>
              <h3>{appointment.specialty || 'Appointment'}</h3>
              <p>👨‍⚕️ Dr. {appointment.doctorName || 'N/A'}</p>
              <p>Date: {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'Not set'}</p>
              <p>Time: {appointment.time}</p>
              <p>Notes: {appointment.notes || 'No notes'}</p>
              <p style={{ color: statusColor[appointment.status] || '#4a5568' }}>Status: {appointment.status}</p>

              {editingId === appointment._id ? (
                <form onSubmit={rescheduleAppointment} style={styles.editForm}>
                  <input
                    style={styles.input}
                    type="date"
                    value={editForm.date}
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                    required
                  />
                  <input
                    style={styles.input}
                    type="time"
                    value={editForm.time}
                    onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                    required
                  />
                  <textarea
                    style={styles.textarea}
                    value={editForm.notes}
                    onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Notes"
                  />
                  <div style={styles.actions}>
                    <button style={styles.saveBtn} type="submit">Save</button>
                    <button style={styles.neutralBtn} type="button" onClick={() => setEditingId(null)}>Close</button>
                  </div>
                </form>
              ) : (
                appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                  <div style={styles.actions}>
                    <button style={styles.saveBtn} onClick={() => beginEdit(appointment)}>Reschedule</button>
                    <button style={styles.cancelBtn} onClick={() => cancelAppointment(appointment._id)}>Cancel</button>
                  </div>
                )
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' },
  headerActions: { display: 'flex', gap: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
  card: { background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  empty: { background: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center' },
  editForm: { marginTop: '12px' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px', boxSizing: 'border-box' },
  actions: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' },
  saveBtn: { padding: '8px 14px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  cancelBtn: { padding: '8px 14px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  neutralBtn: { padding: '8px 14px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  bookBtn: { padding: '8px 14px', background: '#2f855a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  backBtn: { padding: '8px 14px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default PatientAppointments;
