const express = require('express');
const router = express.Router();
const {
  getPharmacyProfile,
  createPharmacyProfile,
  updatePharmacyProfile,
  getPharmacies,
  getPharmacyById,
  getPharmacyMedicines,
} = require('../controllers/pharmacyController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protected profile routes (for authenticated pharmacy owners)
router
  .route('/profile')
  .get(protect, authorize('pharmacy'), getPharmacyProfile)
  .post(protect, authorize('pharmacy'), createPharmacyProfile)
  .put(protect, authorize('pharmacy'), updatePharmacyProfile);

// Public / general pharmacy routes
router.get('/', getPharmacies);
router.get('/:id', getPharmacyById);
router.get('/:id/medicines', getPharmacyMedicines);

module.exports = router;
