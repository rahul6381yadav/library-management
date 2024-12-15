const express = require('express');
const { signup, login, validateSession,updateUser,deleteUser } = require('../controllers/userController');
const { protect, authorizeSelf } = require('../middleware/authMiddleware'); // Import the protect middleware

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/session/validate', protect, validateSession); // Use the protect middleware
router.put('/update/:id', protect,authorizeSelf, updateUser); // Update user details
router.delete('/delete/:id', protect,authorizeSelf, deleteUser); // Delete user account


module.exports = router;
