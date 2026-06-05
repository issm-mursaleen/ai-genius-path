const express = require('express');
const bcrypt = require('bcrypt');
const { findByEmail } = require('../db/users');
const { refreshTokenStore } = require('../db/users');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required.' });
    }

    const user = findByEmail(email);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Whitelist the refresh token
    refreshTokenStore.add(refreshToken);

    // Send refresh token as secure httpOnly cookie
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      status: 'success',
      accessToken,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ status: 'error', message: 'No refresh token found. Please log in.' });
    }

    if (!refreshTokenStore.has(token)) {
      return res.status(401).json({ status: 'error', message: 'Refresh token is invalid or was revoked.' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      // Remove expired/invalid token from whitelist
      refreshTokenStore.delete(token);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ status: 'error', message: 'Refresh token expired. Please log in again.' });
      }
      return res.status(401).json({ status: 'error', message: 'Invalid refresh token.' });
    }

    const newAccessToken = signAccessToken({ id: decoded.id, email: decoded.email, role: decoded.role });

    res.status(200).json({ status: 'success', accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    refreshTokenStore.delete(token);
  }
  res.clearCookie('refreshToken');
  res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
});

module.exports = router;
