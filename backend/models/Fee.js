const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Fee title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Tuition', 'Examination', 'Hostel', 'Library', 'Laboratory', 'Transport', 'Other'],
      default: 'Tuition',
    },
    amount: {
      type: Number,
      required: [true, 'Fee amount is required'],
      min: 0,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'partial', 'overdue'],
      default: 'unpaid',
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paymentMethod: {
        type: String,
        default: 'Razorpay Online',
      },
      paidAt: Date,
      receiptNumber: {
        type: String,
        unique: true,
        sparse: true,
      },
    },
    semester: {
      type: Number,
      default: 1,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

feeSchema.index({ student: 1, status: 1 });
feeSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Fee', feeSchema);
