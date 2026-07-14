const express = require('express');
const { body } = require('express-validator');
const {
  createReservation,
  getMyReservations,
  cancelReservation,
  notifyReservation,
  getAllReservations
} = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Protected routes (User)
router.post(
  '/',
  protect,
  [
    body('bookId').isMongoId().withMessage('Invalid book ID')
  ],
  validate,
  createReservation
);

router.get('/my-reservations', protect, getMyReservations); // Let's check: wait, of course getMyReservations!
router.put('/cancel/:id', protect, cancelReservation);

// Admin only routes
router.get('/all/list', protect, adminOnly, getAllReservations);
router.put('/:id/notify', protect, adminOnly, notifyReservation);

module.exports = router;
