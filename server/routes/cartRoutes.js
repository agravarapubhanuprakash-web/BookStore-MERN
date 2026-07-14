const express = require('express');
const { body } = require('express-validator');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', getCart);

router.post(
  '/',
  [
    body('bookId').isMongoId().withMessage('Invalid book ID'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  validate,
  addToCart
);

router.put(
  '/',
  [
    body('bookId').isMongoId().withMessage('Invalid book ID'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
  ],
  validate,
  updateCartItem
);

router.delete('/:bookId', removeFromCart);

router.delete('/', clearCart);

module.exports = router;
