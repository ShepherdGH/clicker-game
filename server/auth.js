// auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { setup } = require('./database');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'a-super-secret-fallback-key-for-dev';

// Helper to get initial game data for a new user
const getInitialGameData = () => ({
  clicks: 0,
  clickPower: 1,
  autoClickers: 0
});

// --- Register Route ---
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const db = await setup();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // 1. Insert user into registered_users table
    const result = await db.run(
      'INSERT INTO registered_users (username, password, last_login) VALUES (?, ?, ?)',
      username,
      hashedPassword,
      new Date().toISOString()
    );
    const userId = result.lastID;

    // 2. Insert initial game data for the new user
    const initialData = getInitialGameData();
    await db.run(
      'INSERT INTO user_game_data (user_id, gameData) VALUES (?, ?)',
      userId,
      JSON.stringify(initialData)
    );

    // 3. Generate token and send response
    const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ message: 'User registered successfully', token, user: { id: userId, username } });

  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ message: 'Username already exists.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Registration failed.' });
  }
});

// --- Login Route ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await setup();

  const user = await db.get('SELECT * FROM registered_users WHERE username = ?', username);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }
  
  // Update last_login time
  await db.run('UPDATE registered_users SET last_login = ? WHERE id = ?', new Date().toISOString(), user.id);

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username } });
});

module.exports = router;