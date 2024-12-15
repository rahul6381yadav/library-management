const Book = require('../models/Book');
const User = require('../models/User');

// Create or Manage Reader Profile
exports.createOrUpdateProfile = async (req, res) => {
    try {
        const { id } = req.user; // Authenticated user's ID
        const { name, email } = req.body;

        // Find and update the user's profile
        const user = await User.findById(id);
        if (!user || user.role !== 'Reader') {
            return res.status(403).json({ message: 'Only readers can manage profiles' });
        }

        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};



// Borrow a Book
exports.borrowBook = async (req, res) => {
    try {
        const { bookId } = req.body;
        const user = await User.findById(req.user.id).populate('borrowedBooks');

        if (user.role !== 'Reader') {
            return res.status(403).json({ message: 'Only readers can borrow books' });
        }

        // Check borrow limit
        if (user.borrowedBooks.length >= 5) {
            return res.status(400).json({ message: 'Borrow limit reached (maximum 5 books)' });
        }

        const book = await Book.findById(bookId);
        if (!book || book.stock <= 0) {
            return res.status(400).json({ message: 'Book is out of stock or not available' });
        }

        // Add the book to the reader's borrowed list and decrease the stock
        user.borrowedBooks.push(book._id);
        book.stock -= 1;
        book.borrowedBy.push(user._id);

        await user.save();
        await book.save();

        res.status(200).json({ message: 'Book borrowed successfully', book });
    } catch (error) {
        res.status(500).json({ message: 'Error borrowing book', error: error.message });
    }
};

// Return a Book
exports.returnBook = async (req, res) => {
    try {
        const { bookId } = req.body;
        const user = await User.findById(req.user.id).populate('borrowedBooks');

        if (user.role !== 'Reader') {
            return res.status(403).json({ message: 'Only readers can return books' });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Remove the book from the reader's borrowed list and increase the stock
        user.borrowedBooks = user.borrowedBooks.filter((id) => id.toString() !== bookId);
        book.stock += 1;
        book.borrowedBy = book.borrowedBy.filter((id) => id.toString() !== user._id);

        await user.save();
        await book.save();

        res.status(200).json({ message: 'Book returned successfully', book });
    } catch (error) {
        res.status(500).json({ message: 'Error returning book', error: error.message });
    }
};

// Get All Borrowed Books
exports.getBorrowedBooks = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).populate('borrowedBooks', 'title genre stock');
        if (!user || user.role !== 'Reader') {
            return res.status(404).json({ message: 'Reader not found or invalid role' });
        }

        res.status(200).json({ borrowedBooks: user.borrowedBooks });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving borrowed books', error: error.message });
    }
};
