const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    requestedDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true, // e.g. "10:30 AM - 10:45 AM"
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'completed', 'cancelled'],
      default: 'requested',
    },
    meetingLink: {
      type: String,
      default: 'https://meet.google.com/cmp-ldgr-edu',
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

appointmentSchema.index({ teacher: 1, requestedDate: 1 });
appointmentSchema.index({ parent: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
