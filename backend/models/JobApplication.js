const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    placementDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    appliedCGPA: {
      type: Number,
      required: true,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interviewing', 'selected', 'rejected'],
      default: 'applied',
    },
    interviewRound: {
      type: String,
      default: 'Application Review',
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

jobApplicationSchema.index({ placementDrive: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
