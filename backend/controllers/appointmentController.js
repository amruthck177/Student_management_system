const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Student = require('../models/Student');

// @desc    Get user appointments
// @route   GET /api/appointments
// @access  Authenticated
const getAppointments = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'parent') {
      query.parent = req.user._id;
    } else if (req.user.role === 'teacher') {
      query.teacher = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('parent', 'name email phone')
      .populate('teacher', 'name email department')
      .populate('student', 'name rollNumber')
      .sort({ requestedDate: 1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request a new consultation appointment (Parent)
// @route   POST /api/appointments
// @access  Parent
const createAppointment = async (req, res) => {
  try {
    const { teacherId, studentId, requestedDate, timeSlot, topic } = req.body;

    if (!teacherId || !studentId || !requestedDate || !timeSlot || !topic) {
      return res.status(400).json({ success: false, message: 'Please provide all appointment details' });
    }

    const appointment = await Appointment.create({
      parent: req.user._id,
      teacher: teacherId,
      student: studentId,
      requestedDate: new Date(requestedDate),
      timeSlot,
      topic,
      status: 'requested',
    });

    if (req.io) {
      req.io.emit('notice_broadcast', {
        title: `📅 New Parent Consultation Request from ${req.user.name}`,
      });
    }

    res.status(201).json({ success: true, message: 'Consultation appointment requested', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm or update appointment status (Teacher, Admin)
// @route   PATCH /api/appointments/:id/status
// @access  Teacher, Admin
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, meetingLink, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (status) appointment.status = status;
    if (meetingLink) appointment.meetingLink = meetingLink;
    if (notes) appointment.notes = notes;

    await appointment.save();
    res.json({ success: true, message: `Appointment ${status}`, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
};
