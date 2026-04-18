import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const MedicalRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState({medicalHistory:[],prescriptions:[],reports:[]});
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    API.get('/patient/history')
      .then(res=>setRecords({medicalHistory:res.data.medicalHistory||[],prescriptions:res.data.prescriptions||[],reports:res.data.reports||[]}))
      .catch(err=>toast.error(err.response?.data?.message||'Failed to load'))
      .finally(()=>setLoading(false));
  };
  useEffect(load,[]);

  const deleteReport = async id => {
    try { await API.delete(`/patient/reports/${id}`); toast.success('Deleted'); load(); }
    catch(e){ toast.error(e.response?.data?.message||'Failed'); }
  };

  const downloadPDF = async () => {
    try {
      const res = await API.get('/patient/prescriptions/download',{responseType:'blob'});
      const url = window.URL.createObjectURL(new Blob([res.data],{type:'application/pdf'}));
      const a = document.createElement('a'); a.href=url; a.download='prescriptions.pdf';
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch(e){ toast.error('Download failed'); }
  };

  const downloadReport = async (id,name) => {
    try {
      const res = await API.get(`/patient/reports/${id}/download`,{responseType:'blob'});
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href=url; a.download=name||'report';
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch(e){ toast.error('Download failed'); }
  };

  const Empty = ({label}) => <p style={{color:'#94a3b8',fontSize:'0.88rem',padding:'12px 0'}}>No {label} on record yet.</p>;

  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{padding:'24px'}}>
        <div className="hc-page-header">
          <div className="hc-page-title">Medical Records</div>
          <button className="hc-btn hc-btn-ghost" onClick={()=>navigate('/patient/dashboard')}>← Back</button>
        </div>

        {loading ? <div className="hc-empty">Loading records...</div> : <>
          <div className="hc-section">
            <h3>🏥 Medical History</h3>
            {records.medicalHistory.length===0 ? <Empty label="medical history"/> : records.medicalHistory.map(item=>(
              <div key={item._id||item.condition} className="hc-item">
                <strong>{item.condition}</strong>
                <p>{item.notes||'No notes'}</p>
                <small>{item.date?new Date(item.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Date not recorded'}</small>
              </div>
            ))}
          </div>

          <div className="hc-section">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',paddingBottom:'10px',borderBottom:'2px solid #ecfeff'}}>
              <h3 style={{margin:0,border:'none',padding:0}}>💊 Prescriptions</h3>
              {records.prescriptions.length>0 && <button className="hc-btn hc-btn-primary" style={{fontSize:'0.8rem',padding:'8px 14px'}} onClick={downloadPDF}>⬇ Download PDF</button>}
            </div>
            {records.prescriptions.length===0 ? <Empty label="prescriptions"/> : records.prescriptions.map(item=>(
              <div key={item._id||item.medication} className="hc-item">
                <strong>{item.medication}</strong>
                <p>Dosage: {item.dosage}</p>
                <p>{item.instructions||'No instructions'}</p>
                {item.doctorName && <p style={{color:'#0891b2',fontWeight:600}}>Dr. {item.doctorName}</p>}
                <small>{item.date?new Date(item.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Date not recorded'}</small>
              </div>
            ))}
          </div>

          <div className="hc-section">
            <h3>📁 Uploaded Reports</h3>
            {records.reports.length===0 ? <Empty label="reports"/> : records.reports.map(r=>(
              <div key={r._id||r.filename} className="hc-item">
                <strong>{r.originalName||r.filename}</strong>
                <p>{r.description||'No description'}</p>
                <small>{r.uploadDate?new Date(r.uploadDate).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Upload date not recorded'}</small>
                {r._id && (
                  <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
                    <button className="hc-btn hc-btn-primary" style={{fontSize:'0.8rem',padding:'7px 14px'}} onClick={()=>downloadReport(r._id,r.originalName||r.filename)}>⬇ Download</button>
                    <button className="hc-btn hc-btn-danger" style={{fontSize:'0.8rem',padding:'7px 14px'}} onClick={()=>deleteReport(r._id)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
};

export default MedicalRecords;