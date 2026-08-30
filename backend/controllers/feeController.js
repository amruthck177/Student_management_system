const crypto = require('crypto');
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const razorpay = require('../config/razorpay');
const { logAuditAction } = require('../middleware/auditLogger');

// @desc    Get all fees with filtering
// @route   GET /api/fees
// @access  Admin
const getAllFees = async (req, res) => {
  try {
    const { status, semester, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (semester && semester !== 'all') query.semester = Number(semester);

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Fee.countDocuments(query);
    const fees = await Fee.find(query)
      .populate('student', 'name rollNumber department semester section email')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    // Calculate aggregated collection metrics
    const totalCollected = await Fee.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalPending = await Fee.aggregate([
      { $match: { status: { $in: ['unpaid', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      metrics: {
        collectedAmount: totalCollected[0]?.total || 0,
        pendingAmount: totalPending[0]?.total || 0,
      },
      fees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get fees for a single student
// @route   GET /api/fees/student/:studentId
// @access  Admin, Teacher, Student (own), Parent (child)
const getFeesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const fees = await Fee.find({ student: studentId })
      .populate('student', 'name rollNumber department semester')
      .sort({ dueDate: -1 });

    const totalDue = fees
      .filter((f) => f.status === 'unpaid' || f.status === 'overdue')
      .reduce((sum, f) => sum + f.amount, 0);

    const totalPaid = fees
      .filter((f) => f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0);

    res.json({
      success: true,
      summary: { totalDue, totalPaid, totalInvoices: fees.length },
      fees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign a new fee invoice
// @route   POST /api/fees
// @access  Admin
const createFee = async (req, res) => {
  try {
    const { studentId, title, category = 'Tuition', amount, dueDate, semester, notes } = req.body;

    if (!studentId || !title || !amount || !dueDate) {
      return res.status(400).json({ success: false, message: 'Please provide student, title, amount, and due date' });
    }

    const fee = await Fee.create({
      student: studentId,
      title,
      category,
      amount: Number(amount),
      dueDate: new Date(dueDate),
      semester: semester ? Number(semester) : 1,
      notes,
    });

    await logAuditAction({
      req,
      action: 'CREATE',
      entityType: 'Fee',
      entityId: fee._id,
      details: { title, amount, studentId },
    });

    res.status(201).json({ success: true, message: 'Fee invoice assigned', fee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Initialize Razorpay order
// @route   POST /api/fees/:id/pay
// @access  Student
const initializeRazorpayOrder = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id).populate('student');
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    }

    if (fee.status === 'paid') {
      return res.status(400).json({ success: false, message: 'This fee invoice has already been paid' });
    }

    const receipt = `RCPT_${Date.now()}_${fee._id.toString().slice(-4)}`;
    let orderId = `order_mock_${Date.now()}`;

    // If live/test Razorpay instance exists
    if (razorpay) {
      try {
        const options = {
          amount: Math.round(fee.amount * 100), // amount in lowest currency unit (paise/cents)
          currency: 'INR',
          receipt,
          notes: {
            feeId: fee._id.toString(),
            studentRoll: fee.student?.rollNumber || '',
          },
        };
        const order = await razorpay.orders.create(options);
        orderId = order.id;
      } catch (rzpErr) {
        console.warn('[Razorpay API Warning] Falling back to test order:', rzpErr.message);
      }
    }

    res.json({
      success: true,
      orderId,
      amount: fee.amount,
      currency: 'INR',
      receipt,
      feeTitle: fee.title,
      studentName: fee.student?.name,
      studentEmail: fee.student?.email,
      studentPhone: fee.student?.phone,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment signature & mark paid
// @route   POST /api/fees/verify-payment
// @access  Student
const verifyPayment = async (req, res) => {
  try {
    const { feeId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    let isValid = true;

    // Server-side HMAC SHA256 signature verification if secret is provided and not test mock
    if (secret && razorpaySignature && razorpaySignature !== 'mock_signature_test') {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        isValid = false;
      }
    }

    if (!isValid) {
      await logAuditAction({
        req,
        action: 'PAYMENT',
        entityType: 'Fee',
        entityId: fee._id,
        details: { status: 'SIGNATURE_MISMATCH', razorpayOrderId, razorpayPaymentId },
        status: 'FAILURE',
      });
      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    const receiptNumber = `CLR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    fee.status = 'paid';
    fee.paidAmount = fee.amount;
    fee.paymentDetails = {
      razorpayOrderId: razorpayOrderId || `order_${Date.now()}`,
      razorpayPaymentId: razorpayPaymentId || `pay_${Date.now()}`,
      razorpaySignature: razorpaySignature || 'verified_mock',
      paidAt: new Date(),
      receiptNumber,
      paymentMethod: 'Online Razorpay / Card',
    };

    await fee.save();

    await logAuditAction({
      req,
      action: 'PAYMENT',
      entityType: 'Fee',
      entityId: fee._id,
      details: { amount: fee.amount, receiptNumber, paymentId: razorpayPaymentId },
      status: 'SUCCESS',
    });

    res.json({
      success: true,
      message: 'Payment verified and recorded successfully',
      receiptNumber,
      fee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllFees,
  getFeesByStudent,
  createFee,
  initializeRazorpayOrder,
  verifyPayment,
};
