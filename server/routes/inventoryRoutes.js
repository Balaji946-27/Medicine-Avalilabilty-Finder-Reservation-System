const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryById,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/inventory (Public or authenticated)
router.get('/', protect, getInventory);
router.get('/:id', protect, getInventoryById);

// Pharmacy only inventory CRUD
router.post('/', protect, authorize('pharmacy'), addInventoryItem);
router.put('/:id', protect, authorize('pharmacy'), updateInventoryItem);
router.delete('/:id', protect, authorize('pharmacy'), deleteInventoryItem);

module.exports = router;
