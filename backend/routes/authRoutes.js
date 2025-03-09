
const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  verifyEmail, 
  resendVerification,
  googleAuth
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google-auth', googleAuth);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
