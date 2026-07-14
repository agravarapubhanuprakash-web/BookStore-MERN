const mongoose = require('mongoose');

/**
 * Category Schema
 * --------------------------------------------------
 * Represents a book category / genre (e.g. Fiction,
 * Science, History). Books reference a Category via
 * their `category` field.
 */
const categorySchema = new mongoose.Schema(
  {
    // ── Category Name ──────────────────────────────
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },

    // ── Optional Description ───────────────────────
    description: {
      type: String,
    },

    // ── Optional Image / Icon ──────────────────────
    image: {
      type: String,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
