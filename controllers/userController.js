const User = require('../models/User'); // Correct the path based on your project structure
const bcrypt = require('bcrypt'); // Ensure bcrypt is imported if used
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15d' });
};

// Signup Controller
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await User.create({ name, email, password, role });

        // Generate token valid for 15 days
        const token = generateToken(user._id);

        res.status(201).json({ message: 'User created', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Login Controller
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');

        // Generate token valid for 15 days
        const token = generateToken(user._id);

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(400).json({ error: error.message ,"name":"rahul"});
    }
};


exports.validateSession = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) throw new Error('Invalid session');

        res.status(200).json({ message: 'Session is valid', user });
    } catch (error) {
        res.status(401).json({ message: 'Session is invalid or expired' });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params; // User ID from route parameter
    const { name, password } = req.body; // Name or password from request body

    try {
        // Find the user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update name if provided
        if (name) {
            user.name = name;
        }

        // Update password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Save changes to the database
        await user.save();

        // Send success response
        res.status(200).json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Find and delete the user by ID
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};