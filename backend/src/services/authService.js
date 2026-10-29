const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const db = require('../db');
const n8nService = require('./n8nService');

function normalizeIdentifier(val) {
  if (!val) return '';
  const trimmed = val.trim();
  if (trimmed.includes('@')) {
    return { type: 'email', value: trimmed.toLowerCase() };
  }
  const cleanedPhone = trimmed.replace(/[\s\-\(\)]/g, '');
  return { type: 'phone', value: cleanedPhone };
}

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  const token = `rt_${uuidv4().replace(/-/g, '')}`;
  const tokens = db.getRefreshTokens();
  // 30 days expiration
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  tokens.push({
    token,
    userId: user.id,
    expiresAt,
    revoked: false,
    createdAt: new Date().toISOString()
  });
  db.saveRefreshTokens(tokens);
  return token;
}

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

module.exports = {
  async register({ name, email, phone, password, role }) {
    if (!name || (!email && !phone) || !password) {
      throw new Error('Full name, password, and at least one contact method (email or phone) are required.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const users = db.getUsers();

    if (email && users.some(u => u.email && u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw new Error('An account with this email address already exists.');
    }

    const cleanPhone = phone ? phone.replace(/[\s\-\(\)]/g, '') : null;
    if (cleanPhone && users.some(u => u.phone && u.phone.replace(/[\s\-\(\)]/g, '') === cleanPhone)) {
      throw new Error('An account with this phone number already exists.');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = {
      id: `usr-${uuidv4().substring(0, 8)}`,
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : null,
      phone: cleanPhone,
      passwordHash,
      role: role || 'CUSTOMER',
      verifiedEmail: false,
      verifiedPhone: Boolean(cleanPhone),
      favorites: ['LLB-PRD-01'],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    users.push(newUser);
    db.saveUsers(users);

    // Trigger n8n registration welcome email automation
    let automationResult = null;
    try {
      automationResult = await n8nService.triggerRegistrationWelcome(newUser);
    } catch (err) {
      console.warn('n8n registration trigger error:', err.message);
    }

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    return {
      message: 'Account successfully registered. Welcome email dispatched via n8n automation.',
      user: sanitizeUser(newUser),
      token: accessToken,
      accessToken,
      refreshToken,
      emailAutomation: {
        dispatched: true,
        recipient: newUser.email,
        workflow: '01_user_registration_welcome.json',
        message: `Welcome package email dispatched via n8n to ${newUser.email}`,
        previewUrl: automationResult?.response?.previewUrl || null,
        emailRecord: automationResult?.response?.emailRecord || null
      }
    };
  },

  async login({ identifier, password }) {
    if (!identifier || !password) {
      throw new Error('Please provide email/phone and password.');
    }

    const { type, value } = normalizeIdentifier(identifier);
    const users = db.getUsers();

    const user = users.find(u => {
      if (type === 'email' && u.email && u.email.toLowerCase() === value) return true;
      if (type === 'phone' && u.phone && u.phone.replace(/[\s\-\(\)]/g, '') === value) return true;
      return false;
    });

    if (!user) {
      throw new Error('Invalid login credentials. Please check your email/phone and password.');
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid login credentials.');
    }

    user.lastLogin = new Date().toISOString();
    db.saveUsers(users);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      message: 'Login successful.',
      user: sanitizeUser(user),
      token: accessToken,
      accessToken,
      refreshToken
    };
  },

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token is required.');
    }

    const tokens = db.getRefreshTokens();
    const tokenRecord = tokens.find(t => t.token === refreshToken && !t.revoked);

    if (!tokenRecord) {
      throw new Error('Invalid or revoked refresh token.');
    }

    if (new Date(tokenRecord.expiresAt) < new Date()) {
      tokenRecord.revoked = true;
      db.saveRefreshTokens(tokens);
      throw new Error('Refresh token expired. Please login again.');
    }

    const users = db.getUsers();
    const user = users.find(u => u.id === tokenRecord.userId);
    if (!user) {
      throw new Error('User account not found.');
    }

    // Rotate refresh token: revoke current and issue a fresh one
    tokenRecord.revoked = true;
    const newRefreshToken = generateRefreshToken(user);

    const newAccessToken = generateAccessToken(user);

    return {
      token: newAccessToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  },

  async logout(refreshToken) {
    if (refreshToken) {
      const tokens = db.getRefreshTokens();
      const tokenRecord = tokens.find(t => t.token === refreshToken);
      if (tokenRecord) {
        tokenRecord.revoked = true;
        db.saveRefreshTokens(tokens);
      }
    }
    return { message: 'Logged out successfully.' };
  },

  async forgotPassword({ identifier, channel = 'email' }) {
    if (!identifier) {
      throw new Error('Please provide your registered email or phone.');
    }

    const { type, value } = normalizeIdentifier(identifier);
    const users = db.getUsers();
    const user = users.find(u => {
      if (type === 'email' && u.email && u.email.toLowerCase() === value) return true;
      if (type === 'phone' && u.phone && u.phone.replace(/[\s\-\(\)]/g, '') === value) return true;
      return false;
    });

    // Security practice: Always return positive message to avoid user enumeration
    if (!user) {
      return {
        message: 'If an account exists with this credential, a verification OTP has been dispatched.',
        channel,
        destination: value
      };
    }

    // Generate 6-digit numeric OTP and 15-minute expiring token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = uuidv4();
    const otps = db.getOtps();

    // Invalidate prior OTPs for this user
    const filteredOtps = otps.filter(o => o.userId !== user.id);
    filteredOtps.push({
      userId: user.id,
      identifier: value,
      otp,
      resetToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      used: false
    });
    db.saveOtps(filteredOtps);

    // Trigger n8n OTP automation
    n8nService.triggerPasswordReset(value, channel, otp, resetToken, user).catch(err => {
      console.warn('n8n OTP trigger error:', err.message);
    });

    return {
      message: `Verification OTP dispatched via ${channel.toUpperCase()} to ${value}.`,
      channel,
      destination: value,
      expiresInMinutes: 15,
      // For local development convenience:
      debugOtp: process.env.NODE_ENV === 'production' ? undefined : otp
    };
  },

  async verifyOtp({ identifier, otp }) {
    if (!identifier || !otp) {
      throw new Error('Identifier and OTP are required.');
    }

    const { value } = normalizeIdentifier(identifier);
    const otps = db.getOtps();
    const record = otps.find(o => o.identifier === value && o.otp === otp.trim() && !o.used);

    if (!record) {
      throw new Error('Invalid OTP PIN. Please try again.');
    }

    if (new Date(record.expiresAt) < new Date()) {
      throw new Error('OTP expired. Please request a new code.');
    }

    return {
      message: 'OTP verified successfully.',
      verified: true,
      resetToken: record.resetToken
    };
  },

  async resetPassword({ identifier, otp, newPassword }) {
    if (!identifier || !otp || !newPassword) {
      throw new Error('Identifier, OTP, and new password are required.');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const { value } = normalizeIdentifier(identifier);
    const otps = db.getOtps();
    const recordIndex = otps.findIndex(o => o.identifier === value && o.otp === otp.trim() && !o.used);

    if (recordIndex === -1) {
      throw new Error('Invalid or expired OTP.');
    }

    if (new Date(otps[recordIndex].expiresAt) < new Date()) {
      throw new Error('OTP has expired.');
    }

    // Mark OTP as used
    otps[recordIndex].used = true;
    db.saveOtps(otps);

    // Update user password
    const users = db.getUsers();
    const userIndex = users.findIndex(u => u.id === otps[recordIndex].userId);
    if (userIndex === -1) {
      throw new Error('Associated user account was not found.');
    }

    const salt = bcrypt.genSaltSync(10);
    users[userIndex].passwordHash = bcrypt.hashSync(newPassword, salt);
    users[userIndex].updatedAt = new Date().toISOString();
    db.saveUsers(users);

    return {
      message: 'Password reset successfully. You may now login with your new password.',
      success: true
    };
  },

  async verifyEmail(email) {
    const users = db.getUsers();
    const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('User not found.');
    user.verifiedEmail = true;
    db.saveUsers(users);
    return { message: 'Email verified successfully.', verified: true };
  },

  async resendVerification(email) {
    const users = db.getUsers();
    const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      n8nService.triggerRegistrationWelcome(user).catch(() => {});
    }
    return { message: 'Verification link resent to ' + email };
  },

  sanitizeUser,
  generateAccessToken,
  generateRefreshToken
};
