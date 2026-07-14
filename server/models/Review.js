const mongoose = require('mongoose');

/**
 * Review Schema
 * --------------------------------------------------
 * Stores a user's rating & comment for a specific book.
 * A compound unique index on { user, book } ensures each
 * user can leave only ONE review per book.
 */
const reviewSchema = new mongoose.Schema(
  {
    // ── Reviewer ───────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },

    // ── Reviewed Book ──────────────────────────────
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
    },

    // ── Rating (1–5 stars) ─────────────────────────
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    // ── Review Text ────────────────────────────────
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// ───────────────────────────────────────────────────
// COMPOUND UNIQUE INDEX
// Prevents a user from submitting more than one review
// for the same book.
// ───────────────────────────────────────────────────
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
