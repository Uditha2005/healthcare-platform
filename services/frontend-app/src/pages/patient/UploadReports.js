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
    const fd = new FormData();
    fd.append('report', file);
    fd.append('description', description);
    try {
      await API.post('/patient/upload-report', fd, {headers:{'Content-Type':'multipart/form-data'}});
      toast.success('Report uploaded successfully!');
      navigate('/patient/dashboard');
    } catch(err){ toast.error(err.response?.data?.message||'Upload failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{padding:'24px',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div className="hc-form-card" style={{maxWidth:'100%'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
          <div>
            <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:'1.5rem',fontWeight:800}}>Upload Report</h2>
            <p style={{color:'#64748b',fontSize:'0.88rem',marginTop:'4px'}}>Supported: PDF, JPG, JPEG, PNG (max 10MB)</p>
          </div>
          <button className="hc-btn hc-btn-ghost" onClick={()=>navigate('/patient/dashboard')}>← Back</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="hc-label">Select File</label>
          <div style={{border:'2px dashed #bae6fd',borderRadius:'12px',padding:'32px',textAlign:'center',marginBottom:'16px',background:'#ecfeff',cursor:'pointer'}}
            onClick={()=>document.getElementById('fileInput').click()}>
            <div style={{fontSize:'2rem',marginBottom:'8px'}}>📁</div>
            <p style={{color:'#0891b2',fontWeight:600,fontSize:'0.9rem'}}>{file?file.name:'Click to choose file'}</p>
            <p style={{color:'#94a3b8',fontSize:'0.8rem',marginTop:'4px'}}>{file?`${(file.size/1024/1024).toFixed(2)} MB`:'PDF, JPG, PNG up to 10MB'}</p>
          </div>
          <input id="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>setFile(e.target.files[0])} required style={{display:'none'}} />

          <label className="hc-label">Description</label>
          <textarea className="hc-input" placeholder="Describe the report (e.g. Blood test results from April 2026)..." value={description} onChange={e=>setDescription(e.target.value)} required style={{minHeight:'100px',resize:'vertical'}} />

          <button className="hc-btn hc-btn-success" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center',padding:'13px',fontSize:'1rem',marginTop:'8px'}}>
            {loading?'Uploading...':'⬆ Upload Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadReports;