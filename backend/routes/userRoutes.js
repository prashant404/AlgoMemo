// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getProfileStats, 
  updateProfile 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Profile routes
router.get('/profile-stats', protect, getProfileStats);
router.put('/profile', protect, updateProfile);

module.exports = router;