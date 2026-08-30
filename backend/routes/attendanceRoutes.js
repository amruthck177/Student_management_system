const express = require('express');
const router = express.Router();
const {
  getAttendanceByStudent,
  markBatchAttendance,
  getClassAttendanceSummary,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/summary/class', protect, authorize('admin', 'teacher'), getClassAttendanceSummary);
router.post('/', protect, authorize('teacher', 'admin'), markBatchAttendance);
router.get('/:studentId', protect, getAttendanceByStudent);

module.exports = router;
