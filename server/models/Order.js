const mongoose = require('mongoose');

/**
 * Order Schema
 * --------------------------------------------------
 * Represents a customer order containing one or more
 * books, shipping details, payment info (Razorpay / COD),
 * and fulfilment status tracking.
 */
const orderSchema = new mongoose.Schema(
  {
    // ── Customer ───────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },

    // ── Line Items ─────────────────────────────────
    items: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
        },
        title: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        price: {
          type: Number,
        },
      },
    ],

    // ── Shipping Address ───────────────────────────
    shippingAddress: {
      fullName: { type: String },
      phone: { type: String },
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },

    // ── Payment ────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'],
      required: [true, 'Payment method is required'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    // ── Order Fulfilment ───────────────────────────
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },

    // ── Razorpay Integration ───────────────────────
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },

    // ── Invoice ────────────────────────────────────
    invoiceNumber: {
      type: String,
      unique: true,
    },

    // ── Pricing Breakdown ──────────────────────────
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    taxPrice: {
      type: Number,
      default: 0,
    },

    // ── Delivery ───────────────────────────────────
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// ───────────────────────────────────────────────────
// PRE-SAVE MIDDLEWARE — Auto-generate invoice number
// Only runs for brand-new documents (isNew === true).
// Format: INV-<timestamp>  e.g. INV-1719937200000
// ───────────────────────────────────────────────────
orderSchema.pre('save', function (next) {
  if (this.isNew && !this.invoiceNumber) {
    this.invoiceNumber = 'INV-' + Date.now();
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
