import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const UploadReports = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    setLoading(true);
    const formData = new FormData();
    formData.append('report', file);
    formData.append('description', description);
    try {
      await API.post('/patient/upload-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Report uploaded successfully!');
      navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>📋 Upload Medical Report</h2>
          <button style={styles.backBtn} onClick={() => navigate('/patient/dashboard')}>← Back</button>
        </div>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Select Report File (PDF/Image)</label>
          <input style={styles.input} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} required />
          <label style={styles.label}>Description</label>
          <textarea style={styles.textarea} placeholder="Describe the report..." value={description} onChange={e => setDescription(e.target.value)} required />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Uploading...' : '📤 Upload Report'}
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
  label: { display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#4a5568' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px', boxSizing: 'border-box', minHeight: '100px' },
  btn: { width: '100%', padding: '12px', background: '#38a169', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  backBtn: { padding: '8px 16px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default UploadReports;