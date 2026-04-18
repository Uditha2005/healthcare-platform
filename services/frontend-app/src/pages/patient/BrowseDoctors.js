import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const BrowseDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState('');
  const navigate = useNavigate();
  const initials = name => name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'DR';

  const fetchDoctors = (sel = '') => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sel) {
      params.append('specialty', sel);
      params.append('name', sel);
    }
    const q = params.toString() ? `?${params.toString()}` : '';
    API.get(`/doctors${q}`)
      .then(res => {
        const data = res.data.doctors || res.data || [];
        // Only show verified doctors
        setDoctors(data.filter(d => d.isVerified));
      })
      .catch(() => { toast.error('Failed to load doctors'); setDoctors([]); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoctors(); }, []);

  return (
    <>
        <div className="dash-header">
          <div>
            <div className="dash-header-title">Find Doctors</div>
            <div className="dash-header-sub">Browse and book appointments with verified specialists</div>
          </div>
        </div>

        <div className="dash-content">
          {/* Search bar */}
          <div style={{background:'white',borderRadius:'16px',border:'1px solid #e0f2fe',padding:'20px 24px',marginBottom:'24px',boxShadow:'0 2px 8px rgba(8,145,178,0.06)'}}>
            <form style={{display:'flex',gap:'12px'}} onSubmit={e => { e.preventDefault(); fetchDoctors(specialty); }}>
              <input
                className="hc-input"
                style={{margin:0,flex:1}}
                placeholder="Search by name or specialty (e.g. Cardiology, Dr. Smith)..."
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
              />
              <button className="hc-btn hc-btn-primary" type="submit" style={{whiteSpace:'nowrap',padding:'11px 24px'}}>
                🔍 Search
              </button>
              {specialty && (
                <button className="hc-btn hc-btn-ghost" type="button" onClick={() => { setSpecialty(''); fetchDoctors(''); }}>
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Results */}
          {loading ? (
            <div className="hc-empty"><p>Loading doctors...</p></div>
          ) : doctors.length === 0 ? (
            <div className="hc-empty">
              <div style={{fontSize:'2.5rem',marginBottom:'12px'}}>🔍</div>
              <p style={{fontWeight:600,marginBottom:'6px'}}>No verified doctors found</p>
              <p style={{fontSize:'0.85rem',color:'#94a3b8'}}>Try a different specialty or check back later</p>
            </div>
          ) : (
            <>
              <div className="dash-section-title">{doctors.length} Doctor{doctors.length!==1?'s':''} Available</div>
              <div className="dash-services">
                {doctors.map((doc, i) => (
                  <div key={doc._id||doc.id} className="dash-service-card hc-animate" style={{animationDelay:`${i*0.05}s`,cursor:'default'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'16px'}}>
                      <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#10b981,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'1rem',flexShrink:0}}>
                        {initials(doc.name)}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:'1rem',color:'#0c1a2e'}}>Dr. {doc.name}</div>
                        <div style={{fontSize:'0.8rem',color:'#0891b2',fontWeight:600,marginTop:'2px'}}>{doc.specialization||doc.specialty||'General Physician'}</div>
                        <span style={{background:'#d1fae5',color:'#065f46',borderRadius:'999px',padding:'2px 8px',fontSize:'0.7rem',fontWeight:700}}>✓ Verified</span>
                      </div>
                    </div>

                    <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'16px'}}>
                      {doc.experience && (
                        <div style={s.meta}>⭐ <span>{doc.experience} years experience</span></div>
                      )}
                      {doc.hospital && (
                        <div style={s.meta}>🏥 <span>{doc.hospital}</span></div>
                      )}
                      {doc.consultationFee && (
                        <div style={s.meta}>💰 <span>LKR {doc.consultationFee}</span></div>
                      )}
                      <div style={s.meta}>📧 <span style={{wordBreak:'break-all',fontSize:'0.78rem'}}>{doc.email}</span></div>
                    </div>

                    {doc.bio && (
                      <p style={{fontSize:'0.8rem',color:'#64748b',lineHeight:1.5,marginBottom:'14px',borderTop:'1px solid #f0f9ff',paddingTop:'12px'}}>
                        {doc.bio.length > 100 ? doc.bio.slice(0,100)+'...' : doc.bio}
                      </p>
                    )}

                    <button
                      className="hc-btn hc-btn-primary"
                      style={{width:'100%',justifyContent:'center',padding:'11px'}}
                      onClick={() => navigate('/patient/book-appointment', { state:{ doctor:doc } })}
                    >
                      📅 Book Appointment
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
    </>
  );
};

const s = { meta:{ display:'flex', gap:'8px', fontSize:'0.83rem', color:'#64748b', alignItems:'center' } };

export default BrowseDoctors;