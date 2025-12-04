const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const saltRounds = 10;

// TODO: Move this to an environment variable
const JWT_SECRET = 'your_jwt_secret_key';

const signup = async (req, res) => {
  const { email, first_name, last_name, password } = req.body;
  const profileImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // Basic validation
  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user into the database
    const result = await db.query(
      'INSERT INTO users (email, first_name, last_name, password_hash, profile_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [email, first_name, last_name, passwordHash, profileImageUrl]
    );

    res.status(201).json({
      message: 'Signup successful',
      userId: result.rows[0].id,
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_img_url: user.profile_img_url,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  signup,
  login,
};
