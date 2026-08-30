const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      default: 'A',
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline date is required'],
    },
    maxMarks: {
      type: Number,
      default: 20,
      min: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ department: 1, semester: 1, section: 1, deadline: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
