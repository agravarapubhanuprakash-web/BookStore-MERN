const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/sendEmail');

/**
 * @desc    Create a reservation for an out-of-stock book
 * @route   POST /api/reservations
 * @access  Private
 */
const createReservation = async (req, res, next) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      throw new ApiError(400, 'Book ID is required');
    }

    const book = await Book.findById(bookId);

    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    // Only allow reservations for out-of-stock books
    if (book.stock > 0) {
      throw new ApiError(400, 'This book is currently in stock. You can add it to your cart instead.');
    }

    // Check if user already has an active reservation for this book
    const existingReservation = await Reservation.findOne({
      user: req.user._id,
      book: bookId,
      status: { $in: ['pending', 'notified'] },
    });

    if (existingReservation) {
      throw new ApiError(400, 'You already have an active reservation for this book');
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      book: bookId,
    });

    // Send confirmation email
    const user = await User.findById(req.user._id);
    if (user && user.email) {
      sendEmail(
        user.email,
        'Reservation Confirmed — BookStore',
        `<h2>Reservation Confirmed</h2>
         <p>You have reserved <strong>"${book.title}"</strong>.</p>
         <p>We will notify you as soon as it is back in stock.</p>
         <p>Reservation ID: <strong>${reservation._id}</strong></p>`
      ).catch((err) => console.error('Reservation email failed:', err.message));
    }

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reservations of the logged-in user
 * @route   GET /api/reservations/my
 * @access  Private
 */
const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('book', 'title author coverImage price stock')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a reservation
 * @route   PUT /api/reservations/:id/cancel
 * @access  Private (owner only)
 */
const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      throw new ApiError(404, 'Reservation not found');
    }

    // Verify ownership
    if (reservation.user.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to cancel this reservation');
    }

    if (reservation.status === 'cancelled') {
      throw new ApiError(400, 'Reservation is already cancelled');
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Notify a user that their reserved book is available (admin)
 * @route   PUT /api/reservations/:id/notify
 * @access  Admin
 */
const notifyReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('user', 'name email')
      .populate('book', 'title author');

    if (!reservation) {
      throw new ApiError(404, 'Reservation not found');
    }

    if (reservation.status === 'cancelled') {
      throw new ApiError(400, 'Cannot notify a cancelled reservation');
    }

    reservation.status = 'notified';
    reservation.notifiedAt = Date.now();
    await reservation.save();

    // Send notification email to the user
    if (reservation.user && reservation.user.email) {
      sendEmail(
        reservation.user.email,
        'Book Available — BookStore',
        `<h2>Good News, ${reservation.user.name}!</h2>
         <p>The book <strong>"${reservation.book.title}"</strong> by ${reservation.book.author} is now back in stock.</p>
         <p>Hurry and grab your copy before it runs out!</p>
         <p><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}">Visit BookStore</a></p>`
      ).catch((err) => console.error('Reservation notification email failed:', err.message));
    }

    res.status(200).json({
      success: true,
      message: 'User has been notified',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reservations (admin, paginated)
 * @route   GET /api/reservations
 * @access  Admin
 */
const getAllReservations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Reservation.countDocuments();

    const reservations = await Reservation.find()
      .populate('user', 'name email')
      .populate('book', 'title author coverImage price stock')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: reservations.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  cancelReservation,
  notifyReservation,
  getAllReservations,
};
