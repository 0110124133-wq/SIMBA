const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// Register a new user
router.post('/register', (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
  }

  // Check if email already exists
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Database error checking email.', error: err.message });
    }
    if (row) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    db.run(
      `INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, 'user')`,
      [name, email, hashPassword, phone || '', address || ''],
      function (err) {
        if (err) {
          return res.status(500).json({ message: 'Registrasi gagal.', error: err.message });
        }
        res.status(201).json({ message: 'Registrasi berhasil.', userId: this.lastID });
      }
    );
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi.' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database query error.', error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  });
});

// Get User Profile
router.get('/profile', verifyToken, (req, res) => {
  db.get('SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal mengambil profil.', error: err.message });
    }
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    res.json(user);
  });
});

// Update User Profile
router.put('/profile', verifyToken, (req, res) => {
  const { name, phone, address, password } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Nama wajib diisi.' });
  }

  if (password) {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    db.run(
      'UPDATE users SET name = ?, phone = ?, address = ?, password = ? WHERE id = ?',
      [name, phone || '', address || '', hashPassword, req.user.id],
      function (err) {
        if (err) {
          return res.status(500).json({ message: 'Gagal memperbarui profil.', error: err.message });
        }
        res.json({ message: 'Profil dan password berhasil diperbarui.' });
      }
    );
  } else {
    db.run(
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
      [name, phone || '', address || '', req.user.id],
      function (err) {
        if (err) {
          return res.status(500).json({ message: 'Gagal memperbarui profil.', error: err.message });
        }
        res.json({ message: 'Profil berhasil diperbarui.' });
      }
    );
  }
});

module.exports = router;
