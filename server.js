// ============================================================
// server.js — Blood Donation Management System Backend
// Node.js + Express + MySQL
// ============================================================

const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// DATABASE CONNECTION — change password to yours
// ============================================================
const db = mysql.createConnection({
  host:     'localhost',
  user:     'root',
  password: 'S@mar123',   // ← change this
  database: 'bloodDonationDB'
});

db.connect((err) => {
  if (err) {
    console.log('❌ MySQL connection error:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL successfully!');
});

// ============================================================
// SERVE HTML PAGES
// ============================================================
const pages = ['index','donors','requests','stock','hospitals','camps','volunteers','feedback','history','admin'];
pages.forEach(p => {
  app.get('/' + p, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', p + '.html'));
  });
});

// ============================================================
// MEMBER 1 — DONOR APIs
// ============================================================

// POST /add-donor — Register a new donor
app.post('/add-donor', (req, res) => {
  const { name, age, bloodGroup, city, contact, email, gender } = req.body;
  if (!name || !age || !bloodGroup || !city || !contact)
    return res.json({ success: false, message: 'All required fields must be filled.' });

  const sql = 'INSERT INTO donors (name, age, bloodGroup, city, contact, email, gender) VALUES (?,?,?,?,?,?,?)';
  db.query(sql, [name, age, bloodGroup, city, contact, email||null, gender||null], (err) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, message: 'Donor registered successfully!' });
  });
});

// GET /search-donor — Search donors by blood group and city
app.get('/search-donor', (req, res) => {
  const { bloodGroup, city } = req.query;
  let sql = 'SELECT * FROM donors WHERE 1=1';
  const vals = [];
  if (bloodGroup) { sql += ' AND bloodGroup = ?'; vals.push(bloodGroup); }
  if (city)       { sql += ' AND city LIKE ?';    vals.push('%'+city+'%'); }
  db.query(sql, vals, (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, donors: results });
  });
});

// GET /all-donors — Get all donors
app.get('/all-donors', (req, res) => {
  db.query('SELECT * FROM donors ORDER BY created_at DESC', (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, donors: results });
  });
});

// ============================================================
// MEMBER 2 — BLOOD REQUEST & STOCK APIs
// ============================================================

// POST /add-request — Submit a blood request
app.post('/add-request', (req, res) => {
  const { patient_name, bloodGroup, units, hospital_id, city, contact } = req.body;
  if (!patient_name || !bloodGroup || !units || !city || !contact)
    return res.json({ success: false, message: 'All required fields must be filled.' });

  const sql = 'INSERT INTO blood_requests (patient_name, bloodGroup, units, hospital_id, city, contact) VALUES (?,?,?,?,?,?)';
  db.query(sql, [patient_name, bloodGroup, units, hospital_id||null, city, contact], (err) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, message: 'Blood request submitted successfully!' });
  });
});

// GET /all-requests — Get all blood requests
app.get('/all-requests', (req, res) => {
  const sql = `SELECT br.*, h.name as hospital_name
               FROM blood_requests br
               LEFT JOIN hospitals h ON br.hospital_id = h.id
               ORDER BY br.created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, requests: results });
  });
});

// GET /blood-stock — Get blood stock (optionally filter by city)
app.get('/blood-stock', (req, res) => {
  const { city } = req.query;
  let sql = `SELECT bs.*, bb.name as bank_name, bb.city
             FROM blood_stock bs
             JOIN blood_banks bb ON bs.blood_bank_id = bb.id
             WHERE 1=1`;
  const vals = [];
  if (city) { sql += ' AND bb.city LIKE ?'; vals.push('%'+city+'%'); }
  sql += ' ORDER BY bb.city, bs.bloodGroup';
  db.query(sql, vals, (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, stock: results });
  });
});

// ============================================================
// MEMBER 3 — HOSPITALS, BLOOD BANKS, CAMPS APIs
// ============================================================

// GET /all-hospitals
app.get('/all-hospitals', (req, res) => {
  db.query('SELECT * FROM hospitals ORDER BY city', (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, hospitals: results });
  });
});

// GET /all-blood-banks
app.get('/all-blood-banks', (req, res) => {
  db.query('SELECT * FROM blood_banks ORDER BY city', (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, bloodBanks: results });
  });
});

// GET /all-camps
app.get('/all-camps', (req, res) => {
  db.query('SELECT * FROM camps ORDER BY camp_date ASC', (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, camps: results });
  });
});

// POST /add-camp
app.post('/add-camp', (req, res) => {
  const { title, city, venue, camp_date, organizer, contact } = req.body;
  if (!title || !city || !venue || !camp_date)
    return res.json({ success: false, message: 'Please fill required fields.' });

  const sql = 'INSERT INTO camps (title, city, venue, camp_date, organizer, contact) VALUES (?,?,?,?,?,?)';
  db.query(sql, [title, city, venue, camp_date, organizer||null, contact||null], (err) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, message: 'Camp added successfully!' });
  });
});

// ============================================================
// MEMBER 4 — VOLUNTEERS, FEEDBACK, HISTORY, DASHBOARD APIs
// ============================================================

// POST /add-volunteer
app.post('/add-volunteer', (req, res) => {
  const { name, city, contact, email, skills } = req.body;
  if (!name || !city || !contact)
    return res.json({ success: false, message: 'Please fill required fields.' });

  const sql = 'INSERT INTO volunteers (name, city, contact, email, skills) VALUES (?,?,?,?,?)';
  db.query(sql, [name, city, contact, email||null, skills||null], (err) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, message: 'Volunteer registered successfully!' });
  });
});

// GET /all-volunteers
app.get('/all-volunteers', (req, res) => {
  db.query('SELECT * FROM volunteers ORDER BY created_at DESC', (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, volunteers: results });
  });
});

// POST /add-feedback
app.post('/add-feedback', (req, res) => {
  const { name, email, message, rating } = req.body;
  if (!name || !message)
    return res.json({ success: false, message: 'Name and message are required.' });

  const sql = 'INSERT INTO feedback (name, email, message, rating) VALUES (?,?,?,?)';
  db.query(sql, [name, email||null, message, rating||null], (err) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, message: 'Feedback submitted! Thank you.' });
  });
});

// GET /all-feedback
app.get('/all-feedback', (req, res) => {
  db.query('SELECT * FROM feedback ORDER BY created_at DESC', (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, feedback: results });
  });
});

// GET /donation-history
app.get('/donation-history', (req, res) => {
  const sql = `SELECT dh.*, d.name as donor_name, d.bloodGroup, bb.name as bank_name
               FROM donation_history dh
               JOIN donors d ON dh.donor_id = d.id
               LEFT JOIN blood_banks bb ON dh.blood_bank_id = bb.id
               ORDER BY dh.donation_date DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, history: results });
  });
});

// GET /dashboard-stats — Summary counts for home page
app.get('/dashboard-stats', (req, res) => {
  const queries = {
    donors:    'SELECT COUNT(*) as count FROM donors',
    requests:  'SELECT COUNT(*) as count FROM blood_requests WHERE status="Pending"',
    camps:     'SELECT COUNT(*) as count FROM camps',
    volunteers:'SELECT COUNT(*) as count FROM volunteers'
  };
  const stats = {};
  let done = 0;
  Object.entries(queries).forEach(([key, sql]) => {
    db.query(sql, (err, result) => {
      stats[key] = err ? 0 : result[0].count;
      if (++done === 4) res.json({ success: true, stats });
    });
  });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});