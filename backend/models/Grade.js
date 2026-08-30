const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    subjectCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    examType: {
      type: String,
      enum: ['Internal-1', 'Internal-2', 'Final', 'Practical', 'Assignment'],
      default: 'Final',
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: 0,
    },
    maxMarks: {
      type: Number,
      required: [true, 'Max marks is required'],
      default: 100,
    },
    credits: {
      type: Number,
      required: [true, 'Course credits are required'],
      default: 3,
      min: 1,
      max: 10,
    },
    gradeLetter: {
      type: String,
      default: 'A',
    },
    gradePoint: {
      type: Number,
      default: 9,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Helper to compute grade letter and point automatically before saving
gradeSchema.pre('save', function (next) {
  const percentage = (this.marksObtained / this.maxMarks) * 100;
  if (percentage >= 90) {
    this.gradeLetter = 'O'; // Outstanding
    this.gradePoint = 10;
  } else if (percentage >= 80) {
    this.gradeLetter = 'A+';
    this.gradePoint = 9;
  } else if (percentage >= 70) {
    this.gradeLetter = 'A';
    this.gradePoint = 8;
  } else if (percentage >= 60) {
    this.gradeLetter = 'B+';
    this.gradePoint = 7;
  } else if (percentage >= 50) {
    this.gradeLetter = 'B';
    this.gradePoint = 6;
  } else if (percentage >= 40) {
    this.gradeLetter = 'P'; // Pass
    this.gradePoint = 4;
  } else {
    this.gradeLetter = 'F'; // Fail
    this.gradePoint = 0;
  }
  next();
});

gradeSchema.index({ student: 1, semester: 1, subject: 1, examType: 1 });

module.exports = mongoose.model('Grade', gradeSchema);
