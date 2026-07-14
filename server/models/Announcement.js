const mongoose = require('mongoose');

/**
 * Announcement Schema
 * --------------------------------------------------
 * Admin-created site-wide announcements displayed as
 * banners or notification cards. Supports four severity
 * types: info, warning, success, and danger.
 */
const announcementSchema = new mongoose.Schema(
  {
    // ── Content ────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
    },
    message: {
      type: String,
      required: [true, 'Announcement message is required'],
    },

    // ── Severity / Display Type ────────────────────
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'danger'],
      default: 'info',
    },

    // ── Visibility Toggle ──────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Author (Admin) ─────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
