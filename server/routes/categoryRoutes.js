const express = require('express');
const { body } = require('express-validator');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Public routes
router.get('/', getAllCategories);

// Admin only routes
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('name').notEmpty().withMessage('Category name is required').trim(),
    body('description').optional().trim()
  ],
  validate,
  createCategory
);

router.put(
  '/:id',
  protect,
  adminOnly,
  [
    body('name').optional().notEmpty().withMessage('Category name cannot be empty').trim(),
    body('description').optional().trim()
  ],
  validate,
  updateCategory
);

router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
