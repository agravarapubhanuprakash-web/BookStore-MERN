const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/sendEmail');
const generateInvoice = require('../utils/generateInvoice');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      throw new ApiError(400, 'Order must contain at least one item');
    }

    if (!shippingAddress) {
      throw new ApiError(400, 'Shipping address is required');
    }

    // Validate each item and calculate totals
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const book = await Book.findById(item.book);

      if (!book) {
        throw new ApiError(404, `Book not found: ${item.book}`);
      }

      if (book.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for "${book.title}". Available: ${book.stock}`);
      }

      // Reduce stock
      book.stock -= item.quantity;
      await book.save();

      const itemTotal = book.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        book: book._id,
        title: book.title,
        quantity: item.quantity,
        price: book.price,
        image: book.coverImage,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      totalPrice,
    });

    // Send confirmation email (non-blocking)
    const user = await User.findById(req.user._id);
    if (user && user.email) {
      const itemsList = orderItems
        .map((i) => `<li>${i.title} x ${i.quantity} — ₹${(i.price * i.quantity).toFixed(2)}</li>`)
        .join('');

      sendEmail(
        user.email,
        'Order Confirmation — BookStore',
        `<h2>Thank you for your order!</h2>
         <p>Order ID: <strong>${order._id}</strong></p>
         <ul>${itemsList}</ul>
         <p><strong>Total: ₹${totalPrice.toFixed(2)}</strong></p>
         <p>We will notify you when your order ships.</p>`
      ).catch((err) => console.error('Order confirmation email failed:', err.message));
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get orders of the logged-in user
 * @route   GET /api/orders/my
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.book', 'title coverImage');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private (owner or admin)
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.book', 'title coverImage price author')
      .populate('user', 'name email');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Verify ownership or admin access
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      throw new ApiError(403, 'Not authorized to view this order');
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status (admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    order.status = status;

    // If delivered, set deliveredAt and mark COD orders as paid
    if (status === 'delivered') {
      order.deliveredAt = Date.now();

      if (order.paymentMethod === 'COD') {
        order.paymentStatus = 'paid';
        order.paidAt = Date.now();
      }
    }

    await order.save();

    // Send status update email
    if (order.user && order.user.email) {
      sendEmail(
        order.user.email,
        `Order ${status.charAt(0).toUpperCase() + status.slice(1)} — BookStore`,
        `<h2>Order Status Update</h2>
         <p>Your order <strong>${order._id}</strong> has been <strong>${status}</strong>.</p>
         ${status === 'delivered' ? '<p>Thank you for shopping with BookStore!</p>' : '<p>We will keep you updated on further changes.</p>'}`
      ).catch((err) => console.error('Status update email failed:', err.message));
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (admin, paginated)
 * @route   GET /api/orders
 * @access  Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments();

    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate and download invoice PDF for an order
 * @route   GET /api/orders/:id/invoice
 * @access  Private (owner or admin)
 */
const getInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.book', 'title price');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Verify ownership or admin access
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      throw new ApiError(403, 'Not authorized to access this invoice');
    }

    // Map order items for the invoice generator
    const invoiceOrder = {
      _id: order._id,
      user: order.user,
      shippingAddress: order.shippingAddress,
      orderItems: order.items.map((item) => ({
        title: item.title || (item.book && item.book.title) || 'Untitled',
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      totalPrice: order.totalPrice,
      paymentMethod: order.paymentMethod,
      isPaid: order.paymentStatus === 'paid',
      paidAt: order.paidAt,
      createdAt: order.createdAt,
    };

    const pdfBuffer = await generateInvoice(invoiceOrder);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${order._id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getInvoice,
};
