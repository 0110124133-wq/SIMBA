import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, X, ShieldAlert, Phone, UserCheck } from 'lucide-react';

export default function AdminUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('user');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    const token = localStorage.getItem('simba_token');
    try {
      const response = await fetch('https://simba-production-b7a4.up.railway.app/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Gagal mengambil data user.');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('simba_token');
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password, phone, address, role })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Gagal menambahkan user.');

      setSuccess('User baru berhasil ditambahkan!');
      fetchUsers(); // Refresh list

      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setAddress('');
      setRole('user');
      
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    if (!window.confirm('Apakah Anda yakin ingin menghapus user ini secara permanen?')) return;

    const token = localStorage.getItem('simba_token');
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Gagal menghapus user.');

      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="content-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--dark-blue)' }}>Kelola Pengguna</h1>
          <p style={{ color: 'var(--text-muted)' }}>Daftar, tambahkan, atau hapus akun admin dan masyarakat SIMBA</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Tambah User Baru
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>Memuat data pengguna...</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Lengkap</th>
                <th>Email</th>
                <th>No. Telepon</th>
                <th>Peran (Role)</th>
                <th>Tanggal Pendaftaran</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: u.role === 'admin' ? 'var(--status-approved-bg)' : u.role === 'petugas' ? '#ffedd5' : 'var(--border-color)',
                        color: u.role === 'admin' ? 'var(--status-approved-text)' : u.role === 'petugas' ? '#ea580c' : 'var(--text-muted)'
                      }}
                    >
                      {u.role === 'admin' ? 'Admin' : u.role === 'petugas' ? 'Petugas Lapangan' : 'Masyarakat'}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className="btn btn-danger"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }}
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === currentUser?.id}
                      title={u.id === currentUser?.id ? 'Tidak dapat menghapus diri sendiri' : 'Hapus User'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '500px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--dark-blue)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <UserCheck size={20} /> Tambah Pengguna Baru
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Nama Lengkap *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Masukkan nama lengkap" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Alamat Email *</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="nama@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Minimal 6 karakter" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Peran (Role) *</label>
                  <select 
                    className="form-control"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="user">Masyarakat</option>
                    <option value="petugas">Petugas Lapangan</option>
                    <option value="admin">Admin PDAM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Nomor Telepon / WhatsApp</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="Contoh: 081234567890" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Alamat Rumah Lengkap</label>
                <textarea 
                  className="form-control" 
                  rows={2} 
                  placeholder="Nama jalan, RT/RW, kelurahan, kecamatan" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Menyimpan...' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
