const User = require('../models/User');
const Student = require('../models/Student');
const { generateToken, getResetPasswordToken } = require('../utils/tokenHelper');
const { logAuditAction } = require('../middleware/auditLogger');
const mailer = require('../config/mailer');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('profileRef')
      .populate('linkedStudents');

    if (!user) {
      await logAuditAction({
        req,
        action: 'LOGIN',
        entityType: 'Auth',
        details: { email, reason: 'User not found' },
        status: 'FAILURE',
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact Admin.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await logAuditAction({
        req,
        user,
        action: 'LOGIN',
        entityType: 'Auth',
        details: { email, reason: 'Incorrect password' },
        status: 'FAILURE',
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    await logAuditAction({
      req,
      user,
      action: 'LOGIN',
      entityType: 'Auth',
      details: { role: user.role, email: user.email },
      status: 'SUCCESS',
    });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        profileRef: user.profileRef,
        linkedStudents: user.linkedStudents,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new user (Admin only)
// @route   POST /api/auth/register
// @access  Admin
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, phone, linkedStudentIds } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      department,
      phone,
      linkedStudents: linkedStudentIds || [],
    });

    await logAuditAction({
      req,
      action: 'CREATE',
      entityType: 'User',
      entityId: user._id,
      details: { name: user.name, email: user.email, role: user.role },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('profileRef')
      .populate('linkedStudents');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List all users (Admin only)
// @route   GET /api/auth/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .populate('profileRef')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/auth/users/:id/toggle-status
// @access  Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await logAuditAction({
      req,
      action: 'UPDATE',
      entityType: 'User',
      entityId: user._id,
      details: { name: user.name, isActive: user.isActive },
    });

    res.json({ success: true, message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account with that email address exists' });
    }

    const { resetToken, hashedToken, expires } = getResetPasswordToken();

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expires;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) requested a password reset for your CampusLedger account.\n\nPlease navigate to the following link to reset your password:\n\n${resetUrl}\n\nThis link is valid for 10 minutes.`;

    try {
      await mailer.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@campusledger.edu',
        to: user.email,
        subject: 'CampusLedger - Password Reset Request',
        text: message,
      });

      res.json({ success: true, message: 'Password reset link sent to your email address' });
    } catch (mailErr) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent. Please check SMTP settings.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const crypto = require('crypto');
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired' });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await logAuditAction({
      req,
      user,
      action: 'UPDATE',
      entityType: 'User',
      entityId: user._id,
      details: { note: 'Password reset via token' },
    });

    res.json({ success: true, message: 'Password has been successfully updated. You may now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  registerUser,
  getMe,
  getAllUsers,
  toggleUserStatus,
  forgotPassword,
  resetPassword,
};
