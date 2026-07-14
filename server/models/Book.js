const mongoose = require('mongoose');

/**
 * Book Schema
 * --------------------------------------------------
 * Represents a single book (physical or e-book) in
 * the store catalogue. Tracks pricing, stock, ratings,
 * and category association.
 */
const bookSchema = new mongoose.Schema(
  {
    // ── Core Details ───────────────────────────────
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    publisher: {
      type: String,
    },
    language: {
      type: String,
      default: 'English',
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true, // allows multiple docs without isbn (null values)
    },
    pageCount: {
      type: Number,
    },

    // ── Pricing ────────────────────────────────────
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number, // used to display strikethrough / discount
    },

    // ── Ratings ────────────────────────────────────
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    numReviews: {
      type: Number,
      default: 0,
    },

    // ── Inventory ──────────────────────────────────
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },

    // ── Media ──────────────────────────────────────
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x400.png?text=No+Cover',
    },
    ebookUrl: {
      type: String, // URL / path to downloadable e-book file
    },

    // ── Flags ──────────────────────────────────────
    isEbook: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ── Publication Info ───────────────────────────
    publicationDate: {
      type: Date,
    },

    // ── Tags for search / filtering ────────────────
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
