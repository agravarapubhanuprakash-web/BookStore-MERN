const express = require('express');
const { body } = require('express-validator');
const {
  createReview,
  updateReview,
  deleteReview,
  getBookReviews,
  getAllReviews
} = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Admin review moderation list
router.get('/', protect, adminOnly, getAllReviews);

// Public routes
router.get('/book/:bookId', getBookReviews);

// Protected routes
router.post(
  '/',
  protect,
  [
    body('book').isMongoId().withMessage('Invalid book ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').notEmpty().withMessage('Comment is required').trim()
  ],
  validate,
  createReview
);

router.put(
  '/:id',
  protect,
  [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().notEmpty().withMessage('Comment cannot be empty').trim()
  ],
  validate,
  updateReview
);

router.delete('/:id', protect, deleteReview);

module.exports = router;
