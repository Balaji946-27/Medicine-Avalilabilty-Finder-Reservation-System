const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleBlockUser,
  getAllPharmaciesAdmin,
  toggleVerifyPharmacy,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require authentication and 'admin' role
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.get('/pharmacies', getAllPharmaciesAdmin);
router.put('/pharmacies/:id/verify', toggleVerifyPharmacy);

module.exports = router;
