const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Create a Razorpay order for payment
 * @route   POST /api/payments/razorpay
 * @access  Private
 */
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      throw new ApiError(400, 'Order ID is required');
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Verify the order belongs to the current user
    if (order.user.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to pay for this order');
    }

    // Create Razorpay order (amount in paise — multiply by 100)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalPrice * 100),
      currency: 'INR',
      receipt: `receipt_${order._id}`,
      notes: {
        orderId: order._id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payments/verify
 * @access  Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new ApiError(400, 'All payment verification fields are required');
    }

    // Verify signature using HMAC SHA256
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      throw new ApiError(400, 'Payment verification failed. Invalid signature.');
    }

    // Update order payment status
    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    order.paymentStatus = 'paid';
    order.paidAt = Date.now();
    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
};
