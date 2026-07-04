import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Clock, Truck, Users, BarChart3 } from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('simba_token');
    try {
      // Fetch all requests
      const reqRes = await fetch('https://simba-production-b7a4.up.railway.app/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!reqRes.ok) throw new Error('Gagal mengambil data pengajuan.');
      const reqData = await reqRes.json();
      setRequests(reqData);

      // Fetch all users to count
      const userRes = await fetch('https://simba-production-b7a4.up.railway.app/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUserCount(userData.length);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    distributing: requests.filter(r => r.status === 'distributing').length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const getKecamatanStats = () => {
    const counts = {};
    requests.forEach(r => {
      if (r.kecamatan) {
        counts[r.kecamatan] = (counts[r.kecamatan] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const kecamatanStats = getKecamatanStats();
  const maxKecCount = kecamatanStats.length > 0 ? kecamatanStats[0][1] : 1;

  return (
    <div className="content-body">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--dark-blue)' }}>Dashboard Administrasi</h1>
        <p style={{ color: 'var(--text-muted)' }}>Panel kendali sebaran permintaan bantuan air bersih PDAM Depok</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>Memuat data dashboard...</p>
      ) : (
        <>
          {/* Stats Grids */}
          <div className="stats-grid">
            <div className="card-stat" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/requests')}>
              <div className="stat-info">
                <h3>Total Permintaan</h3>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-icon stat-blue">
                <Droplet size={24} />
              </div>
            </div>

            <div className="card-stat" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/requests')}>
              <div className="stat-info">
                <h3>Belum Diverifikasi</h3>
                <div className="stat-value">{stats.pending}</div>
              </div>
              <div className="stat-icon stat-yellow">
                <Clock size={24} />
              </div>
            </div>

            <div className="card-stat" style={{ cursor: 'pointer' }} onClick={() => navigate('/api/admin/requests')}>
              <div className="stat-info">
                <h3>Sedang Dikirim</h3>
                <div className="stat-value">{stats.distributing}</div>
              </div>
              <div className="stat-icon stat-orange">
                <Truck size={24} />
              </div>
            </div>

            <div className="card-stat" style={{ cursor: 'pointer' }} onClick={() => navigate('/api/admin/users')}>
              <div className="stat-info">
                <h3>Total Pengguna</h3>
                <div className="stat-value">{userCount}</div>
              </div>
              <div className="stat-icon stat-green">
                <Users size={24} />
              </div>
            </div>
          </div>

          {/* Interactive Multi Map & Analytics */}
          <div className="admin-grid">
            <div>
              <InteractiveMap 
                mode="admin-multi" 
                requests={requests} 
                onMarkerClick={(req) => navigate(`/api/admin/requests?id=${req.id}`)}
              />
            </div>

            {/* Analytics Panel */}
            <div className="card" style={{ height: '535px', display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>
                <BarChart3 size={20} /> Wilayah Permintaan Tertinggi
              </h3>
              
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {kecamatanStats.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '4rem' }}>
                    Belum ada data geografis pengajuan air.
                  </p>
                ) : (
                  kecamatanStats.map(([kec, count]) => {
                    const pct = (count / maxKecCount) * 100;
                    return (
                      <div key={kec} style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          <span>Kec. {kec}</span>
                          <span style={{ color: 'var(--primary)' }}>{count} Permintaan</span>
                        </div>
                        {/* Custom Pure CSS Progress Bar */}
                        <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '10px', transition: 'width 0.8s ease' }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Color legend of map */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>
                  Legenda Status Peta
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
                    <span>Menunggu ({stats.pending})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
                    <span>Disetujui ({stats.approved})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f97316' }}></span>
                    <span>Dikirim ({stats.distributing})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                    <span>Selesai ({stats.completed})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
