const Grade = require('../models/Grade');
const Student = require('../models/Student');
const { calculateSemesterGPA, calculateCumulativeCGPA } = require('../utils/cgpaCalculator');
const { logAuditAction } = require('../middleware/auditLogger');

// @desc    Get student grades with automated GPA and CGPA
// @route   GET /api/grades/:studentId
// @access  Admin, Teacher, Student (own), Parent (child)
const getGradesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester } = req.query;

    const query = { student: studentId };
    if (semester && semester !== 'all') {
      query.semester = Number(semester);
    }

    const grades = await Grade.find(query)
      .populate('gradedBy', 'name email')
      .sort({ semester: 1, subject: 1 });

    const allGrades = await Grade.find({ student: studentId });

    // Group grades by semester
    const semesterMap = {};
    allGrades.forEach((g) => {
      if (!semesterMap[g.semester]) {
        semesterMap[g.semester] = [];
      }
      semesterMap[g.semester].push(g);
    });

    const semesterWiseSummary = Object.keys(semesterMap).map((sem) => {
      const list = semesterMap[sem];
      const gpa = calculateSemesterGPA(list);
      const totalCredits = list.reduce((sum, item) => sum + (Number(item.credits) || 3), 0);
      return {
        semester: Number(sem),
        grades: list,
        gpa,
        totalCredits,
      };
    });

    const cumulativeCGPA = calculateCumulativeCGPA(allGrades);

    res.json({
      success: true,
      cgpa: cumulativeCGPA,
      totalGradesCount: allGrades.length,
      filteredGrades: grades,
      semesterSummary: semesterWiseSummary,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add or update a single grade entry
// @route   POST /api/grades
// @access  Teacher, Admin
const addOrUpdateGrade = async (req, res) => {
  try {
    const {
      studentId,
      subject,
      subjectCode,
      semester,
      examType = 'Final',
      marksObtained,
      maxMarks = 100,
      credits = 3,
      remarks,
    } = req.body;

    if (!studentId || !subject || marksObtained === undefined || !semester) {
      return res.status(400).json({ success: false, message: 'Please provide student, subject, semester, and marks' });
    }

    const filter = {
      student: studentId,
      subject,
      semester: Number(semester),
      examType,
    };

    let grade = await Grade.findOne(filter);

    if (grade) {
      grade.marksObtained = Number(marksObtained);
      grade.maxMarks = Number(maxMarks);
      grade.credits = Number(credits);
      grade.subjectCode = subjectCode || grade.subjectCode;
      grade.remarks = remarks || grade.remarks;
      grade.gradedBy = req.user._id;
      await grade.save();
    } else {
      grade = await Grade.create({
        student: studentId,
        subject,
        subjectCode,
        semester: Number(semester),
        examType,
        marksObtained: Number(marksObtained),
        maxMarks: Number(maxMarks),
        credits: Number(credits),
        remarks,
        gradedBy: req.user._id,
      });
    }

    await logAuditAction({
      req,
      action: 'UPDATE',
      entityType: 'Grade',
      entityId: grade._id,
      details: { studentId, subject, marksObtained, semester, examType },
    });

    res.status(200).json({ success: true, message: 'Grade record saved successfully', grade });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Batch grade upload for class
// @route   POST /api/grades/batch
// @access  Teacher, Admin
const batchAddGrades = async (req, res) => {
  try {
    const { subject, subjectCode, semester, examType = 'Final', credits = 3, records } = req.body;

    if (!subject || !semester || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Please provide all required batch parameters' });
    }

    const saved = [];
    for (const item of records) {
      const filter = {
        student: item.studentId,
        subject,
        semester: Number(semester),
        examType,
      };

      let grade = await Grade.findOne(filter);
      if (grade) {
        grade.marksObtained = Number(item.marksObtained);
        grade.maxMarks = Number(item.maxMarks || 100);
        grade.credits = Number(credits);
        grade.subjectCode = subjectCode || grade.subjectCode;
        grade.remarks = item.remarks || grade.remarks;
        grade.gradedBy = req.user._id;
        await grade.save();
      } else {
        grade = await Grade.create({
          student: item.studentId,
          subject,
          subjectCode,
          semester: Number(semester),
          examType,
          marksObtained: Number(item.marksObtained),
          maxMarks: Number(item.maxMarks || 100),
          credits: Number(credits),
          remarks: item.remarks,
          gradedBy: req.user._id,
        });
      }
      saved.push(grade);
    }

    await logAuditAction({
      req,
      action: 'UPDATE',
      entityType: 'Grade',
      details: { count: saved.length, subject, semester, examType },
    });

    res.json({ success: true, message: `Successfully recorded grades for ${saved.length} students` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGradesByStudent,
  addOrUpdateGrade,
  batchAddGrades,
};
