const Pharmacy = require('../models/Pharmacy');
const Inventory = require('../models/Inventory');
const AppError = require('../utils/AppError');

// ─── GET /api/pharmacies/profile ─────────────────────────────────────────────
const getPharmacyProfile = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findOne({ ownerId: req.user._id });
    if (!pharmacy) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No pharmacy profile found for this user',
      });
    }

    res.status(200).json({
      success: true,
      data: pharmacy,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/pharmacies/profile ────────────────────────────────────────────
const createPharmacyProfile = async (req, res, next) => {
  try {
    const existing = await Pharmacy.findOne({ ownerId: req.user._id });
    if (existing) {
      return next(
        new AppError('Pharmacy profile already exists for this account', 409)
      );
    }

    const { pharmacyName, address, city, phone, openingHours, location } = req.body;

    if (!pharmacyName || !address || !city) {
      return next(
        new AppError('Pharmacy name, address, and city are required', 400)
      );
    }

    const pharmacy = await Pharmacy.create({
      ownerId: req.user._id, // Enforce logged-in user as owner
      pharmacyName,
      address,
      city,
      phone: phone || '',
      openingHours: openingHours || '',
      location: location || { latitude: null, longitude: null },
    });

    res.status(201).json({
      success: true,
      data: pharmacy,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/pharmacies/profile ─────────────────────────────────────────────
const updatePharmacyProfile = async (req, res, next) => {
  try {
    let pharmacy = await Pharmacy.findOne({ ownerId: req.user._id });

    if (!pharmacy) {
      return next(new AppError('Pharmacy profile not found. Please create one first.', 404));
    }

    const { pharmacyName, address, city, phone, openingHours, location } = req.body;

    if (pharmacyName) pharmacy.pharmacyName = pharmacyName;
    if (address) pharmacy.address = address;
    if (city) pharmacy.city = city;
    if (phone !== undefined) pharmacy.phone = phone;
    if (openingHours !== undefined) pharmacy.openingHours = openingHours;
    if (location !== undefined) pharmacy.location = location;

    await pharmacy.save();

    res.status(200).json({
      success: true,
      data: pharmacy,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/pharmacies ──────────────────────────────────────────────────────
const getPharmacies = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const filter = {};

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }
    if (search) {
      filter.pharmacyName = { $regex: search, $options: 'i' };
    }

    const pharmacies = await Pharmacy.find(filter).populate(
      'ownerId',
      'name email'
    );

    res.status(200).json({
      success: true,
      count: pharmacies.length,
      data: pharmacies,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/pharmacies/:id ──────────────────────────────────────────────────
const getPharmacyById = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).populate(
      'ownerId',
      'name email'
    );
    if (!pharmacy) {
      return next(new AppError('Pharmacy not found', 404));
    }

    res.status(200).json({
      success: true,
      data: pharmacy,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/pharmacies/:id/medicines ───────────────────────────────────────
const getPharmacyMedicines = async (req, res, next) => {
  try {
    const pharmacyId = req.params.id;
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return next(new AppError('Pharmacy not found', 404));
    }

    const inventoryItems = await Inventory.find({ pharmacyId })
      .populate('medicineId', 'name genericName manufacturer category description')
      .sort({ updatedAt: -1 });

    // Filter available medicines (availableQuantity = totalQuantity - reservedQuantity > 0)
    const availableMedicines = inventoryItems
      .map((item) => {
        const total = item.totalQuantity || 0;
        const reserved = item.reservedQuantity || 0;
        const availableQty = total - reserved;

        return {
          inventoryId: item._id,
          medicine: item.medicineId,
          totalQuantity: total,
          reservedQuantity: reserved,
          availableQuantity: availableQty > 0 ? availableQty : 0,
          price: item.price,
          lastUpdated: item.lastUpdated || item.updatedAt,
        };
      })
      .filter((item) => item.medicine && item.availableQuantity > 0);

    res.status(200).json({
      success: true,
      pharmacy,
      count: availableMedicines.length,
      medicines: availableMedicines,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPharmacyProfile,
  createPharmacyProfile,
  updatePharmacyProfile,
  getPharmacies,
  getPharmacyById,
  getPharmacyMedicines,
};
