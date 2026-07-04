import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, MapPin, Upload, FileText, ArrowLeft } from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';

const KECAMATAN_DEPOK = [
  'Pancoran Mas',
  'Beji',
  'Sukmajaya',
  'Cimanggis',
  'Limo',
  'Cinere',
  'Sawangan',
  'Bojongsari',
  'Tapos',
  'Cilodong',
  'Cipayung'
];

export default function UserNewRequest() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [kelurahan, setKelurahan] = useState('');
  const [kecamatan, setKecamatan] = useState('Pancoran Mas');
  const [volume, setVolume] = useState('5000');
  const [file, setFile] = useState(null);
  const [mapPosition, setMapPosition] = useState(null); // [lat, lng]

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !address.trim() || !volume) {
      setError('Mohon isi semua field wajib.');
      return;
    }

    if (!mapPosition) {
      setError('Mohon pilih lokasi pengiriman air pada peta di bawah.');
      return;
    }

    setLoading(true);
    setError('');

    const token = localStorage.getItem('simba_token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('address', address);
    formData.append('kelurahan', kelurahan);
    formData.append('kecamatan', kecamatan);
    formData.append('volume_needed', volume);
    formData.append('latitude', mapPosition[0]);
    formData.append('longitude', mapPosition[1]);
    if (file) {
      formData.append('image', file);
    }

    try {
      const response = await fetch('https://simba-production-b7a4.up.railway.app/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengirim pengajuan.');
      }

      navigate('/user/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-body">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-outline" 
          onClick={() => navigate('/user/dashboard')}
          style={{ padding: '0.5rem 0.75rem' }}
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--dark-blue)' }}>Buat Pengajuan Air</h1>
          <p style={{ color: 'var(--text-muted)' }}>Isi form dan tandai titik lokasi pengiriman air tangki bersih</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <h3 className="card-title">
          <FileText size={20} /> Form Permintaan Bantuan Air
        </h3>

        <div className="form-group">
          <label>Judul Pengajuan *</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Contoh: Bantuan Air Bersih RT 02 RW 05 Kelurahan Beji" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <span className="form-hint">Buat judul yang jelas menggambarkan lokasi dan kondisi darurat</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Kecamatan *</label>
            <select 
              className="form-control"
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value)}
            >
              {KECAMATAN_DEPOK.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Kelurahan</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Contoh: Beji Timur" 
              value={kelurahan}
              onChange={(e) => setKelurahan(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Alamat Lengkap Detail *</label>
          <textarea 
            className="form-control" 
            rows={3} 
            placeholder="Tuliskan alamat pengiriman secara jelas (Nama jalan, nomor rumah, RT/RW, patokan lokasi)" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Estimasi Volume Air Yang Dibutuhkan (Liter) *</label>
            <input 
              type="number" 
              className="form-control" 
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              min="500"
              step="500"
              required
            />
            <span className="form-hint">Sebagai patokan, 1 tangki air PDAM Depok berkapasitas 5000 Liter.</span>
          </div>

          <div className="form-group">
            <label>Foto Kondisi Lokasi (Opsional)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="file" 
                id="file-upload" 
                className="form-control" 
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="file-upload" 
                className="btn btn-outline" 
                style={{ width: '100%', display: 'flex', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                <Upload size={18} />
                {file ? file.name : 'Pilih File Gambar (Maks 5MB)'}
              </label>
            </div>
            <span className="form-hint">Unggah foto kekeringan atau kondisi air mati di wilayah Anda.</span>
          </div>
        </div>

        <div className="form-group">
          <label>Keterangan Tambahan (Deskripsi Situasi)</label>
          <textarea 
            className="form-control" 
            rows={2} 
            placeholder="Tuliskan deskripsi kondisi kekeringan (e.g. air mati sejak 3 hari, sumur mengering, dst)" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Click to Pin Map Selector */}
        <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <label style={{ fontSize: '1rem', fontWeight: 'bold' }}>Tandai Lokasi di Peta *</label>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Silakan klik pada peta di bawah ini untuk menandai koordinat titik pengantaran air bersih secara akurat.
          </p>
          <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <InteractiveMap mode="select" position={mapPosition} setPosition={setMapPosition} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={() => navigate('/user/dashboard')}
            disabled={loading}
          >
            Batal
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
          </button>
        </div>
      </form>
    </div>
  );
}
