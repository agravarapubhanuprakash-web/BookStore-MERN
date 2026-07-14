const mongoose = require('mongoose');

/**
 * Reservation Schema
 * --------------------------------------------------
 * Tracks a user's reservation for a book (e.g. when a
 * book is out of stock). The status follows the lifecycle:
 *   active → notified → fulfilled / cancelled
 */
const reservationSchema = new mongoose.Schema(
  {
    // ── Requesting User ────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },

    // ── Reserved Book ──────────────────────────────
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
    },

    // ── Reservation Status ─────────────────────────
    status: {
      type: String,
      enum: ['active', 'notified', 'cancelled', 'fulfilled'],
      default: 'active',
    },

    // ── Notification Timestamp ─────────────────────
    notifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
