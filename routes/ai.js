const express = require('express');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// GET /api/ai/free-model — accessible by all logged-in users
router.get('/free-model', (req, res) => {
  res.status(200).json({
    status: 'success',
    model: 'free-text-v1',
    message: `Hello ${req.user.email}! Here is your free AI-generated text.`,
    generated: 'The quick brown fox jumps over the lazy dog.',
  });
});

// POST /api/ai/premium-model — accessible only by Premium_User and Admin
router.post('/premium-model', restrictTo('Premium_User', 'Admin'), (req, res) => {
  res.status(200).json({
    status: 'success',
    model: 'premium-image-v3',
    message: `Hello ${req.user.email}! Here is your premium AI-generated image URL.`,
    generated: 'https://aigenius.com/images/premium-output-abc123.png',
  });
});

// DELETE /api/ai/purge-cache — accessible only by Admin
router.delete('/purge-cache', restrictTo('Admin'), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `Cache purged by admin ${req.user.email}.`,
    purgedAt: new Date().toISOString(),
  });
});

module.exports = router;
