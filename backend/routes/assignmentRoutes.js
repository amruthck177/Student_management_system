const express = require('express');
const router = express.Router();
const {
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissions,
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getAssignments)
  .post(protect, authorize('teacher', 'admin'), createAssignment);

router.post('/:id/submit', protect, authorize('student'), submitAssignment);
router.get('/:id/submissions', protect, getSubmissions);
router.post('/submissions/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;
