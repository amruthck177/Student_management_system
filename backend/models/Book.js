const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    isbn: {
      type: String,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Computer Science',
        'Electronics',
        'Mathematics',
        'Mechanical',
        'Civil',
        'Management',
        'General Reference',
      ],
      default: 'Computer Science',
    },
    totalCopies: {
      type: Number,
      default: 5,
      min: 1,
    },
    availableCopies: {
      type: Number,
      default: 5,
      min: 0,
    },
    shelfLocation: {
      type: String,
      default: 'Section A - Shelf 3',
    },
    coverUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.index({ title: 'text', author: 'text', category: 1 });

module.exports = mongoose.model('Book', bookSchema);
