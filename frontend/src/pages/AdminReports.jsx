import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Printer, Filter, Droplet } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function AdminReports({ currentUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('all');
  const [kecamatan, setKecamatan] = useState('all');

  const fetchReportsData = async () => {
    const token = localStorage.getItem('simba_token');
    try {
      const response = await fetch('https://simba-production-b7a4.up.railway.app/api/requests/track/1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Gagal mengambil data laporan.');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const filteredRequests = requests.filter(req => {
    if (startDate) {
      const reqDate = new Date(req.created_at).toISOString().split('T')[0];
      if (reqDate < startDate) return false;
    }
    if (endDate) {
      const reqDate = new Date(req.created_at).toISOString().split('T')[0];
      if (reqDate > endDate) return false;
    }
    if (status !== 'all' && req.status !== status) return false;
    if (kecamatan !== 'all' && req.kecamatan !== kecamatan) return false;

    return true;
  });

  const uniqueKecamatans = [...new Set(requests.map(r => r.kecamatan).filter(Boolean))];

  const totalVolume = filteredRequests
    .filter(r => r.status !== 'rejected')
    .reduce((sum, r) => sum + r.volume_needed, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="content-body">
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--dark-blue)' }}>Laporan Penyaluran Air</h1>
          <p style={{ color: 'var(--text-muted)' }}>Cetak rekapitulasi data pengajuan bantuan air bersih berdasarkan filter wilayah & tanggal</p>
        </div>
        <button className="btn btn-primary" onClick={handlePrint} disabled={filteredRequests.length === 0}>
          <Printer size={18} /> Cetak Laporan
        </button>
      </div>

      {error && <div className="alert alert-danger no-print">{error}</div>}

      {/* Filter Card */}
      <div className="card no-print" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          <Filter size={18} /> Filter Laporan
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Tanggal Mulai</label>
            <input 
              type="date" 
              className="form-control" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Tanggal Selesai</label>
            <input 
              type="date" 
              className="form-control" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Status</label>
            <select 
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Verifikasi</option>
              <option value="approved">Disetujui & Terjadwal</option>
              <option value="distributing">Dalam Pengiriman</option>
              <option value="completed">Selesai Didistribusikan</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Kecamatan</label>
            <select 
              className="form-control"
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value)}
            >
              <option value="all">Semua Kecamatan</option>
              {uniqueKecamatans.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="stats-grid no-print" style={{ marginBottom: '2rem' }}>
        <div className="card-stat">
          <div className="stat-info">
            <h3>Pengajuan Terfilter</h3>
            <div className="stat-value">{filteredRequests.length}</div>
          </div>
          <div className="stat-icon stat-blue">
            <FileSpreadsheet size={24} />
          </div>
        </div>

        <div className="card-stat">
          <div className="stat-info">
            <h3>Volume Air Disetujui/Disalurkan</h3>
            <div className="stat-value" style={{ fontSize: '1.6rem' }}>{totalVolume.toLocaleString('id-ID')} L</div>
          </div>
          <div className="stat-icon stat-green">
            <Droplet size={24} />
          </div>
        </div>

        <div className="card-stat">
          <div className="stat-info">
            <h3>Selesai Tersalurkan</h3>
            <div className="stat-value">{filteredRequests.filter(r => r.status === 'completed').length}</div>
          </div>
          <div className="stat-icon stat-blue" style={{ backgroundColor: 'var(--status-completed-bg)', color: 'var(--status-completed-text)' }}>
            <Printer size={24} />
          </div>
        </div>
      </div>

      {/* Printable Report Card */}
      <div className="card print-report-card" style={{ padding: '2rem' }}>
        {/* Printable Header (Visible only on print) */}
        <div className="print-header-only" style={{ textAlign: 'center', borderBottom: '3px double #000', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>PDAM TIRTA ASASTA DEPOK</h2>
          <p style={{ fontSize: '0.9rem', color: '#334155', marginTop: '0.25rem' }}>Jl. Raya Kartini No.26, Depok, Jawa Barat | Telp: (021) 77827000</p>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '1.5rem', textDecoration: 'underline' }}>
            LAPORAN REKAPITULASI DISTRIBUSI BANTUAN AIR BERSIH
          </h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {startDate ? `Mulai: ${new Date(startDate).toLocaleDateString('id-ID')} ` : ''} 
            {endDate ? `Sampai: ${new Date(endDate).toLocaleDateString('id-ID')}` : ''}
            {!startDate && !endDate ? 'Periode: Semua Periode' : ''}
          </p>
        </div>

        <h3 className="card-title no-print">
          <FileSpreadsheet size={20} /> Rekapitulasi Data Pengajuan Air
        </h3>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>Memuat data...</p>
        ) : filteredRequests.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
            Tidak ada data yang cocok dengan kriteria filter laporan.
          </p>
        ) : (
          <>
            <div className="table-container" style={{ boxShadow: 'none', border: 'none' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama Pemohon</th>
                    <th>Alamat Pengiriman</th>
                    <th>Volume (L)</th>
                    <th>Tanggal Masuk</th>
                    <th>Driver / Plat</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.id}>
                      <td>#{req.id}</td>
                      <td style={{ fontWeight: 600 }}>{req.user_name}</td>
                      <td>
                        <div>{req.address}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kel. {req.kelurahan}, Kec. {req.kecamatan}</div>
                      </td>
                      <td>{req.volume_needed.toLocaleString('id-ID')}</td>
                      <td>{new Date(req.created_at).toLocaleDateString('id-ID')}</td>
                      <td>
                        {req.driver_name ? (
                          <div>
                            <div>{req.driver_name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.truck_plate}</div>
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Print Summary Footer */}
            <div className="print-footer-only" style={{ marginTop: '3rem', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.85rem' }}>
                <p><strong>Total Pengajuan Terfilter:</strong> {filteredRequests.length} Pengajuan</p>
                <p><strong>Total Volume Didistribusikan:</strong> {totalVolume.toLocaleString('id-ID')} Liter</p>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.85rem', width: '220px' }}>
                <p>Depok, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p style={{ marginBottom: '4.5rem' }}>Mengetahui, Admin PDAM Tirta Asasta</p>
                <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>({currentUser?.name || 'Petugas PDAM'})</p>
                <p style={{ color: 'var(--text-muted)' }}>Staff Distribusi Darurat</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
