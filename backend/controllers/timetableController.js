const Timetable = require('../models/Timetable');
const { logAuditAction } = require('../middleware/auditLogger');

// @desc    Get timetable by class parameters or teacher ID
// @route   GET /api/timetable
// @access  Authenticated
const getTimetable = async (req, res) => {
  try {
    const { department, semester, section = 'A', teacherId } = req.query;

    if (teacherId) {
      // Find all timetable slots assigned to this teacher
      const timetables = await Timetable.find({ 'periods.teacher': teacherId })
        .populate('periods.teacher', 'name email department');
      return res.json({ success: true, timetables });
    }

    const query = {};
    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (section) query.section = section;

    const timetables = await Timetable.find(query)
      .populate('periods.teacher', 'name email department')
      .sort({ day: 1 });

    res.json({ success: true, timetables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or update a timetable day schedule
// @route   POST /api/timetable
// @access  Admin, Teacher
const saveTimetable = async (req, res) => {
  try {
    const { department, semester, section = 'A', day, periods } = req.body;

    if (!department || !semester || !day || !periods) {
      return res.status(400).json({ success: false, message: 'Please provide department, semester, day, and period schedule' });
    }

    const filter = {
      department,
      semester: Number(semester),
      section,
      day,
    };

    const updated = await Timetable.findOneAndUpdate(
      filter,
      { periods },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await logAuditAction({
      req,
      action: 'UPDATE',
      entityType: 'Timetable',
      entityId: updated._id,
      details: { department, semester, section, day, periodCount: periods.length },
    });

    res.json({ success: true, message: `Timetable for ${day} saved successfully`, timetable: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTimetable,
  saveTimetable,
};
