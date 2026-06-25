const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', verifyToken, isAdmin, (req, res) => {
  db.all('SELECT id, name, email, phone, address, role, created_at FROM users ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal mengambil data user.', error: err.message });
    }
    res.json(rows);
  });
});

// Add new user (Admin only)
router.post('/', verifyToken, isAdmin, (req, res) => {
  const { name, email, password, phone, address, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
  }

  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Database error.', error: err.message });
    }
    if (row) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    const userRole = (role === 'admin' || role === 'petugas') ? role : 'user';

    db.run(
      `INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hashPassword, phone || '', address || '', userRole],
      function (err) {
        if (err) {
          return res.status(500).json({ message: 'Gagal menambahkan user.', error: err.message });
        }
        res.status(201).json({
          message: 'User berhasil ditambahkan.',
          user: { id: this.lastID, name, email, phone, address, role: userRole }
        });
      }
    );
  });
});

// Delete user (Admin only)
router.delete('/:id', verifyToken, isAdmin, (req, res) => {
  const userId = req.params.id;

  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri.' });
  }

  db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Gagal menghapus user.', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    res.json({ message: 'User berhasil dihapus.' });
  });
});

module.exports = router;
