const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Notice body content is required'],
      trim: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    audience: {
      type: String,
      enum: ['all', 'teachers', 'students', 'parents', 'department'],
      default: 'all',
    },
    targetDepartment: {
      type: String,
      default: 'All',
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

noticeSchema.index({ audience: 1, isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
