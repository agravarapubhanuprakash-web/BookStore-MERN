const express = require('express');
const { body } = require('express-validator');
const {
  createRazorpayOrder,
  verifyPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/razorpay',
  [
    body('orderId').isMongoId().withMessage('Invalid order ID')
  ],
  validate,
  createRazorpayOrder
);

router.post(
  '/verify',
  [
    body('razorpay_order_id').notEmpty().withMessage('Razorpay order ID is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Razorpay payment ID is required'),
    body('razorpay_signature').notEmpty().withMessage('Razorpay signature is required'),
    body('orderId').isMongoId().withMessage('Invalid order ID')
  ],
  validate,
  verifyPayment
);

module.exports = router;
