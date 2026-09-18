const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');
const AppError = require('../utils/AppError');

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPharmacies = await Pharmacy.countDocuments();
    const totalMedicines = await Medicine.countDocuments();
    const totalInventoryItems = await Inventory.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPharmacies,
        totalMedicines,
        totalInventoryItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/admin/users/:id/block ───────────────────────────────────────────
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === 'admin') {
      return next(new AppError('Cannot block an admin user', 400));
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/pharmacies ────────────────────────────────────────────────
const getAllPharmaciesAdmin = async (req, res, next) => {
  try {
    const pharmacies = await Pharmacy.find()
      .populate('ownerId', 'name email isBlocked')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pharmacies.length,
      data: pharmacies,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/admin/pharmacies/:id/verify ─────────────────────────────────────
const toggleVerifyPharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return next(new AppError('Pharmacy not found', 404));
    }

    pharmacy.isVerified = !pharmacy.isVerified;
    await pharmacy.save();

    res.status(200).json({
      success: true,
      message: `Pharmacy ${pharmacy.isVerified ? 'verified' : 'unverified'} successfully`,
      data: pharmacy,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleBlockUser,
  getAllPharmaciesAdmin,
  toggleVerifyPharmacy,
};
