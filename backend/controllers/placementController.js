const PlacementDrive = require('../models/PlacementDrive');
const JobApplication = require('../models/JobApplication');
const Student = require('../models/Student');
const Grade = require('../models/Grade');
const { calculateCumulativeCGPA } = require('../utils/cgpaCalculator');
const { logAuditAction } = require('../middleware/auditLogger');

// @desc    Get all placement drives
// @route   GET /api/placements/drives
// @access  Authenticated
const getAllDrives = async (req, res) => {
  try {
    const drives = await PlacementDrive.find().sort({ applicationDeadline: 1 });
    res.json({ success: true, count: drives.length, drives });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new placement recruitment drive (Admin)
// @route   POST /api/placements/drives
// @access  Admin
const createPlacementDrive = async (req, res) => {
  try {
    const { companyName, roleTitle, packageCTC, location, minCGPA, applicationDeadline, jobDescription } = req.body;

    const drive = await PlacementDrive.create({
      companyName,
      roleTitle,
      packageCTC,
      location: location || 'Hybrid',
      minCGPA: Number(minCGPA) || 7.0,
      applicationDeadline: new Date(applicationDeadline),
      jobDescription,
      postedBy: req.user._id,
    });

    if (req.io) {
      req.io.emit('notice_broadcast', {
        title: `🏢 Placement Drive Open: ${companyName} (${roleTitle} - ${packageCTC})`,
      });
    }

    res.status(201).json({ success: true, message: 'Placement drive published', drive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply to placement drive with automated eligibility check
// @route   POST /api/placements/apply
// @access  Student
const applyToDrive = async (req, res) => {
  try {
    const { driveId, resumeUrl } = req.body;
    const studentId = req.user?.profileRef?._id;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student profile required' });
    }

    const drive = await PlacementDrive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }

    // Compute live student CGPA
    const grades = await Grade.find({ student: studentId });
    const currentCGPA = calculateCumulativeCGPA(grades);

    if (currentCGPA < drive.minCGPA) {
      return res.status(400).json({
        success: false,
        message: `Eligibility mismatch: Minimum required CGPA is ${drive.minCGPA}, but your current score is ${currentCGPA.toFixed(2)}.`,
      });
    }

    const application = await JobApplication.create({
      placementDrive: driveId,
      student: studentId,
      appliedCGPA: currentCGPA,
      resumeUrl: resumeUrl || 'https://drive.google.com/sample_resume.pdf',
    });

    res.status(201).json({
      success: true,
      message: `Application submitted to ${drive.companyName} for ${drive.roleTitle}!`,
      application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's job applications
// @route   GET /api/placements/my-applications
// @access  Student, Admin
const getMyApplications = async (req, res) => {
  try {
    const studentId = req.user?.profileRef?._id || req.query.studentId;
    const applications = await JobApplication.find({ student: studentId })
      .populate('placementDrive')
      .sort({ appliedAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update candidate application status (Admin)
// @route   PATCH /api/placements/applications/:id/status
// @access  Admin
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, interviewRound, feedback } = req.body;
    const app = await JobApplication.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (status) app.status = status;
    if (interviewRound) app.interviewRound = interviewRound;
    if (feedback) app.feedback = feedback;

    await app.save();
    res.json({ success: true, message: 'Application status updated', application: app });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllDrives,
  createPlacementDrive,
  applyToDrive,
  getMyApplications,
  updateApplicationStatus,
};
