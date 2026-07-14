const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  login
);

router.post(
  '/google',
  [
    body('tokenId').notEmpty().withMessage('Token ID is required')
  ],
  validate,
  googleLogin
);

router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail()
  ],
  validate,
  forgotPassword
);

router.put(
  '/reset-password/:token',
  [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  validate,
  resetPassword
);

// Protected routes (require login)
router.get('/profile', protect, getProfile);

router.put(
  '/profile',
  protect,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
    body('phone').optional().trim(),
    body('address').optional().isObject().withMessage('Address must be an object')
  ],
  validate,
  updateProfile
);

router.put(
  '/change-password',
  protect,
  [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
  ],
  validate,
  changePassword
);

router.put(
  '/profile-image',
  protect,
  upload.single('profileImage'),
  uploadProfileImage
);

module.exports = router;
