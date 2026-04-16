import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const emptyProfile = {
  phone: '',
  address: '',
  dateOfBirth: '',
  gender: '',
  emergencyContact: {
    name: '',
    phone: '',
    relationship: ''
  }
};

const toDateInput = value => {
  if (!value) return '';
  return new Date(value).toISOString().split('T')[0];
};

const PatientProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/patient/profile')
      .then(res => {
        const profile = res.data || {};
        setForm({
          phone: profile.phone || '',
          address: profile.address || '',
          dateOfBirth: toDateInput(profile.dateOfBirth),
          gender: profile.gender || '',
          emergencyContact: {
            name: profile.emergencyContact?.name || '',
            phone: profile.emergencyContact?.phone || '',
            relationship: profile.emergencyContact?.relationship || ''
          }
        });
      })
      .catch(err => {
        if (err.response?.status !== 404) {
          toast.error(err.response?.data?.message || 'Failed to load profile');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const updateField = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateEmergency = e => {
    setForm({
      ...form,
      emergencyContact: { ...form.emergencyContact, [e.target.name]: e.target.value }
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/patient/profile', form);
      toast.success('Profile saved successfully');
      navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={styles.container}><p>Loading profile...</p></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Patient Profile</h2>
        <button style={styles.backBtn} onClick={() => navigate('/patient/dashboard')}>Back</button>
      </div>
      <form style={styles.form} onSubmit={handleSubmit}>
        <label style={styles.label}>Phone</label>
        <input style={styles.input} name="phone" value={form.phone} onChange={updateField} />

        <label style={styles.label}>Address</label>
        <textarea style={styles.textarea} name="address" value={form.address} onChange={updateField} />

        <label style={styles.label}>Date of Birth</label>
        <input style={styles.input} type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={updateField} />

        <label style={styles.label}>Gender</label>
        <select style={styles.input} name="gender" value={form.gender} onChange={updateField}>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <h3 style={styles.subhead}>Emergency Contact</h3>
        <label style={styles.label}>Name</label>
        <input style={styles.input} name="name" value={form.emergencyContact.name} onChange={updateEmergency} />

        <label style={styles.label}>Phone</label>
        <input style={styles.input} name="phone" value={form.emergencyContact.phone} onChange={updateEmergency} />

        <label style={styles.label}>Relationship</label>
        <input style={styles.input} name="relationship" value={form.emergencyContact.relationship} onChange={updateEmergency} />

        <button style={styles.saveBtn} type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  form: { background: 'white', padding: '24px', borderRadius: '8px', maxWidth: '680px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  label: { display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#4a5568' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '90px', boxSizing: 'border-box' },
  subhead: { marginTop: '8px', color: '#2d3748' },
  saveBtn: { padding: '12px 20px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  backBtn: { padding: '8px 16px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default PatientProfile;
