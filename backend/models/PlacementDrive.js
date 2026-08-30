const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    roleTitle: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    packageCTC: {
      type: String,
      required: true, // e.g. "$120,000 / annum" or "18 LPA"
    },
    location: {
      type: String,
      default: 'Hybrid / Boston, MA',
    },
    minCGPA: {
      type: Number,
      default: 7.0,
      min: 0,
      max: 10,
    },
    allowedDepartments: [
      {
        type: String,
        default: 'Computer Science & Engineering',
      },
    ],
    maxBacklogs: {
      type: Number,
      default: 0,
    },
    applicationDeadline: {
      type: Date,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'upcoming'],
      default: 'active',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

placementDriveSchema.index({ status: 1, applicationDeadline: 1 });

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
