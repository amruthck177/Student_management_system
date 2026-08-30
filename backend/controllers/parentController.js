const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Fee = require('../models/Fee');
const { calculateCumulativeCGPA } = require('../utils/cgpaCalculator');

// @desc    Get all students linked to the authenticated parent
// @route   GET /api/parent/students
// @access  Parent
const getLinkedChildren = async (req, res) => {
  try {
    const parent = await User.findById(req.user._id);
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent profile not found' });
    }

    // Find students either explicitly linked in array OR matching parentEmail
    const students = await Student.find({
      $or: [
        { _id: { $in: parent.linkedStudents || [] } },
        { parentEmail: parent.email.toLowerCase() },
      ],
    });

    // Enhance each child with live calculated metrics
    const enhancedChildren = await Promise.all(
      students.map(async (st) => {
        // Attendance
        const attendances = await Attendance.find({ student: st._id });
        const total = attendances.length;
        const present = attendances.filter((a) => a.status === 'present').length;
        const attendancePercentage =
          total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 100;
        const lowAttendanceWarning = total > 0 && attendancePercentage < 75;

        // Grades & CGPA
        const grades = await Grade.find({ student: st._id });
        const cgpa = calculateCumulativeCGPA(grades);

        // Fees
        const pendingFees = await Fee.find({
          student: st._id,
          status: { $in: ['unpaid', 'overdue'] },
        });
        const totalDue = pendingFees.reduce((sum, f) => sum + f.amount, 0);

        return {
          student: st,
          metrics: {
            attendancePercentage,
            lowAttendanceWarning,
            totalClasses: total,
            presentClasses: present,
            cgpa,
            totalDue,
            pendingFeesCount: pendingFees.length,
          },
        };
      })
    );

    res.json({
      success: true,
      count: enhancedChildren.length,
      children: enhancedChildren,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLinkedChildren,
};
