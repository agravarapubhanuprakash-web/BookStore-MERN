const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * --------------------------------------------------
 * Represents a registered user (or Google-authenticated user).
 * Stores profile info, addresses, wishlists, orders,
 * reading progress, and account-management fields.
 */
const userSchema = new mongoose.Schema(
  {
    // ── Profile ────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Password is NOT required for Google-authenticated users
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    phone: {
      type: String,
    },

    // ── Address ────────────────────────────────────
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },

    // ── Avatar ─────────────────────────────────────
    profileImage: {
      type: String,
      default: 'https://via.placeholder.com/150?text=User',
    },

    // ── Role & Permissions ─────────────────────────
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // ── Wishlist (array of Book references) ────────
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],

    // ── Orders (array of Order references) ─────────
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],

    // ── Recently Viewed Books ──────────────────────
    recentlyViewed: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ── Reading Progress Tracker ───────────────────
    readingProgress: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
        },
        progress: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        lastReadAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ── Password Reset Tokens ──────────────────────
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },

    // ── Account Status ─────────────────────────────
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// ───────────────────────────────────────────────────
// PRE-SAVE MIDDLEWARE — Hash password before saving
// Only hashes if the password field has been modified
// (prevents re-hashing on unrelated updates).
// ───────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // Skip hashing if password hasn't changed
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ───────────────────────────────────────────────────
// INSTANCE METHOD — Compare entered password with hash
// Returns true if passwords match, false otherwise.
// ───────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
