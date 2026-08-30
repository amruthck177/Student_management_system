const express = require('express');
const router = express.Router();
const {
  getNotices,
  createNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getNotices)
  .post(protect, authorize('admin'), createNotice);

router.delete('/:id', protect, authorize('admin'), deleteNotice);

module.exports = router;
