const express = require('express');
const router = express.Router();
const {
  getTimetable,
  saveTimetable,
} = require('../controllers/timetableController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getTimetable)
  .post(protect, authorize('admin', 'teacher'), saveTimetable);

module.exports = router;
