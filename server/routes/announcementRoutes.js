const express = require('express');
const { body } = require('express-validator');
const {
  getActiveAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Public routes
router.get('/active', getActiveAnnouncements);

// Admin routes
router.get('/', protect, adminOnly, getAllAnnouncements);

router.post(
  '/',
  protect,
  adminOnly,
  [
    body('title').notEmpty().withMessage('Title is required').trim(),
    body('message').notEmpty().withMessage('Message is required').trim(),
    body('type').optional().isIn(['info', 'warning', 'success', 'danger']).withMessage('Invalid announcement type')
  ],
  validate,
  createAnnouncement
);

router.put(
  '/:id',
  protect,
  adminOnly,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty').trim(),
    body('message').optional().notEmpty().withMessage('Message cannot be empty').trim(),
    body('type').optional().isIn(['info', 'warning', 'success', 'danger']).withMessage('Invalid announcement type')
  ],
  validate,
  updateAnnouncement
);

router.delete('/:id', protect, adminOnly, deleteAnnouncement);

module.exports = router;
