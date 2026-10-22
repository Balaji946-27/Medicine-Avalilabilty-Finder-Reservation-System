const Reservation = require('../models/Reservation');
const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');
const AppError = require('../utils/AppError');

// ─── Helper: get pharmacy for authenticated pharmacy user ─────────────────────
const getPharmacyForUser = async (userId) => {
  return await Pharmacy.findOne({ ownerId: userId });
};

// ─── POST /api/reservations ───────────────────────────────────────────────────
// Patient creates a reservation
const createReservation = async (req, res, next) => {
  try {
    const { inventoryId, quantity } = req.body;

    if (!inventoryId) {
      return next(new AppError('Inventory item ID is required', 400));
    }

    const qty = Number(quantity);
    if (!qty || qty < 1) {
      return next(new AppError('Quantity must be at least 1', 400));
    }

    // Lock inventory record and validate stock atomically
    const inventoryItem = await Inventory.findById(inventoryId)
      .populate('medicineId', 'name genericName')
      .populate('pharmacyId', 'pharmacyName address city');

    if (!inventoryItem) {
      return next(new AppError('Medicine inventory item not found', 404));
    }

    const availableQty = inventoryItem.totalQuantity - inventoryItem.reservedQuantity;

    if (availableQty <= 0) {
      return next(new AppError('This medicine is currently out of stock at this pharmacy', 400));
    }

    if (qty > availableQty) {
      return next(
        new AppError(
          `Only ${availableQty} unit${availableQty === 1 ? '' : 's'} are currently available`,
          400
        )
      );
    }

    // Atomic increment of reservedQuantity to reduce race conditions
    const updated = await Inventory.findOneAndUpdate(
      {
        _id: inventoryId,
        // Ensure enough stock is still available at the moment of update
        $expr: { $lte: [{ $add: ['$reservedQuantity', qty] }, '$totalQuantity'] },
      },
      { $inc: { reservedQuantity: qty } },
      { new: true }
    );

    if (!updated) {
      return next(
        new AppError('Insufficient stock — another reservation may have just been placed', 409)
      );
    }

    // Create the reservation record
    const reservation = await Reservation.create({
      patient: req.user._id,
      pharmacy: inventoryItem.pharmacyId._id,
      medicine: inventoryItem.medicineId._id,
      inventoryId: inventoryItem._id,
      quantity: qty,
      priceAtReservation: inventoryItem.price,
    });

    await reservation.populate([
      { path: 'medicine', select: 'name genericName' },
      { path: 'pharmacy', select: 'pharmacyName address city phone' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Medicine reserved successfully. Please pick it up at the pharmacy.',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/reservations/my ─────────────────────────────────────────────────
// Patient views their own reservations
const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ patient: req.user._id })
      .populate('medicine', 'name genericName category')
      .populate('pharmacy', 'pharmacyName address city phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/reservations/pharmacy ──────────────────────────────────────────
// Pharmacy views incoming reservations for their pharmacy
const getPharmacyReservations = async (req, res, next) => {
  try {
    const pharmacy = await getPharmacyForUser(req.user._id);
    if (!pharmacy) {
      return next(new AppError('Pharmacy profile not found', 404));
    }

    const { status } = req.query;
    const filter = { pharmacy: pharmacy._id };
    if (status) {
      filter.status = status;
    }

    const reservations = await Reservation.find(filter)
      .populate('medicine', 'name genericName category')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/reservations/:id ────────────────────────────────────────────────
// Get a single reservation (patient or pharmacy)
const getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('medicine', 'name genericName category')
      .populate('pharmacy', 'pharmacyName address city phone')
      .populate('patient', 'name email');

    if (!reservation) {
      return next(new AppError('Reservation not found', 404));
    }

    // Authorization: patient can only see their own; pharmacy can only see theirs
    const isPatient = reservation.patient._id.toString() === req.user._id.toString();
    const pharmacy = await getPharmacyForUser(req.user._id);
    const isPharmacy =
      pharmacy && reservation.pharmacy._id.toString() === pharmacy._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isPharmacy && !isAdmin) {
      return next(new AppError('Unauthorized: Access denied', 403));
    }

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/reservations/:id/cancel ──────────────────────────────────────
// Patient cancels a reservation (only if pending or confirmed)
const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return next(new AppError('Reservation not found', 404));
    }

    // Only the patient who made it can cancel
    if (reservation.patient.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized: You can only cancel your own reservations', 403));
    }

    if (!['pending', 'confirmed'].includes(reservation.status)) {
      return next(
        new AppError(`Cannot cancel a reservation with status: ${reservation.status}`, 400)
      );
    }

    // Release the reserved stock
    await Inventory.findByIdAndUpdate(reservation.inventoryId, {
      $inc: { reservedQuantity: -reservation.quantity },
    });

    reservation.status = 'cancelled';
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/reservations/:id/confirm ─────────────────────────────────────
// Pharmacy confirms a pending reservation
const confirmReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return next(new AppError('Reservation not found', 404));
    }

    const pharmacy = await getPharmacyForUser(req.user._id);
    if (!pharmacy || reservation.pharmacy.toString() !== pharmacy._id.toString()) {
      return next(new AppError('Unauthorized: This reservation does not belong to your pharmacy', 403));
    }

    if (reservation.status !== 'pending') {
      return next(new AppError(`Reservation is already ${reservation.status}`, 400));
    }

    reservation.status = 'confirmed';
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation confirmed',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/reservations/:id/reject ──────────────────────────────────────
// Pharmacy rejects a pending reservation and restores stock
const rejectReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return next(new AppError('Reservation not found', 404));
    }

    const pharmacy = await getPharmacyForUser(req.user._id);
    if (!pharmacy || reservation.pharmacy.toString() !== pharmacy._id.toString()) {
      return next(new AppError('Unauthorized: This reservation does not belong to your pharmacy', 403));
    }

    if (!['pending', 'confirmed'].includes(reservation.status)) {
      return next(new AppError(`Cannot reject a reservation with status: ${reservation.status}`, 400));
    }

    // Release the reserved stock back to available
    await Inventory.findByIdAndUpdate(reservation.inventoryId, {
      $inc: { reservedQuantity: -reservation.quantity },
    });

    reservation.status = 'rejected';
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation rejected and stock restored',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/reservations/:id/complete ────────────────────────────────────
// Pharmacy marks reservation completed (medicine handed over)
const completeReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return next(new AppError('Reservation not found', 404));
    }

    const pharmacy = await getPharmacyForUser(req.user._id);
    if (!pharmacy || reservation.pharmacy.toString() !== pharmacy._id.toString()) {
      return next(new AppError('Unauthorized: This reservation does not belong to your pharmacy', 403));
    }

    if (reservation.status !== 'confirmed') {
      return next(
        new AppError('Only confirmed reservations can be marked as completed', 400)
      );
    }

    // Deduct from actual totalQuantity and release reservedQuantity
    await Inventory.findByIdAndUpdate(reservation.inventoryId, {
      $inc: {
        totalQuantity: -reservation.quantity,
        reservedQuantity: -reservation.quantity,
      },
    });

    reservation.status = 'completed';
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation completed — inventory updated',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getPharmacyReservations,
  getReservationById,
  cancelReservation,
  confirmReservation,
  rejectReservation,
  completeReservation,
};
