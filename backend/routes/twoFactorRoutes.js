const express = require('express');
const router = express.Router();
const {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
} = require('../controllers/twoFactorController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateTwoFactorSecret);
router.post('/verify', protect, verifyTwoFactorToken);

module.exports = router;
