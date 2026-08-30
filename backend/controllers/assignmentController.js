const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Student = require('../models/Student');
const { logAuditAction } = require('../middleware/auditLogger');

// @desc    Get assignments for class / user
// @route   GET /api/assignments
// @access  Authenticated
const getAssignments = async (req, res) => {
  try {
    const { department, semester, section = 'A' } = req.query;
    const query = {};

    if (department && department !== 'all') query.department = department;
    if (semester && semester !== 'all') query.semester = Number(semester);
    if (section && section !== 'all') query.section = section;

    const assignments = await Assignment.find(query)
      .populate('createdBy', 'name email')
      .sort({ deadline: 1 });

    res.json({ success: true, count: assignments.length, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new assignment (Teacher, Admin)
// @route   POST /api/assignments
// @access  Teacher, Admin
const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, department, semester, section = 'A', deadline, maxMarks = 20 } = req.body;

    const assignment = await Assignment.create({
      title,
      description,
      subject,
      department,
      semester: Number(semester),
      section,
      deadline: new Date(deadline),
      maxMarks: Number(maxMarks),
      createdBy: req.user._id,
    });

    await logAuditAction({
      req,
      action: 'CREATE',
      entityType: 'Notice', // general category
      details: { assignment: assignment.title, subject },
    });

    if (req.io) {
      req.io.emit('notice_broadcast', {
        title: `New Assignment Published: ${title} (${subject})`,
      });
    }

    res.status(201).json({ success: true, message: 'Assignment published successfully', assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit coursework for assignment (Student)
// @route   POST /api/assignments/:id/submit
// @access  Student
const submitAssignment = async (req, res) => {
  try {
    const studentId = req.user?.profileRef?._id;
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student profile required' });
    }

    const { content, fileUrl } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const isLate = new Date() > new Date(assignment.deadline);

    const submission = await Submission.findOneAndUpdate(
      { assignment: assignment._id, student: studentId },
      {
        content,
        fileUrl: fileUrl || 'https://drive.google.com/sample_submission_doc.pdf',
        submittedAt: new Date(),
        status: isLate ? 'late' : 'submitted',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: isLate ? 'Submitted (Marked as Late Submission)' : 'Coursework submitted successfully!',
      submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Grade a student submission (Teacher, Admin)
// @route   POST /api/assignments/submissions/:id/grade
// @access  Teacher, Admin
const gradeSubmission = async (req, res) => {
  try {
    const { marksObtained, feedback } = req.body;
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    submission.marksObtained = Number(marksObtained);
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedBy = req.user._id;
    await submission.save();

    res.json({ success: true, message: 'Submission graded successfully', submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Teacher, Admin, Student
const getSubmissions = async (req, res) => {
  try {
    const query = { assignment: req.params.id };
    if (req.user.role === 'student') {
      query.student = req.user?.profileRef?._id;
    }

    const submissions = await Submission.find(query)
      .populate('student', 'name rollNumber email')
      .populate('gradedBy', 'name');

    res.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissions,
};
