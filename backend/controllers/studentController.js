const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const { parseStudentFile } = require('../utils/csvParser');
const { generateReportCardPDF, generateIdCardPDF } = require('../utils/pdfGenerator');
const { calculateCumulativeCGPA } = require('../utils/cgpaCalculator');
const { logAuditAction } = require('../middleware/auditLogger');

// @desc    Get all students with search & filter
// @route   GET /api/students
// @access  Admin, Teacher
const getStudents = async (req, res) => {
  try {
    const { department, semester, section, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (department && department !== 'all') {
      query.department = department;
    }
    if (semester && semester !== 'all') {
      query.semester = Number(semester);
    }
    if (section && section !== 'all') {
      query.section = section;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('user', 'name email role isActive')
      .sort({ rollNumber: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      students,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single student details with summary stats
// @route   GET /api/students/:id
// @access  Admin, Teacher, Student (own), Parent (child)
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('user', 'name email role isActive');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // Role check
    if (req.user.role === 'student' && req.user.profileRef?.toString() !== student._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view other student records' });
    }

    if (req.user.role === 'parent') {
      const isLinked = req.user.linkedStudents?.some(
        (id) => id.toString() === student._id.toString()
      );
      if (!isLinked) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this student' });
      }
    }

    // Compute live attendance stats
    const attendances = await Attendance.find({ student: student._id });
    const totalClasses = attendances.length;
    const presentClasses = attendances.filter((a) => a.status === 'present').length;
    const attendancePercentage = totalClasses > 0 ? parseFloat(((presentClasses / totalClasses) * 100).toFixed(1)) : 100;
    const lowAttendanceWarning = totalClasses > 0 && attendancePercentage < 75;

    // Compute live CGPA
    const grades = await Grade.find({ student: student._id });
    const cgpa = calculateCumulativeCGPA(grades);

    res.json({
      success: true,
      student,
      stats: {
        totalClasses,
        presentClasses,
        attendancePercentage,
        lowAttendanceWarning,
        totalSubjectsGraded: grades.length,
        cgpa,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new student and linked user
// @route   POST /api/students
// @access  Admin
const createStudent = async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      email,
      department,
      semester,
      section,
      phone,
      parentName,
      parentPhone,
      parentEmail,
      bloodGroup,
      gender,
      password = 'Password123!',
    } = req.body;

    const existingStudent = await Student.findOne({
      $or: [{ rollNumber: rollNumber.toUpperCase() }, { email: email.toLowerCase() }],
    });

    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Student with this roll number or email already exists' });
    }

    // 1. Create User account for student
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: 'student',
        department,
        phone,
      });
    }

    // 2. Create Student profile
    const student = await Student.create({
      user: user._id,
      name,
      rollNumber: rollNumber.toUpperCase(),
      email: email.toLowerCase(),
      department,
      semester: Number(semester) || 1,
      section: section || 'A',
      phone,
      parentName,
      parentPhone,
      parentEmail,
      bloodGroup,
      gender,
    });

    // Link user to profile
    user.profileRef = student._id;
    await user.save();

    await logAuditAction({
      req,
      action: 'CREATE',
      entityType: 'Student',
      entityId: student._id,
      details: { rollNumber: student.rollNumber, name: student.name },
    });

    res.status(201).json({ success: true, message: 'Student created successfully', student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Admin
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // If name changed, update linked user name
    if (req.body.name && student.user) {
      await User.findByIdAndUpdate(student.user, { name: req.body.name });
    }

    await logAuditAction({
      req,
      action: 'UPDATE',
      entityType: 'Student',
      entityId: student._id,
      details: req.body,
    });

    res.json({ success: true, message: 'Student record updated', student: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete student record
// @route   DELETE /api/students/:id
// @access  Admin
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }
    await Student.findByIdAndDelete(req.params.id);

    await logAuditAction({
      req,
      action: 'DELETE',
      entityType: 'Student',
      entityId: req.params.id,
      details: { rollNumber: student.rollNumber, name: student.name },
    });

    res.json({ success: true, message: 'Student record and linked account removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk import students from CSV/XLSX
// @route   POST /api/students/import
// @access  Admin
const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a valid CSV or Excel file' });
    }

    const records = parseStudentFile(req.file.buffer, req.file.originalname);
    if (!records || records.length === 0) {
      return res.status(400).json({ success: false, message: 'No student rows found in uploaded file' });
    }

    let successCount = 0;
    const errors = [];

    for (const record of records) {
      if (!record.name || !record.email || !record.rollNumber) {
        errors.push(`Skipped row: Missing essential fields for ${record.name || record.rollNumber || 'Unknown'}`);
        continue;
      }

      try {
        const exists = await Student.findOne({
          $or: [{ rollNumber: record.rollNumber }, { email: record.email }],
        });

        if (exists) {
          errors.push(`Skipped ${record.rollNumber}: Already exists`);
          continue;
        }

        let user = await User.findOne({ email: record.email });
        if (!user) {
          user = await User.create({
            name: record.name,
            email: record.email,
            password: 'Password123!',
            role: 'student',
            department: record.department,
            phone: record.phone,
          });
        }

        const student = await Student.create({
          user: user._id,
          name: record.name,
          rollNumber: record.rollNumber,
          email: record.email,
          department: record.department,
          semester: record.semester || 1,
          section: record.section || 'A',
          phone: record.phone,
          parentName: record.parentName,
          parentPhone: record.parentPhone,
          parentEmail: record.parentEmail,
          gender: record.gender,
          bloodGroup: record.bloodGroup,
        });

        user.profileRef = student._id;
        await user.save();

        successCount++;
      } catch (err) {
        errors.push(`Error on ${record.rollNumber}: ${err.message}`);
      }
    }

    await logAuditAction({
      req,
      action: 'IMPORT',
      entityType: 'Student',
      details: { totalRows: records.length, imported: successCount, failed: errors.length },
    });

    res.json({
      success: true,
      message: `Bulk import completed: ${successCount} imported successfully.`,
      importedCount: successCount,
      errors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download Report Card PDF
// @route   GET /api/students/:id/report-card
// @access  Admin, Teacher, Student (own), Parent (child)
const downloadReportCard = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const semester = req.query.semester ? Number(req.query.semester) : student.semester;
    const grades = await Grade.find({ student: student._id, semester });
    const allGrades = await Grade.find({ student: student._id });
    const cgpa = calculateCumulativeCGPA(allGrades);

    const attendances = await Attendance.find({ student: student._id });
    const totalClasses = attendances.length;
    const presentClasses = attendances.filter((a) => a.status === 'present').length;
    const percentage = totalClasses > 0 ? parseFloat(((presentClasses / totalClasses) * 100).toFixed(1)) : 100;

    const stats = {
      percentage,
      lowAttendanceWarning: totalClasses > 0 && percentage < 75,
      cgpa,
    };

    generateReportCardPDF(student, grades, stats, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download ID Card PDF
// @route   GET /api/students/:id/id-card
// @access  Admin, Student (own)
const downloadIdCard = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    generateIdCardPDF(student, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudents,
  downloadReportCard,
  downloadIdCard,
};
