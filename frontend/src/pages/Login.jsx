import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet, Mail, Lock } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://simba-production-b7a4.up.railway.app/api/requests/track/1://simba-production-b7a4.up.railway.app/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal.');
      }

      // Save token and user details
      localStorage.setItem('simba_token', data.token);
      localStorage.setItem('simba_user', JSON.stringify(data.user));

      onLoginSuccess(data.user);

      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Droplet fill="currentColor" size={32} />
            <span>SIMBA</span>
          </div>
          <p className="auth-subtitle">Sistem Informasi Manajemen Bantuan Air</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Alamat Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-control" 
                placeholder="nama@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-control" 
                placeholder="Masukkan password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }} disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk ke Akun'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Belum punya akun? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Daftar disini</Link>
        </div>
        <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}
