import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Calendar, Truck, MapPin, Eye, Clock, X } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import RouteMap from '../components/RouteMap';

export default function UserDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchUserRequests = async () => {
    try {
      const token = localStorage.getItem('simba_token');
      const response = await fetch('https://simba-production-b7a4.up.railway.app/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Gagal mengambil data pengajuan.');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    active: requests.filter(r => r.status === 'approved' || r.status === 'distributing').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="content-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--dark-blue)' }}>Dashboard Masyarakat</h1>
          <p style={{ color: 'var(--text-muted)' }}>Pantau status pengajuan bantuan air bersih Anda di PDAM Tirta Asasta Depok</p>
        </div>
        <Link to="/user/new-request" className="btn btn-primary">
          Buat Pengajuan Baru
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="card-stat">
          <div className="stat-info">
            <h3>Total Pengajuan</h3>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-icon stat-blue">
            <Droplet size={24} />
          </div>
        </div>

        <div className="card-stat">
          <div className="stat-info">
            <h3>Menunggu Verifikasi</h3>
            <div className="stat-value">{stats.pending}</div>
          </div>
          <div className="stat-icon stat-yellow">
            <Clock size={24} />
          </div>
        </div>

        <div className="card-stat">
          <div className="stat-info">
            <h3>Sedang Diproses</h3>
            <div className="stat-value">{stats.active}</div>
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
            <Droplet fill="currentColor" size={24} />
          </div>
        </div>
      </div>

      {/* Requests History List */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 className="card-title">
          <Clock size={20} /> Riwayat Pengajuan Bantuan Air
        </h3>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>Memuat data...</p>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Droplet size={48} style={{ color: 'var(--border-color)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Anda belum pernah mengirimkan pengajuan bantuan air.</p>
            <Link to="/user/new-request" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
              Ajukan Bantuan Sekarang
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Judul Pengajuan</th>
                  <th>Alamat Lokasi</th>
                  <th>Volume Air</th>
                  <th>Tanggal Pengajuan</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>#{req.id}</td>
                    <td style={{ fontWeight: 600 }}>{req.title}</td>
                    <td>{req.address} (Kel. {req.kelurahan})</td>
                    <td>{req.volume_needed} Liter</td>
                    <td>{new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        onClick={() => setSelectedRequest(req)}
                      >
                        <Eye size={14} /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '650px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--dark-blue)' }}>Detail Pengajuan #{selectedRequest.id}</h3>
              <button 
                onClick={() => setSelectedRequest(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label>Judul Pengajuan</label>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{selectedRequest.title}</p>
              </div>
              <div>
                <label>Status Pengajuan</label>
                <div><StatusBadge status={selectedRequest.status} /></div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label>Alamat Lengkap</label>
                <p style={{ fontSize: '0.9rem' }}>{selectedRequest.address}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kelurahan: {selectedRequest.kelurahan}, Kecamatan: {selectedRequest.kecamatan}</p>
              </div>
              <div>
                <label>Volume Air Yang Dibutuhkan</label>
                <p style={{ fontWeight: 600 }}>{selectedRequest.volume_needed} Liter</p>
              </div>
              <div>
                <label>Tanggal Dibuat</label>
                <p>{new Date(selectedRequest.created_at).toLocaleString('id-ID')}</p>
              </div>
              {selectedRequest.description && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Deskripsi / Keterangan Tambahan</label>
                  <p style={{ fontSize: '0.9rem', backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: '4px' }}>{selectedRequest.description}</p>
                </div>
              )}
            </div>

            {/* Admin Response/Scheduling Info */}
            {(selectedRequest.scheduled_date || selectedRequest.driver_name || selectedRequest.notes) && (
              <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--primary-ultra-light)', borderColor: 'var(--primary-light)', marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 'bold', color: 'var(--dark-blue)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                  <Truck size={18} /> Informasi Penyaluran PDAM
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {selectedRequest.scheduled_date && (
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jadwal Pengiriman</label>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedRequest.scheduled_date}</p>
                    </div>
                  )}
                  {selectedRequest.driver_name && (
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Driver & Plat Tangki</label>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedRequest.driver_name} ({selectedRequest.truck_plate})</p>
                    </div>
                  )}
                  {selectedRequest.notes && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Catatan dari Admin</label>
                      <p style={{ fontSize: '0.85rem', color: '#1e293b' }}>{selectedRequest.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Route Map for ongoing/scheduled distribution */}
            {selectedRequest.latitude && selectedRequest.longitude && 
             ['approved', 'distributing', 'completed'].includes(selectedRequest.status) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ marginBottom: '0.5rem' }}>Peta Perjalanan Tangki Air (PDAM - Lokasi)</label>
                <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                  <RouteMap destination={[selectedRequest.latitude, selectedRequest.longitude]} />
                </div>
              </div>
            )}

            {/* Image uploaded display */}
            {selectedRequest.image_url && (
              <div style={{ marginBottom: '1rem' }}>
                <label>Foto Bukti Dokumentasi</label>
                <img 
                  src={selectedRequest.image_url.startsWith('data:') ? selectedRequest.image_url : `http://localhost:5000${selectedRequest.image_url}`} 
                  alt="Dokumentasi Kekeringan" 
                  style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '0.25rem' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedRequest(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
