const express = require('express');
const { body } = require('express-validator');
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
  getBooksByCategory,
  getFeaturedBooks,
  getNewArrivals,
  getBestSellers,
  getRecommendations
} = require('../controllers/bookController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getAllBooks);
router.get('/search', searchBooks);
router.get('/featured', getFeaturedBooks);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/category/:categoryId', getBooksByCategory);

// Protected routes (user)
router.get('/recommendations', protect, getRecommendations);

// Public route to get details (put after special paths so they don't get treated as :id)
router.get('/:id', getBookById);

// Admin only routes
router.post(
  '/',
  protect,
  adminOnly,
  upload.single('coverImage'),
  [
    body('title').notEmpty().withMessage('Title is required').trim(),
    body('author').notEmpty().withMessage('Author is required').trim(),
    body('category').notEmpty().withMessage('Category ID is required').isMongoId().withMessage('Invalid Category ID'),
    body('description').notEmpty().withMessage('Description is required').trim(),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
  ],
  validate,
  createBook
);

router.put(
  '/:id',
  protect,
  adminOnly,
  upload.single('coverImage'),
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty').trim(),
    body('author').optional().notEmpty().withMessage('Author cannot be empty').trim(),
    body('category').optional().isMongoId().withMessage('Invalid Category ID'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
  ],
  validate,
  updateBook
);

router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;
