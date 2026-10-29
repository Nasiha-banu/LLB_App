const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');
const authService = require('../services/authService');
const emailService = require('../services/emailService');
const db = require('../db');

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session token.' });
    }
    req.user = user;
    next();
  });
}

// POST /api/v1/auth/register (and /api/auth/register)
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const result = await authService.register({ name, email, phone, password, role });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/auth/login (and /api/auth/login)
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const idVal = identifier || email || phone;
    const result = await authService.login({ identifier: idVal, password });
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// POST /api/v1/auth/refresh (rotate refresh token)
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier, email, phone, channel } = req.body;
    const idVal = identifier || email || phone;
    const result = await authService.forgotPassword({ identifier: idVal, channel: channel || 'email' });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const result = await authService.verifyOtp({ identifier, otp });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    const result = await authService.resetPassword({ identifier, otp, newPassword });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.verifyEmail(email);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerification(email);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/v1/auth/me (or /api/auth/me)
router.get('/me', authenticateToken, (req, res) => {
  const users = db.getUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }
  res.json({ user: authService.sanitizeUser(user) });
});

// PATCH /api/v1/auth/me (update profile)
router.patch('/me', authenticateToken, (req, res) => {
  const users = db.getUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }
  const { name, phone } = req.body;
  if (name) user.name = name.trim();
  if (phone) user.phone = phone.trim();
  user.updatedAt = new Date().toISOString();
  db.saveUsers(users);
  res.json({ message: 'Profile updated', user: authService.sanitizeUser(user) });
});

// GET /api/v1/auth/emails/latest (retrieve latest dispatched registration email)
router.get('/emails/latest', (req, res) => {
  const { email } = req.query;
  const latest = emailService.getLatestEmailForRecipient(email);
  if (!latest) {
    return res.status(404).json({ error: 'No dispatched emails found.' });
  }
  res.json({ email: latest });
});

// GET /api/v1/auth/emails (retrieve all sent emails)
router.get('/emails', (req, res) => {
  const emails = emailService.getStoredEmails();
  res.json({ emails, count: emails.length });
});

module.exports = {
  router,
  authenticateToken
};
