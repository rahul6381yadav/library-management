const express = require('express');
const {
    createBook,
    getBooks,
    getBooksByAuthor,
    updateBook,
    deleteBook,
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Book Routes
router.post('/create', protect, authorize('Author'), createBook); // Create a book (Authors only)
router.get('/',getBooks); // Get all books or search
router.get('/author/:id', protect, authorize('Author'), getBooksByAuthor); // Get books by author
router.put('/update/:id', protect, authorize('Author'), updateBook); // Update book details
router.delete('/delete/:id', protect, authorize('Author'), deleteBook); // Delete a book

module.exports = router;
