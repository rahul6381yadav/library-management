const express = require('express');
const { createOrUpdateProfile } = require('../controllers/readerController');
const { protect } = require('../middleware/authMiddleware');
const { borrowBook } = require('../controllers/readerController');
const { returnBook } = require('../controllers/readerController');
const { getBorrowedBooks } = require('../controllers/readerController');




const router = express.Router();

router.get('/books/:id', protect, getBorrowedBooks); // Get borrowed books by reader ID
router.post('/books/return', protect, returnBook); // Return a book
router.post('/books/borrow', protect, borrowBook); // Borrow a book
router.post('/profile', protect, createOrUpdateProfile); // Create or manage profile

module.exports = router;
