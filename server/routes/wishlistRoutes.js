const express = require('express');
const { body } = require('express-validator');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', getWishlist);

router.post(
  '/',
  [
    body('bookId').isMongoId().withMessage('Invalid book ID')
  ],
  validate,
  addToWishlist
);

router.delete('/:bookId', removeFromWishlist);

router.post(
  '/move-to-cart',
  [
    body('bookId').isMongoId().withMessage('Invalid book ID')
  ],
  validate,
  moveToCart
);

module.exports = router;
