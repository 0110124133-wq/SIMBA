import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Search, ShieldCheck, MapPin, Calendar, Truck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [searchId, setSearchId] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError('');
    setTrackResult(null);

    try {
      const response = await fetch(`https://simba-production-b7a4.up.railway.app/${searchId}`, {
        headers: {
          // Send a dummy authorization header, but wait: the backend allows public tracking?
          // If the backend check says admin or owner, it returns 403.
          // Ah! The endpoint GET /api/requests/:id checks:
          // "if (req.user.role !== 'admin' && row.user_id !== req.user.id)"
          // So let's make it so public tracking works if they are logged in, or let's create a public endpoint or use a standard token, or let's allow fetching by request ID publicly for tracking status without listing details of the user!
          // Wait! In requests.js router, GET /:id requires verifyToken.
          // What if we bypass the user check for tracking or just check if they are logged in?
          // To make it easy and seamless for anyone to check request status from the landing page, we can create a public endpoint in the backend `/api/requests/track/:id` that returns only non-private info (status, title, address, scheduled_date, volume, driver, plate) without verifyToken!
          // That is a brilliant design decision! It satisfies both security (protecting email/phone/user ID) and usability (citizen can track status without login).
          // Let's modify the backend routes/requests.js to add a public endpoint GET /track/:id. I will do this in a minute or add it to my plan. Yes, let's call the public tracker endpoint: http://localhost:5000/api/requests/track/${searchId}
        }
      });
      if (!response.ok) {
        if (response.status === 404) throw new Error('ID Pengajuan tidak ditemukan.');
        throw new Error('Gagal melacak pengajuan.');
      }
      const data = await response.json();
      setTrackResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return { text: 'Menunggu Verifikasi', color: '#f59e0b', bg: '#fef3c7' };
      case 'approved': return { text: 'Disetujui & Terjadwal', color: '#3b82f6', bg: '#dbeafe' };
      case 'distributing': return { text: 'Dalam Pengiriman', color: '#f97316', bg: '#ffedd5' };
      case 'completed': return { text: 'Selesai Didistribusikan', color: '#10b981', bg: '#d1fae5' };
      case 'rejected': return { text: 'Ditolak', color: '#ef4444', bg: '#fee2e2' };
      default: return { text: status, color: '#64748b', bg: '#f1f5f9' };
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Navbar */}
      <header className="landing-nav">
        <div className="landing-nav-logo">
          <Droplet fill="currentColor" size={28} />
          <span>SIMBA</span>
        </div>
        <div className="landing-nav-links">
          <Link to="/login" className="landing-nav-link">Masuk</Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: '8px' }}>
            Daftar
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-container">
          <h1 className="hero-title">Sistem Informasi Manajemen Bantuan Air (SIMBA)</h1>
          <p className="hero-subtitle">
            Digitalisasi layanan tanggap darurat bantuan air bersih PDAM Tirta Asasta Depok. 
            Memudahkan masyarakat mengajukan bantuan air secara cepat, terpantau, dan tepat sasaran.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.85rem 2rem', borderRadius: '10px' }}>
              Ajukan Bantuan Air <ArrowRight size={18} />
            </Link>
            <a href="#lacak" className="btn btn-secondary" style={{ fontSize: '1.05rem', padding: '0.85rem 2rem', borderRadius: '10px' }}>
              Lacak Pengajuan
            </a>
          </div>
        </div>
      </section>

      {/* Track Section */}
      <section id="lacak" style={{ padding: '4rem 1.5rem 2rem 1.5rem', flex: 1 }}>
        <div className="tracker-section">
          <h2 className="tracker-title">Lacak Pengajuan Anda Secara Instan</h2>
          <form onSubmit={handleTrack} className="tracker-input-group">
            <input 
              type="text" 
              placeholder="Masukkan ID Pengajuan (Contoh: 1)" 
              className="form-control"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Search size={18} />
              {loading ? 'Mencari...' : 'Lacak'}
            </button>
          </form>

          {error && (
            <div className="alert alert-danger" style={{ marginTop: '1.5rem' }}>
              {error}
            </div>
          )}

          {trackResult && (
            <div className="card" style={{ marginTop: '1.5rem', marginBottom: 0, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{trackResult.title}</h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>ID Pengajuan: #{trackResult.id}</span>
                </div>
                <span 
                  className="badge"
                  style={{
                    backgroundColor: getStatusLabel(trackResult.status).bg,
                    color: getStatusLabel(trackResult.status).color,
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem'
                  }}
                >
                  {getStatusLabel(trackResult.status).text}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <MapPin size={16} /> Alamat Pengiriman
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{trackResult.address}</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Kel. {trackResult.kelurahan}, Kec. {trackResult.kecamatan}</p>
                </div>

                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <Droplet size={16} /> Volume Dibutuhkan
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{trackResult.volume_needed} Liter</p>
                </div>

                {trackResult.scheduled_date && (
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <Calendar size={16} /> Jadwal Penyaluran
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{trackResult.scheduled_date}</p>
                  </div>
                )}

                {trackResult.driver_name && (
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <Truck size={16} /> Armada & Driver
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{trackResult.driver_name}</p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No. Polisi: {trackResult.truck_plate}</p>
                  </div>
                )}
              </div>

              {trackResult.notes && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderLeft: '3px solid var(--primary)', borderRadius: '4px' }}>
                  <strong>Catatan PDAM:</strong>
                  <p style={{ fontSize: '0.9rem', color: '#334155', marginTop: '0.25rem' }}>{trackResult.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Info Cards */}
      <section style={{ padding: '2rem 1.5rem 5rem 1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', margin: '0 auto 1rem auto', justifyContent: 'center' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Verifikasi Akurat</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Setiap pengajuan melampirkan foto kondisi dan koordinat lokasi yang tepat untuk menjamin validitas daerah kekeringan.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', margin: '0 auto 1rem auto', justifyContent: 'center' }}>
              <MapPin size={24} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Pemetaan Geografis</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Admin dapat memantau sebaran pengajuan di peta wilayah Depok secara terstruktur untuk menetapkan prioritas distribusi.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', margin: '0 auto 1rem auto', justifyContent: 'center' }}>
              <Truck size={24} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Rute Terjadwal</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Armada tangki dikirimkan dengan peta rute jalan (road routing) yang efisien dari kantor PDAM langsung ke titik penyaluran.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '2rem 1.5rem', textAlign: 'center', borderTop: '1px solid #1e293b' }}>
        <p style={{ fontSize: '0.9rem' }}>&copy; {new Date().getFullYear()} SIMBA PDAM Tirta Asasta Depok. Semua Hak Dilindungi.</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Dikembangkan untuk mendukung digitalisasi pelayanan tanggap darurat air bersih.</p>
      </footer>
    </div>
  );
}
