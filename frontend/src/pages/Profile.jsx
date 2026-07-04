import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Lock, Save } from 'lucide-react';

export default function Profile({ onProfileUpdate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    const token = localStorage.getItem('simba_token');
    try {
      const response = await fetch('https://simba-production-b7a4.up.railway.app/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Gagal mengambil profil.');
      const data = await response.json();
      setName(data.name);
      setEmail(data.email);
      setPhone(data.phone || '');
      setAddress(data.address || '');
      setRole(data.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password && password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setUpdating(true);
    const token = localStorage.getItem('simba_token');
    try {
      const body = { name, phone, address };
      if (password) {
        body.password = password;
      }

      const response = await fetch('https://simba-production-b7a4.up.railway.app/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Gagal memperbarui profil.');

      setSuccess('Profil berhasil diperbarui!');
      setPassword('');
      setConfirmPassword('');
      
      // Update global user state in App.jsx
      onProfileUpdate({ name, email, phone, address, role });
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="content-body" style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--dark-blue)' }}>Profil Saya</h1>
        <p style={{ color: 'var(--text-muted)' }}>Kelola data pribadi Anda dan ubah kata sandi akun Anda</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Memuat profil...</p>
      ) : (
        <form onSubmit={handleSubmit} className="card">
          <h3 className="card-title">
            <User size={20} /> Data Pribadi
          </h3>

          <div className="form-group">
            <label>Alamat Email (Tidak dapat diubah)</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              disabled
              style={{ backgroundColor: 'var(--bg-main)', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label>Nama Lengkap *</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Nomor Telepon / WhatsApp</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="tel" 
                className="form-control" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Alamat Rumah Lengkap</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <textarea 
                className="form-control" 
                rows={3} 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <h3 className="card-title" style={{ marginTop: '2.5rem' }}>
            <Lock size={20} /> Keamanan (Ubah Password)
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label>Password Baru</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Kosongkan jika tidak ingin diubah" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Konfirmasi Password Baru</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Ulangi password baru" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" disabled={updating}>
              <Save size={18} />
              {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
