const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');
const AppError = require('../utils/AppError');

// ─── GET /api/medicines ───────────────────────────────────────────────────────
const getMedicines = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (search && search.trim() !== '') {
      const query = search.trim();
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { genericName: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { manufacturer: { $regex: query, $options: 'i' } },
      ];
    }

    const medicines = await Medicine.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/medicines/:id ───────────────────────────────────────────────────
const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return next(new AppError('Medicine not found', 404));
    }

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/medicines/:id/availability ─────────────────────────────────────
const getMedicineAvailability = async (req, res, next) => {
  try {
    const medicineId = req.params.id;
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return next(new AppError('Medicine not found', 404));
    }

    // Find all inventory records for this medicine
    const inventoryItems = await Inventory.find({ medicineId })
      .populate('pharmacyId', 'pharmacyName address city phone openingHours location isVerified')
      .sort({ price: 1 });

    // Filter to only include pharmacies where availableQuantity = totalQuantity - reservedQuantity > 0
    const availablePharmacies = inventoryItems
      .map((item) => {
        const total = item.totalQuantity || 0;
        const reserved = item.reservedQuantity || 0;
        const availableQty = total - reserved;

        return {
          inventoryId: item._id,
          pharmacy: item.pharmacyId,
          totalQuantity: total,
          reservedQuantity: reserved,
          availableQuantity: availableQty > 0 ? availableQty : 0,
          price: item.price,
          lastUpdated: item.lastUpdated || item.updatedAt,
        };
      })
      .filter((item) => item.pharmacy && item.availableQuantity > 0);

    res.status(200).json({
      success: true,
      medicine,
      count: availablePharmacies.length,
      pharmacies: availablePharmacies,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/medicines ──────────────────────────────────────────────────────
const createMedicine = async (req, res, next) => {
  try {
    const { name, genericName, manufacturer, category, description } = req.body;

    if (!name) {
      return next(new AppError('Medicine name is required', 400));
    }

    // Check if medicine with exact name exists
    const existing = await Medicine.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Medicine already exists in directory',
        data: existing,
      });
    }

    const medicine = await Medicine.create({
      name: name.trim(),
      genericName: genericName ? genericName.trim() : '',
      manufacturer: manufacturer ? manufacturer.trim() : '',
      category: category ? category.trim() : 'General',
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/medicines/:id ───────────────────────────────────────────────────
const updateMedicine = async (req, res, next) => {
  try {
    let medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return next(new AppError('Medicine not found', 404));
    }

    const { name, genericName, manufacturer, category, description } = req.body;

    if (name) medicine.name = name.trim();
    if (genericName !== undefined) medicine.genericName = genericName.trim();
    if (manufacturer !== undefined) medicine.manufacturer = manufacturer.trim();
    if (category !== undefined) medicine.category = category.trim();
    if (description !== undefined) medicine.description = description.trim();

    await medicine.save();

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/medicines/:id ────────────────────────────────────────────────
const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return next(new AppError('Medicine not found', 404));
    }

    await medicine.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Medicine removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicines,
  getMedicineById,
  getMedicineAvailability,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};
