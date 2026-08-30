const express = require('express');
const router = express.Router();
const {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getAppointments)
  .post(protect, authorize('parent'), createAppointment);

router.patch('/:id/status', protect, authorize('teacher', 'admin'), updateAppointmentStatus);

module.exports = router;
