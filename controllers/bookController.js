const Book = require('../models/Book');
const User = require('../models/User');

// Create a Book
exports.createBook = async (req, res) => {
    try {
        const { title, genre, stock } = req.body;

        // Ensure only authors can create books
        if (req.user.role !== 'Author') {
            return res.status(403).json({ message: 'Only authors can create books' });
        }

        // Create a new book
        const book = await Book.create({
            title,
            author: req.user.id,
            genre,
            stock,
        });

        // Add the book to the author's writtenBooks list
        await User.findByIdAndUpdate(req.user.id, { $push: { writtenBooks: book._id } });

        res.status(201).json({ message: 'Book created successfully', book });
    } catch (error) {
        res.status(400).json({ message: 'Error creating book', error: error.message });
    }
};

// Get All Books or Search by Query
exports.getBooks = async (req, res) => {
    try {
        const { title, author, genre } = req.query;

        // Build query object dynamically
        const query = {};
        if (title) query.title = { $regex: title, $options: 'i' }; // Case-insensitive search
        if (author) query.author = author; // Author ID
        if (genre) query.genre = { $regex: genre, $options: 'i' };

        const books = await Book.find(query).populate('author', 'name email'); // Include author details
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving books', error: error.message });
    }
};

// Get Books by Author
exports.getBooksByAuthor = async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure only authors can access their own books
        if (req.user.role !== 'Author' || req.user.id !== id) {
            return res.status(403).json({ message: 'You are not authorized to view these books' });
        }

        const books = await Book.find({ author: id }).populate('borrowedBy', 'name email'); // Include borrower details
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving author books', error: error.message });
    }
};

// Update Book Details
exports.updateBook = async (req, res) => {
    const { id } = req.params;
    const { title, genre, stock } = req.body;

    try {
        // Find the book and ensure the requester is the author
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (req.user.role !== 'Author' || book.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this book' });
        }

        // Update book details
        if (title) book.title = title;
        if (genre) book.genre = genre;
        if (stock) book.stock = stock;

        await book.save();

        res.status(200).json({ message: 'Book updated successfully', book });
    } catch (error) {
        res.status(500).json({ message: 'Error updating book', error: error.message });
    }
};

// Delete a Book
// Delete a Book
exports.deleteBook = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the book and ensure the requester is the author
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (req.user.role !== 'Author' || book.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this book' });
        }

        // Delete the book
        await Book.findByIdAndDelete(id);

        // Remove the book from the author's writtenBooks list
        await User.findByIdAndUpdate(req.user.id, { $pull: { writtenBooks: id } });

        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting book', error: error.message });
    }
};

