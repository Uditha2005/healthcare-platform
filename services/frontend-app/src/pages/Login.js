import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      toast.success('Login successful!');
      const role = res.data.user.role;
      if (role === 'patient') navigate('/patient/dashboard');
      else if (role === 'doctor') navigate('/doctor/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.brand}>⚕ MediConnect</div>
        <h1 style={s.hero}>Healthcare<br/>at your<br/>fingertips.</h1>
        <p style={s.sub}>Book appointments, consult doctors, and manage your health — all in one place.</p>
        <div style={s.pills}>
          {['AI Symptom Checker','Video Consultations','Digital Prescriptions'].map(t => (
            <span key={t} style={s.pill}>{t}</span>
          ))}
        </div>
      </div>
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.title}>Welcome back</h2>
          <p style={s.hint}>Sign in to your account</p>
          <form onSubmit={handleSubmit}>
            <label className="hc-label">Email address</label>
            <input className="hc-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            <label className="hc-label">Password</label>
            <input className="hc-input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            <button className="hc-btn hc-btn-primary" style={{width:'100%',padding:'13px',fontSize:'1rem',marginTop:'8px',justifyContent:'center'}} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <p style={s.link}>Don't have an account? <Link to="/register" style={{color:'var(--primary)',fontWeight:600}}>Register</Link></p>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: { display:'flex', minHeight:'100vh', fontFamily:"'Plus Jakarta Sans',sans-serif" },
  left: { flex:1, background:'linear-gradient(145deg,#0e7490 0%,#0891b2 50%,#6366f1 100%)', padding:'60px 48px', display:'flex', flexDirection:'column', justifyContent:'center', position:'relative', overflow:'hidden' },
  brand: { fontSize:'1.3rem', fontWeight:800, color:'rgba(255,255,255,0.95)', marginBottom:'48px', fontFamily:"'Outfit',sans-serif", letterSpacing:'-0.01em' },
  hero: { fontSize:'3rem', fontWeight:800, color:'white', lineHeight:1.1, marginBottom:'20px', fontFamily:"'Outfit',sans-serif" },
  sub: { color:'rgba(255,255,255,0.78)', fontSize:'1rem', lineHeight:1.6, marginBottom:'32px', maxWidth:'340px' },
  pills: { display:'flex', flexDirection:'column', gap:'10px' },
  pill: { display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.12)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.2)', color:'white', padding:'8px 16px', borderRadius:'999px', fontSize:'0.82rem', fontWeight:500, width:'fit-content' },
  right: { width:'480px', background:'#f0f9ff', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px' },
  card: { background:'white', borderRadius:'20px', padding:'40px', width:'100%', boxShadow:'0 12px 40px rgba(8,145,178,0.12)', border:'1px solid #e0f2fe' },
  title: { fontSize:'1.6rem', fontWeight:800, color:'#0c1a2e', marginBottom:'6px', fontFamily:"'Outfit',sans-serif" },
  hint: { color:'#94a3b8', fontSize:'0.9rem', marginBottom:'28px' },
  link: { textAlign:'center', marginTop:'20px', color:'#94a3b8', fontSize:'0.88rem' }
};

export default Login;