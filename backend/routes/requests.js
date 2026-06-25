const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer in memory (Bypasses system disk full issues)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Hanya diperbolehkan mengunggah file gambar (jpg, jpeg, png, webp)!'));
    }
  }
});

// Submit a new request (Citizens)
router.post('/', verifyToken, upload.single('image'), (req, res) => {
  const { title, description, address, kelurahan, kecamatan, latitude, longitude, volume_needed } = req.body;
  const image_url = req.file 
    ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` 
    : '';

  if (!title || !address || !latitude || !longitude || !volume_needed) {
    return res.status(400).json({ message: 'Judul, alamat lengkap, koordinat lokasi, dan volume air yang dibutuhkan wajib diisi.' });
  }

  db.run(
    `INSERT INTO requests (
      user_id, title, description, address, kelurahan, kecamatan, 
      latitude, longitude, volume_needed, status, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      req.user.id,
      title,
      description || '',
      address,
      kelurahan || '',
      kecamatan || '',
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(volume_needed),
      image_url
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Gagal membuat pengajuan bantuan air.', error: err.message });
      }
      res.status(201).json({
        message: 'Pengajuan bantuan air berhasil dikirim.',
        requestId: this.lastID
      });
    }
  );
});

// Get logged-in user's requests
router.get('/user', verifyToken, (req, res) => {
  db.all(
    'SELECT * FROM requests WHERE user_id = ? ORDER BY id DESC',
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Gagal mengambil riwayat pengajuan.', error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get all requests (Admin only)
router.get('/all', verifyToken, isAdmin, (req, res) => {
  db.all(
    `SELECT r.*, u.name as user_name, u.phone as user_phone, u.email as user_email, p.name as petugas_name
     FROM requests r
     JOIN users u ON r.user_id = u.id
     LEFT JOIN users p ON r.petugas_id = p.id
     ORDER BY r.id DESC`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Gagal mengambil semua data pengajuan.', error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get requests assigned to logged-in petugas
router.get('/petugas', verifyToken, (req, res) => {
  if (req.user.role !== 'petugas') {
    return res.status(403).json({ message: 'Akses ditolak. Khusus petugas lapangan.' });
  }
  db.all(
    `SELECT r.*, u.name as user_name, u.phone as user_phone, u.email as user_email
     FROM requests r
     JOIN users u ON r.user_id = u.id
     WHERE r.petugas_id = ?
     ORDER BY r.id DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Gagal mengambil tugas.', error: err.message });
      }
      res.json(rows);
    }
  );
});

// Public track endpoint (No authentication needed, returns non-private info)
router.get('/track/:id', (req, res) => {
  const requestId = req.params.id;
  db.get(
    `SELECT id, title, address, kelurahan, kecamatan, volume_needed, status, notes, scheduled_date, driver_name, truck_plate 
     FROM requests 
     WHERE id = ?`,
    [requestId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Gagal melacak pengajuan.', error: err.message });
      }
      if (!row) {
        return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
      }
      res.json(row);
    }
  );
});

// Get specific request details
router.get('/:id', verifyToken, (req, res) => {
  const requestId = req.params.id;
  db.get(
    `SELECT r.*, u.name as user_name, u.phone as user_phone, u.email as user_email
     FROM requests r
     JOIN users u ON r.user_id = u.id
     WHERE r.id = ?`,
    [requestId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Gagal mengambil detail pengajuan.', error: err.message });
      }
      if (!row) {
        return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
      }

      // Check access: admin or owner
      if (req.user.role !== 'admin' && row.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Akses ditolak.' });
      }

      res.json(row);
    }
  );
});

// Update request status (Admin or assigned Petugas)
router.put('/:id/status', verifyToken, (req, res) => {
  const requestId = req.params.id;
  const { status, notes, scheduled_date, driver_name, truck_plate, petugas_id } = req.body;

  const validStatuses = ['pending', 'approved', 'distributing', 'completed', 'rejected'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid.' });
  }

  db.get('SELECT * FROM requests WHERE id = ?', [requestId], (err, request) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal mengambil data pengajuan.', error: err.message });
    }
    if (!request) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    const isUserAdmin = req.user.role === 'admin';
    const isUserAssignedPetugas = req.user.role === 'petugas' && request.petugas_id === req.user.id;

    if (!isUserAdmin && !isUserAssignedPetugas) {
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki wewenang.' });
    }

    if (isUserAdmin) {
      const query = `
        UPDATE requests 
        SET status = ?, 
            notes = ?, 
            scheduled_date = ?, 
            driver_name = ?, 
            truck_plate = ?, 
            petugas_id = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      db.run(
        query,
        [
          status, 
          notes || '', 
          scheduled_date || '', 
          driver_name || '', 
          truck_plate || '', 
          petugas_id ? parseInt(petugas_id) : null, 
          requestId
        ],
        function (err) {
          if (err) {
            return res.status(500).json({ message: 'Gagal memperbarui status pengajuan.', error: err.message });
          }
          res.json({ message: 'Status pengajuan berhasil diperbarui oleh Admin.' });
        }
      );
    } else {
      // Petugas update
      const query = `
        UPDATE requests 
        SET status = ?, 
            notes = ?, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      db.run(
        query,
        [status, notes || request.notes || '', requestId],
        function (err) {
          if (err) {
            return res.status(500).json({ message: 'Gagal memperbarui status pengajuan.', error: err.message });
          }
          res.json({ message: 'Status pengajuan berhasil diperbarui oleh Petugas.' });
        }
      );
    }
  });
});

// Admin delete request
router.delete('/:id', verifyToken, isAdmin, (req, res) => {
  const requestId = req.params.id;

  db.run('DELETE FROM requests WHERE id = ?', [requestId], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Gagal menghapus pengajuan.', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }
    res.json({ message: 'Pengajuan berhasil dihapus.' });
  });
});

module.exports = router;
