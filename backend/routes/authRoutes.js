const express = require('express');
const router = express.Router();
const {
  login,
  registerUser,
  getMe,
  getAllUsers,
  toggleUserStatus,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/login', login);
router.post('/register', protect, authorize('admin'), registerUser);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.patch('/users/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
