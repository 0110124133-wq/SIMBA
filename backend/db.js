const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite in-memory database');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Create Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Requests Table
    db.run(`
      CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        petugas_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        kelurahan TEXT,
        kecamatan TEXT,
        latitude REAL,
        longitude REAL,
        volume_needed INTEGER,
        status TEXT DEFAULT 'pending',
        image_url TEXT,
        notes TEXT,
        scheduled_date TEXT,
        driver_name TEXT,
        truck_plate TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (petugas_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Seed default admin and user if not exists
    db.get('SELECT count(*) as count FROM users', [], (err, row) => {
      if (err) {
        console.error('Error checking users count:', err);
        return;
      }
      if (row.count === 0) {
        const salt = bcrypt.genSaltSync(10);
        const adminHash = bcrypt.hashSync('adminpdamdepok', salt);
        const userHash = bcrypt.hashSync('user123', salt);
        const petugasHash = bcrypt.hashSync('petugas123', salt);

        db.run(
          `INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)`,
          ['Admin PDAM', 'admin@simba.id', adminHash, '021-77827000', 'Jl. Raya Kartini No.26, Depok', 'admin'],
          (err) => {
            if (err) console.error('Error seeding admin:', err);
          }
        );

        db.run(
          `INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)`,
          ['Budi Setiawan', 'budi@gmail.com', userHash, '081234567890', 'RT 03/RW 04, Kel. Depok, Kec. Pancoran Mas, Depok', 'user'],
          (err) => {
            if (err) console.error('Error seeding user:', err);
          }
        );

        db.run(
          `INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)`,
          ['Rudi Petugas', 'petugas@simba.id', petugasHash, '087712345678', 'Pos Pelayanan PDAM Pancoran Mas', 'petugas'],
          (err) => {
            if (err) console.error('Error seeding petugas:', err);
          }
        );
        console.log('Seeded default admin (admin@simba.id / adminpdamdepok), user (budi@gmail.com / user123), and petugas (petugas@simba.id / petugas123).');
      }
    });
  });
}

module.exports = db;
