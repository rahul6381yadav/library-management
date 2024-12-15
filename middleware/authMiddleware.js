const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return res.status(401).json({ message: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        if (!req.user) {
            return res.status(404).json({ message: 'User not found' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid or has expired' });
    }
};


exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        next();
    };
};
exports.authorizeSelf = async (req, res, next) => {
    if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'You are not authorized to perform this action' });
    }
    next();
};
