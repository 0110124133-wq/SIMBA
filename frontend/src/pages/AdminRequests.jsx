import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, Trash2, Clock, X, User, Droplets, MapPin, Truck, ShieldCheck } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import RouteMap from '../components/RouteMap';

export default function AdminRequests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Form edit states
  const [editStatus, setEditStatus] = useState('pending');
  const [editNotes, setEditNotes] = useState('');
  const [editScheduledDate, setEditScheduledDate] = useState('');
  const [editDriverName, setEditDriverName] = useState('');
  const [editTruckPlate, setEditTruckPlate] = useState('');
  const [editPetugasId, setEditPetugasId] = useState('');
  const [petugasList, setPetugasList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    const token = localStorage.getItem('simba_token');
    try {
      const response = await fetch('https://simba-production-b7a4.up.railway.app/api/requests/track/1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Gagal mengambil data pengajuan.');
      const data = await response.json();
      setRequests(data);

      // Check if there is an ID in query parameters
      const urlId = searchParams.get('id');
      if (urlId && data.length > 0) {
        const found = data.find(r => r.id === parseInt(urlId));
        if (found) {
          handleOpenDrawer(found);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPetugas = async () => {
    const token = localStorage.getItem('simba_token');
    try {
      const response = await fetch('https://simba-production-b7a4.up.railway.app/api/requests/track/1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPetugasList(data.filter(u => u.role === 'petugas'));
      }
    } catch (err) {
      console.error('Gagal mengambil data petugas:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchPetugas();
  }, [searchParams]);

  const handleOpenDrawer = (req) => {
    setSelectedRequest(req);
    setEditStatus(req.status);
    setEditNotes(req.notes || '');
    setEditScheduledDate(req.scheduled_date || '');
    setEditDriverName(req.driver_name || '');
    setEditTruckPlate(req.truck_plate || '');
    setEditPetugasId(req.petugas_id || '');
  };

  const handleCloseDrawer = () => {
    setSelectedRequest(null);
    setSearchParams({}); // Clear query parameters
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('simba_token');
    try {
      const response = await fetch(`https://simba-production-b7a4.up.railway.app/api/adminrequest/track/1${selectedRequest.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editStatus,
          notes: editNotes,
          scheduled_date: editScheduledDate,
          driver_name: editDriverName,
          truck_plate: editTruckPlate,
          petugas_id: editPetugasId || null
        })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Gagal memperbarui status.');

      setSuccess('Status pengajuan berhasil diperbarui!');
      
      const selectedPetugas = petugasList.find(p => p.id === parseInt(editPetugasId));
      const petugasName = selectedPetugas ? selectedPetugas.name : '';

      // Update local requests list
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? {
        ...r,
        status: editStatus,
        notes: editNotes,
        scheduled_date: editScheduledDate,
        driver_name: editDriverName,
        truck_plate: editTruckPlate,
        petugas_id: editPetugasId || null,
        petugas_name: petugasName
      } : r));

      // Update selected state to trigger map recalculations
      setSelectedRequest(prev => ({
        ...prev,
        status: editStatus,
        notes: editNotes,
        scheduled_date: editScheduledDate,
        driver_name: editDriverName,
        truck_plate: editTruckPlate,
        petugas_id: editPetugasId || null,
        petugas_name: petugasName
      }));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengajuan ini secara permanen?')) return;

    const token = localStorage.getItem('simba_token');
    try {
      const response = await fetch(`https://simba-production-b7a4.up.railway.app/api/requests/track/1${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Gagal menghapus pengajuan.');

      setRequests(prev => prev.filter(r => r.id !== id));
      if (selectedRequest && selectedRequest.id === id) {
        handleCloseDrawer();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredRequests = requests.filter(r => filterStatus === 'all' || r.status === filterStatus);

  return (
    <div className="content-body" style={{ position: 'relative' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--dark-blue)' }}>Verifikasi & Distribusi Bantuan</h1>
        <p style={{ color: 'var(--text-muted)' }}>Proses persetujuan, jadwalkan tangki air, dan arahkan rute pengantaran</p>
      </div>

      {/* Filters Row */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Filter Status:</span>
        <button 
          className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline'}`} 
          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          onClick={() => setFilterStatus('all')}
        >
          Semua ({requests.length})
        </button>
        <button 
          className={`btn ${filterStatus === 'pending' ? 'btn-primary' : 'btn-outline'}`} 
          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          onClick={() => setFilterStatus('pending')}
        >
          Menunggu ({requests.filter(r => r.status === 'pending').length})
        </button>
        <button 
          className={`btn ${filterStatus === 'approved' ? 'btn-primary' : 'btn-outline'}`} 
          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          onClick={() => setFilterStatus('approved')}
        >
          Terjadwal ({requests.filter(r => r.status === 'approved').length})
        </button>
        <button 
          className={`btn ${filterStatus === 'distributing' ? 'btn-primary' : 'btn-outline'}`} 
          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          onClick={() => setFilterStatus('distributing')}
        >
          Dikirim ({requests.filter(r => r.status === 'distributing').length})
        </button>
        <button 
          className={`btn ${filterStatus === 'completed' ? 'btn-primary' : 'btn-outline'}`} 
          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          onClick={() => setFilterStatus('completed')}
        >
          Selesai ({requests.filter(r => r.status === 'completed').length})
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>Memuat data pengajuan...</p>
      ) : filteredRequests.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <Clock size={40} style={{ color: 'var(--border-color)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Tidak ada pengajuan bantuan air bersih dalam kategori ini.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pemohon</th>
                <th>Alamat Lokasi</th>
                <th>Volume</th>
                <th>Tanggal Masuk</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
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
                  <td>{req.volume_needed} L</td>
                  <td>{new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</td>
                  <td>
                    <StatusBadge status={req.status} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        onClick={() => handleOpenDrawer(req)}
                      >
                        <Eye size={14} /> Proses
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }}
                        onClick={() => handleDelete(req.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-out Drawer for Verification & Scheduling & Routing */}
      <div className={`drawer ${selectedRequest ? 'open' : ''}`}>
        <div className="drawer-header">
          <div>
            <h3 style={{ fontWeight: 'bold', color: 'var(--dark-blue)', fontSize: '1.15rem' }}>
              Verifikasi Pengajuan #{selectedRequest?.id}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Masuk: {selectedRequest && new Date(selectedRequest.created_at).toLocaleString('id-ID')}
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

            {/* Citizen info */}
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', color: 'var(--dark-blue)' }}>
                <User size={16} /> Informasi Pemohon
              </h4>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedRequest.user_name}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email: {selectedRequest.user_email}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>HP: {selectedRequest.user_phone}</p>
            </div>

            {/* Request info */}
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', color: 'var(--dark-blue)' }}>
                <Droplets size={16} /> Detail Permintaan
              </h4>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{selectedRequest.title}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{selectedRequest.description || 'Tidak ada deskripsi tambahan.'}</p>
              
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedRequest.address}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kelurahan {selectedRequest.kelurahan}, Kecamatan {selectedRequest.kecamatan}</p>
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <span>Kapasitas Dibutuhkan:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--primary-hover)' }}>{selectedRequest.volume_needed} Liter</span>
              </div>
            </div>

            {/* Document Image */}
            {selectedRequest.image_url && (
              <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--dark-blue)' }}>
                  Foto Bukti Kondisi
                </h4>
                <img 
                  src={`https://simba-production-b7a4.up.railway.app/api/requests/track/1${selectedRequest.image_url}`} 
                  alt="Kondisi Kekeringan" 
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
              </div>
            )}

            {/* Route Map (Show only if approved/distributing/completed) */}
            {selectedRequest.latitude && selectedRequest.longitude && 
             ['approved', 'distributing', 'completed'].includes(editStatus) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label>Peta Perjalanan Tangki Air (PDAM - Lokasi)</label>
                <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                  <RouteMap destination={[selectedRequest.latitude, selectedRequest.longitude]} />
                </div>
              </div>
            )}

            {/* Driver/Petugas info if assigned */}
            {selectedRequest.driver_name && (
              <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#f8fafc' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', color: 'var(--dark-blue)' }}>
                  <Truck size={16} /> Detail Tugas Pengiriman
                </h4>
                <p style={{ fontSize: '0.85rem' }}><strong>Petugas/Driver:</strong> {selectedRequest.driver_name}</p>
                <p style={{ fontSize: '0.85rem' }}><strong>Plat Nomor:</strong> {selectedRequest.truck_plate || '-'}</p>
                {selectedRequest.petugas_name && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Akun Petugas Lapangan: {selectedRequest.petugas_name}</p>
                )}
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleSaveStatus} className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', color: 'var(--dark-blue)' }}>
                <ShieldCheck size={16} /> Tindakan & Jadwal Pengiriman
              </h4>

              <div className="form-group">
                <label>Status Permintaan</label>
                <select 
                  className="form-control"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="pending">Menunggu Verifikasi</option>
                  <option value="approved">Setujui & Jadwalkan</option>
                  <option value="distributing">Dalam Pengiriman (Jalan)</option>
                  <option value="completed">Selesai Didistribusikan</option>
                  <option value="rejected">Tolak Permintaan</option>
                </select>
              </div>

              {['approved', 'distributing', 'completed'].includes(editStatus) && (
                <>
                  <div className="form-group">
                    <label>Jadwal Pengiriman</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: Sabtu, 24 Juni 2026 - Pukul 09:00 WIB" 
                      value={editScheduledDate}
                      onChange={(e) => setEditScheduledDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Petugas Lapangan (Driver)</label>
                      <select 
                        className="form-control" 
                        value={editPetugasId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditPetugasId(val);
                          const found = petugasList.find(p => p.id === parseInt(val));
                          if (found) {
                            setEditDriverName(found.name);
                          } else {
                            setEditDriverName('');
                          }
                        }}
                        required
                      >
                        <option value="">-- Pilih Petugas --</option>
                        {petugasList.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>No Polisi Tangki</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Contoh: B 9012 ZD" 
                        value={editTruckPlate}
                        onChange={(e) => setEditTruckPlate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Catatan Admin (Untuk Warga)</label>
                <textarea 
                  className="form-control" 
                  rows={2} 
                  placeholder="Ketik balasan atau alasan jika ditolak..." 
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
                  Tutup
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 2 }}
                  disabled={submitting}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
