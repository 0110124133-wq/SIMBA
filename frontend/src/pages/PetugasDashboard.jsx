import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Clock, 
  Truck, 
  MapPin, 
  Eye, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  ClipboardList, 
  User, 
  Phone 
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import RouteMap from '../components/RouteMap';

export default function PetugasDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Form states
  const [editStatus, setEditStatus] = useState('approved');
  const [editNotes, setEditNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignedRequests = async () => {
    const token = localStorage.getItem('simba_token');
    try {
      const response = await fetch('https://simba-production-b7a4.up.railway.app/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Gagal mengambil data tugas petugas.');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedRequests();
  }, []);

  const handleOpenDrawer = (req) => {
    setSelectedRequest(req);
    setEditStatus(req.status);
    setEditNotes(req.notes || '');
  };

  const handleCloseDrawer = () => {
    setSelectedRequest(null);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('simba_token');
    try {
      const response = await fetch(`https://simba-production-b7a4.up.railway.app/${selectedRequest.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editStatus,
          notes: editNotes
        })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Gagal memperbarui status tugas.');

      setSuccess('Status tugas berhasil diperbarui!');
      
      // Update local state list
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? {
        ...r,
        status: editStatus,
        notes: editNotes
      } : r));

      // Update selected state
      setSelectedRequest(prev => ({
        ...prev,
        status: editStatus,
        notes: editNotes
      }));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: requests.length,
    scheduled: requests.filter(r => r.status === 'approved').length,
    delivering: requests.filter(r => r.status === 'distributing').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="content-body" style={{ position: 'relative' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--dark-blue)' }}>Dashboard Petugas Lapangan</h1>
        <p style={{ color: 'var(--text-muted)' }}>Daftar tugas pengiriman air bersih PDAM Tirta Asasta Depok</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="card-stat">
          <div className="stat-info">
            <h3>Total Tugas Saya</h3>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-icon stat-blue">
            <ClipboardList size={24} />
          </div>
        </div>

        <div className="card-stat">
          <div className="stat-info">
            <h3>Belum Dikirim</h3>
            <div className="stat-value">{stats.scheduled}</div>
          </div>
          <div className="stat-icon stat-yellow">
            <Clock size={24} />
          </div>
        </div>

        <div className="card-stat">
          <div className="stat-info">
            <h3>Dalam Pengiriman</h3>
            <div className="stat-value">{stats.delivering}</div>
          </div>
          <div className="stat-icon stat-orange">
            <Truck size={24} />
          </div>
        </div>

        <div className="card-stat">
          <div className="stat-info">
            <h3>Selesai Disalurkan</h3>
            <div className="stat-value">{stats.completed}</div>
          </div>
          <div className="stat-icon stat-green">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 className="card-title">
          <ClipboardList size={20} /> Daftar Tugas Pengiriman Air
        </h3>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>Memuat data tugas...</p>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Truck size={48} style={{ color: 'var(--border-color)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Belum ada tugas pengiriman air bersih yang ditugaskan untuk Anda.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Penerima</th>
                  <th>Alamat Lokasi</th>
                  <th>Volume Air</th>
                  <th>Jadwal Rencana</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} style={{ backgroundColor: selectedRequest && selectedRequest.id === req.id ? 'var(--primary-ultra-light)' : '' }}>
                    <td>#{req.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.user_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.user_phone}</div>
                    </td>
                    <td>
                      <div>{req.address}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kel. {req.kelurahan}, Kec. {req.kecamatan}</div>
                    </td>
                    <td>{req.volume_needed} Liter</td>
                    <td style={{ fontWeight: 500 }}>{req.scheduled_date || 'Belum dijadwalkan'}</td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        onClick={() => handleOpenDrawer(req)}
                      >
                        <Eye size={14} /> Proses Tugas
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-out Drawer for Task updates & Maps */}
      <div className={`drawer ${selectedRequest ? 'open' : ''}`}>
        <div className="drawer-header">
          <div>
            <h3 style={{ fontWeight: 'bold', color: 'var(--dark-blue)', fontSize: '1.15rem' }}>
              Proses Tugas #{selectedRequest?.id}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Pemohon: {selectedRequest?.user_name}
            </span>
          </div>
          <button 
            onClick={handleCloseDrawer} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={24} />
          </button>
        </div>

        {selectedRequest && (
          <div className="drawer-body">
            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Penerima Info */}
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', color: 'var(--dark-blue)' }}>
                <User size={16} /> Informasi Penerima Bantuan
              </h4>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedRequest.user_name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Phone size={14} />
                <span>{selectedRequest.user_phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', marginTop: '0.5rem' }}>
                <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedRequest.address}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kelurahan {selectedRequest.kelurahan}, Kecamatan {selectedRequest.kecamatan}</p>
                </div>
              </div>
            </div>

            {/* Request Detail */}
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', color: 'var(--dark-blue)' }}>
                <Droplet size={16} /> Detail Pengiriman
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Kapasitas Air:</span>
                  <p style={{ fontWeight: 'bold', color: 'var(--primary-hover)', fontSize: '0.95rem' }}>{selectedRequest.volume_needed} Liter</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Armada Plat:</span>
                  <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{selectedRequest.truck_plate || '-'}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Jadwal Rencana:</span>
                  <p style={{ fontWeight: 600 }}>{selectedRequest.scheduled_date || 'Belum dijadwalkan'}</p>
                </div>
                {selectedRequest.description && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Catatan Tambahan Lokasi:</span>
                    <p style={{ fontStyle: 'italic', backgroundColor: 'var(--bg-main)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                      "{selectedRequest.description}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Route Map */}
            {selectedRequest.latitude && selectedRequest.longitude && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Peta Navigasi Rute Perjalanan</label>
                <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                  <RouteMap destination={[selectedRequest.latitude, selectedRequest.longitude]} />
                </div>
              </div>
            )}

            {/* Status Update Form */}
            <form onSubmit={handleSaveStatus} className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', color: 'var(--dark-blue)' }}>
                <ShieldCheck size={16} /> Update Progress Lapangan
              </h4>

              <div className="form-group">
                <label>Status Pengiriman Lapangan</label>
                <select 
                  className="form-control"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="approved">Diterima & Terjadwal (Menunggu Keberangkatan)</option>
                  <option value="distributing">Dalam Pengiriman (Di Perjalanan)</option>
                  <option value="completed">Selesai Disalurkan ke Warga</option>
                </select>
              </div>

              <div className="form-group">
                <label>Catatan Lapangan / Penyelesaian</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="Ketik catatan kondisi lapangan atau laporan pengantaran..." 
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ flex: 1 }}
                  onClick={handleCloseDrawer}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 2 }}
                  disabled={submitting}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Update'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
