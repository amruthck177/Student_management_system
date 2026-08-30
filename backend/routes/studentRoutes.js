const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudents,
  downloadReportCard,
  downloadIdCard,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .get(protect, authorize('admin', 'teacher'), getStudents)
  .post(protect, authorize('admin'), createStudent);

router.post('/import', protect, authorize('admin'), upload.single('file'), importStudents);

router.get('/:id/report-card', protect, downloadReportCard);
router.get('/:id/id-card', protect, downloadIdCard);

router
  .route('/:id')
  .get(protect, getStudentById)
  .put(protect, authorize('admin'), updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

module.exports = router;
