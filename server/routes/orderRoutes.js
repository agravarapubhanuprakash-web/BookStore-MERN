const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getInvoice
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Protected routes (user)
router.post(
  '/',
  protect,
  [
    body('items').isArray({ min: 1 }).withMessage('Order items must be a non-empty array'),
    body('items.*.book').isMongoId().withMessage('Invalid book ID in items'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shippingAddress').isObject().withMessage('Shipping address is required'),
    body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
    body('shippingAddress.phone').notEmpty().withMessage('Phone number is required'),
    body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.state').notEmpty().withMessage('State is required'),
    body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
    body('shippingAddress.country').notEmpty().withMessage('Country is required'),
    body('paymentMethod').isIn(['razorpay', 'cod']).withMessage('Invalid payment method')
  ],
  validate,
  createOrder
);

router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/invoice', protect, getInvoice);

// Admin routes
router.get('/all/list', protect, adminOnly, getAllOrders); // changed from /all to /all/list or put before /:id so it doesn't match getOrderById

router.put(
  '/:id/status',
  protect,
  adminOnly,
  [
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid order status')
  ],
  validate,
  updateOrderStatus
);

module.exports = router;
