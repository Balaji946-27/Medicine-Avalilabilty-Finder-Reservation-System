const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicineById,
  getMedicineAvailability,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public / Patient Search endpoints
router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.get('/:id/availability', getMedicineAvailability);

// Protected endpoints for pharmacy and admin
router.post('/', protect, authorize('pharmacy', 'admin'), createMedicine);
router.put('/:id', protect, authorize('pharmacy', 'admin'), updateMedicine);
router.delete('/:id', protect, authorize('pharmacy', 'admin'), deleteMedicine);

module.exports = router;
