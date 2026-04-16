const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  verifyToken,
  getAllUsers,
  updateUserVerification,
  deleteUser
} = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/verify', verifyToken);
router.get('/users', protect, restrictTo('admin'), getAllUsers);
router.put('/users/:id/verify', protect, restrictTo('admin'), updateUserVerification);
router.delete('/users/:id', protect, restrictTo('admin'), deleteUser);

module.exports = router;