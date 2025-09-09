// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('users.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Create users table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        name TEXT,
        mobile TEXT,
        location TEXT,
        gender TEXT,
        age INTEGER,
        interests TEXT,
        otherInterests TEXT,
        language TEXT,
        groupSize TEXT,
        emergencyContact TEXT,
        isVerified BOOLEAN,
        adminRemarks TEXT
    )`);
});

// User Registration Endpoint
app.post('/register', (req, res) => {
  console.log(req.body);
  if (!req.body.name || !req.body.mobile || !req.body.location) {
    return res.status(400).json({ error: 'Name, Mobile, and Location are required fields.' });
  }
  const { name, mobile, location, gender, age, interests, otherInterests, language, groupSize, emergencyContact } = req.body;
  const userId = 'USR' + Date.now();
  const isVerified = false;
  const adminRemarks = '';

  const sql = `INSERT INTO users (userId, name, mobile, location, gender, age, interests, otherInterests, language, groupSize, emergencyContact, isVerified, adminRemarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [userId, name, mobile, location, gender, age, JSON.stringify(interests), otherInterests, language, groupSize, emergencyContact, isVerified, adminRemarks], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ success: true, userId: userId });
  });
});

// Admin Login/User Data Endpoint
app.get('/admin/users', (req, res) => {
  const { username, password } = req.query;
  if (username === 'admin' && password === 'Test@123Admin') {
    const sql = `SELECT * FROM users`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  } else {
    res.status(401).send('Unauthorized');
  }
});

// Admin Verification Endpoint
app.post('/admin/verify', (req, res) => {
  const { userId, remarks } = req.body;
  const sql = `UPDATE users SET isVerified = 1, adminRemarks = ? WHERE userId = ?`;
  db.run(sql, [remarks, userId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, changes: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});