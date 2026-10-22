const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getPharmacyReservations,
  getReservationById,
  cancelReservation,
  confirmReservation,
  rejectReservation,
  completeReservation,
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ── Patient routes ─────────────────────────────────────────────────────────────
// POST   /api/reservations          — create a reservation
router.post('/', protect, authorize('patient'), createReservation);

// GET    /api/reservations/my       — list patient's own reservations
// IMPORTANT: this route MUST come before /:id to avoid 'my' being treated as an id
router.get('/my', protect, authorize('patient'), getMyReservations);

// PATCH  /api/reservations/:id/cancel  — patient cancels their reservation
router.patch('/:id/cancel', protect, authorize('patient'), cancelReservation);

// ── Pharmacy routes ────────────────────────────────────────────────────────────
// GET    /api/reservations/pharmacy  — pharmacy lists their incoming reservations
router.get('/pharmacy', protect, authorize('pharmacy'), getPharmacyReservations);

// PATCH  /api/reservations/:id/confirm
router.patch('/:id/confirm', protect, authorize('pharmacy'), confirmReservation);

// PATCH  /api/reservations/:id/reject
router.patch('/:id/reject', protect, authorize('pharmacy'), rejectReservation);

// PATCH  /api/reservations/:id/complete
router.patch('/:id/complete', protect, authorize('pharmacy'), completeReservation);

// ── Shared route ───────────────────────────────────────────────────────────────
// GET    /api/reservations/:id      — get single reservation (patient or pharmacy or admin)
router.get('/:id', protect, getReservationById);

module.exports = router;
