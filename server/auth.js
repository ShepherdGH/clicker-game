const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { setup } = require('./database');

const router = express.Router();

// In a real app, use an environment variable for the secret key!
const JWT_SECRET = 'a-super-secret-and-long-key-that-should-be-in-an-env-variable';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const db = await setup();

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const existingUser = await db.get('SELECT * FROM registered_users WHERE username = ?', username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password with a salt round of 10

    const result = await db.run(
      'INSERT INTO registered_users (username, password) VALUES (?, ?)',
      username,
      hashedPassword
    );

    res.status(201).json({ message: 'User registered successfully!', userId: result.lastID });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await setup();

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const user = await db.get('SELECT * FROM registered_users WHERE username = ?', username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Use 401 for auth errors
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Use 401 for auth errors
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Logged in successfully!', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;