import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { toast } from 'react-toastify';

const Register = () => {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'patient', specialization:'', experience:'' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(form);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.brand}>⚕ MediConnect</div>
        <h1 style={s.hero}>Join us today.</h1>
        <p style={s.sub}>Create your account and start managing your healthcare journey with ease.</p>
        <div style={s.steps}>
          {[['01','Create account'],['02','Complete profile'],['03','Start using platform']].map(([n,t])=>(
            <div key={n} style={s.step}>
              <span style={s.stepNum}>{n}</span>
              <span style={s.stepText}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.title}>Create Account</h2>
          <p style={s.hint}>Fill in your details to get started</p>
          <form onSubmit={handleSubmit}>
            <label className="hc-label">Full Name</label>
            <input className="hc-input" type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />

            <label className="hc-label">Email Address</label>
            <input className="hc-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />

            <label className="hc-label">Password</label>
            <input className="hc-input" type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />

            <label className="hc-label">Register As</label>
            <div style={s.roleGrid}>
              {[['patient','🧑','Patient'],['doctor','👨‍⚕️','Doctor'],['admin','🛡️','Admin']].map(([val,icon,label])=>(
                <div key={val} style={{...s.roleCard, ...(form.role===val ? s.roleCardActive : {})}} onClick={()=>setForm({...form,role:val})}>
                  <span style={{fontSize:'1.4rem'}}>{icon}</span>
                  <span style={{fontSize:'0.8rem',fontWeight:600,color:form.role===val?'#0e7490':'#64748b'}}>{label}</span>
                </div>
              ))}
            </div>

            {form.role === 'doctor' && (
              <div style={{background:'#ecfeff',border:'1px solid #a5f3fc',borderRadius:'10px',padding:'16px',marginBottom:'16px'}}>
                <label className="hc-label">Specialization</label>
                <input className="hc-input" type="text" name="specialization" placeholder="e.g. Cardiology" value={form.specialization} onChange={handleChange} required />
                <label className="hc-label">Years of Experience</label>
                <input className="hc-input" type="number" name="experience" placeholder="e.g. 5" value={form.experience} onChange={handleChange} required style={{marginBottom:0}} />
              </div>
            )}

            <button className="hc-btn hc-btn-success" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center',padding:'13px',fontSize:'1rem',marginTop:'8px'}}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
          <p style={s.link}>Already have an account? <Link to="/login" style={{color:'var(--primary)',fontWeight:600}}>Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: { display:'flex', minHeight:'100vh', fontFamily:"'Plus Jakarta Sans',sans-serif" },
  left: { flex:1, background:'linear-gradient(145deg,#0e7490 0%,#0891b2 50%,#6366f1 100%)', padding:'60px 48px', display:'flex', flexDirection:'column', justifyContent:'center' },
  brand: { fontSize:'1.3rem', fontWeight:800, color:'rgba(255,255,255,0.95)', marginBottom:'48px', fontFamily:"'Outfit',sans-serif" },
  hero: { fontSize:'2.8rem', fontWeight:800, color:'white', lineHeight:1.1, marginBottom:'20px', fontFamily:"'Outfit',sans-serif" },
  sub: { color:'rgba(255,255,255,0.78)', fontSize:'1rem', lineHeight:1.6, marginBottom:'40px', maxWidth:'340px' },
  steps: { display:'flex', flexDirection:'column', gap:'16px' },
  step: { display:'flex', alignItems:'center', gap:'14px' },
  stepNum: { width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'0.75rem', fontWeight:700, flexShrink:0 },
  stepText: { color:'rgba(255,255,255,0.85)', fontSize:'0.9rem', fontWeight:500 },
  right: { width:'500px', background:'#f0f9ff', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px', overflowY:'auto' },
  card: { background:'white', borderRadius:'20px', padding:'36px', width:'100%', boxShadow:'0 12px 40px rgba(8,145,178,0.12)', border:'1px solid #e0f2fe' },
  title: { fontSize:'1.6rem', fontWeight:800, color:'#0c1a2e', marginBottom:'6px', fontFamily:"'Outfit',sans-serif" },
  hint: { color:'#94a3b8', fontSize:'0.9rem', marginBottom:'24px' },
  roleGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'16px' },
  roleCard: { display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', padding:'12px 8px', borderRadius:'10px', border:'2px solid #e0f2fe', cursor:'pointer', transition:'all 0.15s', background:'#f8fafc' },
  roleCardActive: { border:'2px solid #0891b2', background:'#ecfeff' },
  link: { textAlign:'center', marginTop:'20px', color:'#94a3b8', fontSize:'0.88rem' }
};

export default Register;