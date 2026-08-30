const express = require('express');
const router = express.Router();
const { getLinkedChildren } = require('../controllers/parentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/students', protect, authorize('parent'), getLinkedChildren);

module.exports = router;
