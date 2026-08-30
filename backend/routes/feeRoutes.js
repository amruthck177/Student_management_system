const express = require('express');
const router = express.Router();
const {
  getAllFees,
  getFeesByStudent,
  createFee,
  initializeRazorpayOrder,
  verifyPayment,
} = require('../controllers/feeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, authorize('admin'), getAllFees)
  .post(protect, authorize('admin'), createFee);

router.get('/student/:studentId', protect, getFeesByStudent);
router.post('/:id/pay', protect, authorize('student'), initializeRazorpayOrder);
router.post('/verify-payment', protect, authorize('student'), verifyPayment);

module.exports = router;
