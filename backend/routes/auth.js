const router = require('express').Router();
const pool   = require('../db');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const auth   = require('../middleware/auth');

/**
 * POST /auth/register
 * Role: Handle user registration and create new account
 * - Validates that username, email, password are provided
 * - Checks if email or username already exists in database
 * - Hashes password using bcrypt before storing
 * - Creates JWT token with 7-day expiration
 * - Returns token and user data on success
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields required.' });

    
    const existing = await pool.query(
      'SELECT id FROM users WHERE email=$1 OR username=$2',
      [email, username]
    );
    if (existing.rows.length)
      return res.status(409).json({ error: 'Email or username already taken.' });

    
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, avatar, bio`,
      [username, email, hashed]
    );
    const user = result.rows[0];

    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });

  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * POST /auth/login
 * Role: Authenticate user and issue JWT token
 * - Looks up user by email
 * - Compares submitted password with stored bcrypt hash
 * - Returns JWT token and user data (password excluded)
 * - Token valid for 7 days
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email=$1', [email]
    );
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });

  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * GET /auth/me
 * Role: Retrieve current authenticated user's data
 * - Protected route: requires valid JWT token in Authorization header
 * - Called on app load to restore user session from token
 * - Returns user profile without password
 */
router.get('/me', auth, async (req, res) => {
  const r = await pool.query(
    'SELECT id, username, email, avatar, bio FROM users WHERE id=$1',
    [req.user.id]
  );
  res.json(r.rows[0]);
});

module.exports = router;