const mongoose = require('mongoose');

/**
 * Wishlist Schema
 * --------------------------------------------------
 * Each user has exactly ONE wishlist document that holds
 * an array of Book references they'd like to purchase
 * or read later.
 */
const wishlistSchema = new mongoose.Schema(
  {
    // ── Owner ──────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true, // one wishlist per user
    },

    // ── Wishlisted Books ───────────────────────────
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
