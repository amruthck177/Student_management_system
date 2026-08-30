const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  addBook,
  borrowBook,
  returnBook,
  getMyBorrowedBooks,
} = require('../controllers/libraryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/books', protect, getAllBooks);
router.post('/books', protect, authorize('admin'), addBook);
router.post('/borrow', protect, borrowBook);
router.post('/return/:borrowId', protect, returnBook);
router.get('/my-books', protect, getMyBorrowedBooks);

module.exports = router;
