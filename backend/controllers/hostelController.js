const HostelRoom = require('../models/HostelRoom');
const MaintenanceTicket = require('../models/MaintenanceTicket');
const { logAuditAction } = require('../middleware/auditLogger');

// @desc    Get all hostel rooms
// @route   GET /api/hostel/rooms
// @access  Authenticated
const getAllRooms = async (req, res) => {
  try {
    const rooms = await HostelRoom.find().populate('residents', 'name rollNumber email');
    res.json({ success: true, count: rooms.length, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get maintenance tickets
// @route   GET /api/hostel/tickets
// @access  Authenticated
const getTickets = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'student') {
      query.student = req.user?.profileRef?._id;
    }

    const tickets = await MaintenanceTicket.find(query)
      .populate('student', 'name rollNumber email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Raise a maintenance ticket (Student)
// @route   POST /api/hostel/tickets
// @access  Student
const raiseTicket = async (req, res) => {
  try {
    const { hostelBlock, roomNumber, title, category, description, priority = 'Medium' } = req.body;
    const studentId = req.user?.profileRef?._id;

    if (!studentId || !hostelBlock || !roomNumber || !title) {
      return res.status(400).json({ success: false, message: 'Please provide all ticket particulars' });
    }

    const ticket = await MaintenanceTicket.create({
      student: studentId,
      hostelBlock,
      roomNumber,
      title,
      category,
      description,
      priority,
    });

    res.status(201).json({ success: true, message: 'Maintenance ticket created', ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ticket resolution (Admin)
// @route   PATCH /api/hostel/tickets/:id/resolve
// @access  Admin
const updateTicketStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const ticket = await MaintenanceTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    await ticket.save();

    res.json({ success: true, message: 'Ticket status updated', ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllRooms,
  getTickets,
  raiseTicket,
  updateTicketStatus,
};
