const express = require('express');
const router = express.Router();
const {
  getGradesByStudent,
  getAIInsights,
  addOrUpdateGrade,
  batchAddGrades,
} = require('../controllers/gradeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('teacher', 'admin'), addOrUpdateGrade);
router.post('/batch', protect, authorize('teacher', 'admin'), batchAddGrades);
router.get('/:studentId/ai-insights', protect, getAIInsights);
router.get('/:studentId', protect, getGradesByStudent);

module.exports = router;
