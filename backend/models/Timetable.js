const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema(
  {
    periodNumber: {
      type: Number,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    subjectCode: {
      type: String,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacherName: {
      type: String,
      default: '',
    },
    startTime: {
      type: String,
      required: true, // e.g. "09:00 AM"
    },
    endTime: {
      type: String,
      required: true, // e.g. "10:00 AM"
    },
    roomNumber: {
      type: String,
      default: 'Lab-101',
    },
  },
  { _id: true }
);

const timetableSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    section: {
      type: String,
      required: true,
      default: 'A',
      uppercase: true,
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    periods: [periodSchema],
  },
  {
    timestamps: true,
  }
);

timetableSchema.index({ department: 1, semester: 1, section: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
