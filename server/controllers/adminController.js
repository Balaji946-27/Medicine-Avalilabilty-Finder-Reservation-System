const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');
const Reservation = require('../models/Reservation');
const AppError = require('../utils/AppError');

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPharmacies = await Pharmacy.countDocuments();
    const totalMedicines = await Medicine.countDocuments();
    const totalInventoryItems = await Inventory.countDocuments();
    const totalReservations = await Reservation.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalPharmacyUsers = await User.countDocuments({ role: 'pharmacy' });
    const totalBlockedUsers = await User.countDocuments({ isBlocked: true });

    // Daily reservation counts for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyAgg = await Reservation.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const dailyReservations = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const found = dailyAgg.find((item) => item._id === dateStr);
      dailyReservations.push({
        date: dateStr,
        label: dayLabel,
        count: found ? found.count : 0,
      });
    }

    // Reservation status distribution matching supported statuses in Reservation model
    const statusAgg = await Reservation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const ALL_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'expired'];
    const statusDistribution = ALL_STATUSES.map((st) => {
      const match = statusAgg.find((s) => s._id === st);
      return {
        status: st,
        count: match ? match.count : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPharmacies,
        totalMedicines,
        totalInventoryItems,
        totalReservations,
        totalPatients,
        totalPharmacyUsers,
        totalBlockedUsers,
        dailyReservations,
        statusDistribution,
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

// ─── GET /api/admin/reservations ──────────────────────────────────────────────
const getAllReservationsAdmin = async (req, res, next) => {
  try {
    const reservations = await Reservation.find()
      .populate('patient', 'name email')
      .populate('pharmacy', 'pharmacyName city')
      .populate('medicine', 'name category')
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

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleBlockUser,
  getAllPharmaciesAdmin,
  toggleVerifyPharmacy,
  getAllReservationsAdmin,
};
