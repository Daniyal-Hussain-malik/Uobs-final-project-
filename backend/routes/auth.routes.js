const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { generateToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

// 1. Register Guest
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(422).json({ success: false, message: 'Please provide all required fields.' });
    }

    if (password.length < 6) {
      return res.status(422).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(422).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (name, email, phone, role, password) VALUES (?, ?, ?, "guest", ?)',
      [name.trim(), email.trim().toLowerCase(), phone.trim(), hashedPassword]
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'guest',
    };

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: 'Welcome to Oasis Resort Katpana! Your account was created.',
      token,
      user,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// 2. Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ success: false, message: 'Email and password are required.' });
    }

    const users = await query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const token = generateToken(safeUser);
    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// 3. Quick Demo Login for instant testing (Admin, Reception, Guest)
router.get('/quick-login/:role', async (req, res) => {
  try {
    const { role } = req.params;
    if (!['admin', 'reception', 'guest'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role requested.' });
    }

    const users = await query('SELECT id, name, email, phone, role FROM users WHERE role = ? LIMIT 1', [role]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: `No demo account found for role: ${role}` });
    }

    const user = users[0];
    const token = generateToken(user);
    res.json({
      success: true,
      message: `Switched to ${user.name} (${user.role.toUpperCase()})`,
      token,
      user,
    });
  } catch (err) {
    console.error('Quick login error:', err);
    res.status(500).json({ success: false, message: 'Server error during demo login.' });
  }
});

// 4. Get Current User Profile
router.get('/me', requireAuth, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
