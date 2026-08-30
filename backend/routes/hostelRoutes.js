const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getTickets,
  raiseTicket,
  updateTicketStatus,
} = require('../controllers/hostelController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/rooms', protect, getAllRooms);
router.get('/tickets', protect, getTickets);
router.post('/tickets', protect, authorize('student'), raiseTicket);
router.patch('/tickets/:id/resolve', protect, authorize('admin'), updateTicketStatus);

module.exports = router;
