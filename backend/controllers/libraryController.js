const Book = require('../models/Book');
const BookBorrow = require('../models/BookBorrow');
const Student = require('../models/Student');
const { logAuditAction } = require('../middleware/auditLogger');

// @desc    Get all library books with search & category filters
// @route   GET /api/library/books
// @access  Authenticated
const getAllBooks = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }

    const books = await Book.find(query).sort({ title: 1 });
    res.json({ success: true, count: books.length, books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a book to catalog (Admin only)
// @route   POST /api/library/books
// @access  Admin
const addBook = async (req, res) => {
  try {
    const { title, author, isbn, category, totalCopies = 5, shelfLocation } = req.body;

    const book = await Book.create({
      title,
      author,
      isbn: isbn || `ISBN-${Date.now()}`,
      category,
      totalCopies: Number(totalCopies),
      availableCopies: Number(totalCopies),
      shelfLocation,
    });

    await logAuditAction({
      req,
      action: 'CREATE',
      entityType: 'User', // general entity
      details: { title: book.title, author: book.author },
    });

    res.status(201).json({ success: true, message: 'Book added to library catalog', book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Borrow / Reserve a book
// @route   POST /api/library/borrow
// @access  Student, Admin
const borrowBook = async (req, res) => {
  try {
    const { bookId, studentId } = req.body;
    const targetStudentId = studentId || req.user?.profileRef?._id;

    if (!targetStudentId) {
      return res.status(400).json({ success: false, message: 'Student ID required' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.availableCopies < 1) {
      return res.status(400).json({ success: false, message: 'No physical copies available right now' });
    }

    // Check if student already has borrowed this active book
    const existing = await BookBorrow.findOne({
      student: targetStudentId,
      book: bookId,
      status: 'borrowed',
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have borrowed this book' });
    }

    // 14 days due date
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const borrowRecord = await BookBorrow.create({
      student: targetStudentId,
      book: bookId,
      dueDate,
      status: 'borrowed',
    });

    book.availableCopies = Math.max(0, book.availableCopies - 1);
    await book.save();

    await logAuditAction({
      req,
      action: 'CREATE',
      entityType: 'User',
      details: { action: 'BOOK_BORROW', book: book.title },
    });

    res.status(201).json({
      success: true,
      message: `Successfully borrowed '${book.title}'. Return due by ${dueDate.toLocaleDateString()}`,
      borrowRecord,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Return a borrowed book
// @route   POST /api/library/return/:borrowId
// @access  Student, Admin
const returnBook = async (req, res) => {
  try {
    const borrow = await BookBorrow.findById(req.params.borrowId).populate('book');
    if (!borrow) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    borrow.status = 'returned';
    borrow.returnDate = new Date();
    await borrow.save();

    if (borrow.book) {
      const book = await Book.findById(borrow.book._id);
      if (book) {
        book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
        await book.save();
      }
    }

    res.json({ success: true, message: 'Book returned successfully', borrow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get borrowed books for active student
// @route   GET /api/library/my-books
// @access  Student, Admin
const getMyBorrowedBooks = async (req, res) => {
  try {
    const studentId = req.user?.profileRef?._id || req.query.studentId;
    if (!studentId) {
      return res.json({ success: true, borrowed: [] });
    }

    const borrowed = await BookBorrow.find({ student: studentId })
      .populate('book')
      .sort({ borrowDate: -1 });

    res.json({ success: true, count: borrowed.length, borrowed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllBooks,
  addBook,
  borrowBook,
  returnBook,
  getMyBorrowedBooks,
};
