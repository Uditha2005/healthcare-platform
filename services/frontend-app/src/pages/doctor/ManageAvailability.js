import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ManageAvailability = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [slots, setSlots] = useState([{ day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user?.id) {
      API.get(`/doctors/user/${user.id}`)
        .then(res => {
          if (res.data.availability && res.data.availability.length > 0) {
            setSlots(res.data.availability);
          }
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    } else {
      setFetching(false);
    }
  }, [user]);

  const addSlot = () => setSlots([...slots, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  const removeSlot = (i) => setSlots(slots.filter((_, idx) => idx !== i));
  const handleChange = (i, field, value) => {
    const updated = [...slots];
    updated[i][field] = value;
    setSlots(updated);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put(`/doctors/user/${user.id}/availability`, { availability: slots });
      toast.success('Availability updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>🕐 Manage Availability</h2>
        <button style={styles.backBtn} onClick={() => navigate('/doctor/dashboard')}>← Back</button>
      </div>
      <div style={styles.card}>
        {fetching ? <p>Loading availability...</p> : (
        <form onSubmit={handleSubmit}>
          {slots.map((slot, i) => (
            <div key={i} style={styles.slotRow}>
              <select style={styles.select} value={slot.day} onChange={e => handleChange(i, 'day', e.target.value)}>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input style={styles.timeInput} type="time" value={slot.startTime} onChange={e => handleChange(i, 'startTime', e.target.value)} />
              <span>to</span>
              <input style={styles.timeInput} type="time" value={slot.endTime} onChange={e => handleChange(i, 'endTime', e.target.value)} />
              <button type="button" style={styles.removeBtn} onClick={() => removeSlot(i)}>✕</button>
            </div>
          ))}
          <button type="button" style={styles.addBtn} onClick={addSlot}>+ Add Slot</button>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Saving...' : '💾 Save Availability'}
          </button>
        </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  card: { background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  slotRow: { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' },
  select: { padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' },
  timeInput: { padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' },
  removeBtn: { padding: '8px 12px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  addBtn: { display: 'block', marginBottom: '16px', padding: '10px 20px', background: '#805ad5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  btn: { width: '100%', padding: '12px', background: '#38a169', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  backBtn: { padding: '8px 16px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default ManageAvailability;