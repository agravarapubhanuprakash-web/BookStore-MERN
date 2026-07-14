const Review = require('../models/Review');
const Book = require('../models/Book');
const ApiError = require('../utils/ApiError');

/**
 * Helper: Recalculate the average rating and review count for a book.
 * Uses MongoDB aggregation to compute the values, then updates the book document.
 *
 * @param {string} bookId - The ID of the book to recalculate
 */
const recalculateBookRating = async (bookId) => {
  const result = await Review.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      rating: Math.round(result[0].averageRating * 10) / 10, // round to 1 decimal
      numReviews: result[0].reviewCount,
    });
  } else {
    // No reviews left — reset to defaults
    await Book.findByIdAndUpdate(bookId, {
      rating: 0,
      numReviews: 0,
    });
  }
};

/**
 * @desc    Create a review for a book
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res, next) => {
  try {
    const { book, rating, comment } = req.body;

    if (!book || !rating) {
      throw new ApiError(400, 'Book ID and rating are required');
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({
      user: req.user._id,
      book,
    });

    if (existingReview) {
      throw new ApiError(400, 'You have already reviewed this book');
    }

    // Verify the book exists
    const bookExists = await Book.findById(book);
    if (!bookExists) {
      throw new ApiError(404, 'Book not found');
    }

    const review = await Review.create({
      user: req.user._id,
      book,
      rating,
      comment,
    });

    // Recalculate the book's average rating
    await recalculateBookRating(book);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  Private (owner only)
 */
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Verify ownership
    if (review.user.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to update this review');
    }

    const { rating, comment } = req.body;

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    // Recalculate the book's average rating
    await recalculateBookRating(review.book);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (owner or admin)
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Verify ownership or admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      throw new ApiError(403, 'Not authorized to delete this review');
    }

    const bookId = review.book;

    await review.deleteOne();

    // Recalculate the book's average rating
    await recalculateBookRating(bookId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a book
 * @route   GET /api/reviews/book/:bookId
 * @access  Public
 */
const getBookReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews (admin, paginated)
 * @route   GET /api/reviews
 * @access  Admin
 */
const getAllReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Review.countDocuments();
    
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('book', 'title author')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getBookReviews,
  getAllReviews,
};
