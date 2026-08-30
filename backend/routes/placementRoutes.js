const express = require('express');
const router = express.Router();
const {
  getAllDrives,
  createPlacementDrive,
  applyToDrive,
  getMyApplications,
  updateApplicationStatus,
} = require('../controllers/placementController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/drives')
  .get(protect, getAllDrives)
  .post(protect, authorize('admin'), createPlacementDrive);

router.post('/apply', protect, authorize('student'), applyToDrive);
router.get('/my-applications', protect, getMyApplications);
router.patch('/applications/:id/status', protect, authorize('admin'), updateApplicationStatus);

module.exports = router;
