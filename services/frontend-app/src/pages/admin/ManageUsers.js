import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    API.get('/auth/users')
      .then(res => setUsers(res.data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await API.delete(`/auth/users/${id}`);
      toast.success('User deleted!');
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);
  const roleColor = { patient: '#3182ce', doctor: '#38a169', admin: '#805ad5' };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>👥 Manage Users</h2>
        <button style={styles.backBtn} onClick={() => navigate('/admin/dashboard')}>← Back</button>
      </div>
      <div style={styles.filters}>
        {['all','patient','doctor','admin'].map(f => (
          <button key={f} style={{ ...styles.filterBtn, background: filter === f ? '#3182ce' : '#e2e8f0', color: filter === f ? 'white' : '#4a5568' }} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {loading ? <p>Loading users...</p> : filtered.length === 0 ? (
        <div style={styles.empty}><p>No users found.</p></div>
      ) : (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span>Name</span><span>Email</span><span>Role</span><span>Actions</span>
          </div>
          {filtered.map((user, i) => (
            <div key={i} style={styles.tableRow}>
              <span>{user.name}</span>
              <span>{user.email}</span>
              <span style={{ color: roleColor[user.role], fontWeight: 'bold' }}>{user.role}</span>
              <button style={styles.deleteBtn} onClick={() => deleteUser(user._id)}>🗑️ Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  filters: { display: 'flex', gap: '10px', marginBottom: '20px' },
  filterBtn: { padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  table: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', padding: '16px 24px', background: '#f7fafc', fontWeight: 'bold', color: '#4a5568' },
  tableRow: { display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', padding: '16px 24px', borderTop: '1px solid #e2e8f0', alignItems: 'center' },
  deleteBtn: { padding: '6px 12px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  empty: { background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' },
  backBtn: { padding: '8px 16px', background: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default ManageUsers;