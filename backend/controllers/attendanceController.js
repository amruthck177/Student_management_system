const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { logAuditAction } = require('../middleware/auditLogger');

// @desc    Get attendance record for a student with % and low attendance flag
// @route   GET /api/attendance/:studentId
// @access  Admin, Teacher, Student (own), Parent (child)
const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester, subject, startDate, endDate } = req.query;

    const query = { student: studentId };
    if (semester) query.semester = Number(semester);
    if (subject) query.subject = subject;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query)
      .populate('markedBy', 'name email')
      .sort({ date: -1 });

    const totalClasses = records.length;
    const presentCount = records.filter((r) => r.status === 'present').length;
    const absentCount = records.filter((r) => r.status === 'absent').length;
    const excusedCount = records.filter((r) => r.status === 'excused').length;

    const overallPercentage =
      totalClasses > 0 ? parseFloat(((presentCount / totalClasses) * 100).toFixed(1)) : 100;
    const lowAttendanceWarning = totalClasses > 0 && overallPercentage < 75;

    // Group stats by subject
    const subjectBreakdown = {};
    records.forEach((rec) => {
      if (!subjectBreakdown[rec.subject]) {
        subjectBreakdown[rec.subject] = { total: 0, present: 0, absent: 0, excused: 0 };
      }
      subjectBreakdown[rec.subject].total++;
      if (rec.status === 'present') subjectBreakdown[rec.subject].present++;
      else if (rec.status === 'absent') subjectBreakdown[rec.subject].absent++;
      else if (rec.status === 'excused') subjectBreakdown[rec.subject].excused++;
    });

    const subjectStats = Object.keys(subjectBreakdown).map((subj) => {
      const stats = subjectBreakdown[subj];
      const pct = stats.total > 0 ? parseFloat(((stats.present / stats.total) * 100).toFixed(1)) : 100;
      return {
        subject: subj,
        ...stats,
        percentage: pct,
        isLow: pct < 75,
      };
    });

    res.json({
      success: true,
      summary: {
        totalClasses,
        presentCount,
        absentCount,
        excusedCount,
        overallPercentage,
        lowAttendanceWarning,
      },
      subjectStats,
      records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark batch attendance for a class session
// @route   POST /api/attendance
// @access  Teacher, Admin
const markBatchAttendance = async (req, res) => {
  try {
    const { subject, date, department, semester, section = 'A', records } = req.body;

    if (!subject || !date || !department || !semester || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Please provide all required attendance fields' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];
    for (const item of records) {
      const filter = {
        student: item.studentId,
        subject,
        date: attendanceDate,
      };

      const update = {
        status: item.status || 'present',
        markedBy: req.user._id,
        department,
        semester: Number(semester),
        section,
        remarks: item.remarks || '',
      };

      const record = await Attendance.findOneAndUpdate(filter, update, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });

      results.push(record);
    }

    await logAuditAction({
      req,
      action: 'CREATE',
      entityType: 'Attendance',
      details: { subject, date: attendanceDate, count: records.length, department, semester, section },
    });

    res.status(201).json({
      success: true,
      message: `Successfully marked attendance for ${results.length} students`,
      count: results.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get class-wide attendance summary
// @route   GET /api/attendance/summary/class
// @access  Admin, Teacher
const getClassAttendanceSummary = async (req, res) => {
  try {
    const { department, semester, section = 'A', subject } = req.query;
    const studentQuery = {};

    if (department && department !== 'all') studentQuery.department = department;
    if (semester && semester !== 'all') studentQuery.semester = Number(semester);
    if (section && section !== 'all') studentQuery.section = section;

    const students = await Student.find(studentQuery).sort({ rollNumber: 1 });
    const studentIds = students.map((s) => s._id);

    const attQuery = { student: { $in: studentIds } };
    if (subject && subject !== 'all') attQuery.subject = subject;

    const attendances = await Attendance.find(attQuery);

    const studentMap = {};
    students.forEach((s) => {
      studentMap[s._id.toString()] = {
        _id: s._id,
        name: s.name,
        rollNumber: s.rollNumber,
        department: s.department,
        semester: s.semester,
        section: s.section,
        total: 0,
        present: 0,
        percentage: 100,
        isLow: false,
      };
    });

    attendances.forEach((att) => {
      const sid = att.student.toString();
      if (studentMap[sid]) {
        studentMap[sid].total++;
        if (att.status === 'present') {
          studentMap[sid].present++;
        }
      }
    });

    const summaryList = Object.values(studentMap).map((st) => {
      const pct = st.total > 0 ? parseFloat(((st.present / st.total) * 100).toFixed(1)) : 100;
      return {
        ...st,
        percentage: pct,
        isLow: st.total > 0 && pct < 75,
      };
    });

    res.json({
      success: true,
      totalStudents: students.length,
      summaryList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAttendanceByStudent,
  markBatchAttendance,
  getClassAttendanceSummary,
};
