import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const MedicalRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState({ medicalHistory: [], prescriptions: [], reports: [] });
  const [loading, setLoading] = useState(true);

  const loadRecords = () => {
    setLoading(true);
    API.get('/patient/history')
      .then(res => setRecords({
        medicalHistory: res.data.medicalHistory || [],
        prescriptions: res.data.prescriptions || [],
        reports: res.data.reports || []
      }))
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load records'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const deleteReport = async reportId => {
    try {
      await API.delete(`/patient/reports/${reportId}`);
      toast.success('Report deleted');
      loadRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete report');
    }
  };

  const downloadPrescriptions = async () => {
    try {
      const res = await API.get('/patient/prescriptions/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'prescriptions.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download prescriptions');
    }
  };

  const downloadReport = async (reportId, filename) => {
    try {
      const res = await API.get(`/patient/reports/${reportId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'report';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download report');
    }
  };

  const renderEmpty = label => <p style={styles.emptyText}>No {label} yet.</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Medical Records</h2>
        <button style={styles.backBtn} onClick={() => navigate('/patient/dashboard')}>Back</button>
      </div>

      {loading ? <p>Loading records...</p> : (
        <>
          <section style={styles.section}>
            <h3>Medical History</h3>
            {records.medicalHistory.length === 0 ? renderEmpty('medical history') : records.medicalHistory.map(item => (
              <div key={item._id || `${item.condition}-${item.date}`} style={styles.item}>
                <strong>{item.condition}</strong>
                <p>{item.notes || 'No notes'}</p>
                <small>{item.date ? new Date(item.date).toLocaleDateString() : 'Date not recorded'}</small>
              </div>
            ))}
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3>Prescriptions</h3>
              {records.prescriptions.length > 0 && (
                <button style={styles.downloadBtn} onClick={downloadPrescriptions}>⬇ Download All as PDF</button>
              )}
            </div>
            {records.prescriptions.length === 0 ? renderEmpty('prescriptions') : records.prescriptions.map(item => (
              <div key={item._id || `${item.medication}-${item.date}`} style={styles.item}>
                <strong>{item.medication}</strong>
                <p>Dosage: {item.dosage}</p>
                <p>{item.instructions || 'No instructions'}</p>
                <small>{item.date ? new Date(item.date).toLocaleDateString() : 'Date not recorded'}</small>
              </div>
            ))}
          </section>

          <section style={styles.section}>
            <h3>Uploaded Reports</h3>
            {records.reports.length === 0 ? renderEmpty('reports') : records.reports.map(report => (
              <div key={report._id || report.filename} style={styles.item}>
                <strong>{report.originalName || report.filename}</strong>
                <p>{report.description || 'No description'}</p>
                <small>{report.uploadDate ? new Date(report.uploadDate).toLocaleDateString() : 'Upload date not recorded'}</small>
                <div style={styles.itemActions}>
                  {report._id && (
                    <button style={styles.downloadBtn} onClick={() => downloadReport(report._id, report.originalName || report.filename)}>⬇ Download</button>
                  )}
                  {report._id && (
                    <button style={styles.deleteBtn} onClick={() => deleteReport(report._id)}>Delete Report</button>
                  )}
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  section: { background: 'white', padding: '24px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  item: { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginTop: '12px' },
  itemActions: { display: 'flex', gap: '10px', marginTop: '12px' },
  emptyText: { color: '#718096' },
  downloadBtn: { padding: '8px 14px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  deleteBtn: { padding: '8px 14px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  backBtn: { padding: '8px 16px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default MedicalRecords;
