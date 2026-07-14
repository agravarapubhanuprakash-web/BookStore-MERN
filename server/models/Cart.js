const mongoose = require('mongoose');

/**
 * Cart Schema
 * --------------------------------------------------
 * Each user has exactly ONE cart document. The cart
 * contains an array of items, each referencing a Book
 * and tracking the desired quantity.
 */
const cartSchema = new mongoose.Schema(
  {
    // ── Owner ──────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true, // one cart per user
    },

    // ── Cart Items ─────────────────────────────────
    items: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, 'Quantity must be at least 1'],
        },
      },
    ],
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
