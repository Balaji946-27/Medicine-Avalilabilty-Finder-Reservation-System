const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const AppError = require('../utils/AppError');

// Helper to get pharmacy for current user
const getPharmacyForUser = async (userId) => {
  return await Pharmacy.findOne({ ownerId: userId });
};

// ─── GET /api/inventory ───────────────────────────────────────────────────────
const getInventory = async (req, res, next) => {
  try {
    const { pharmacyId, medicineId, search } = req.query;
    let filter = {};

    // If pharmacy user, default to their own pharmacy inventory
    if (req.user && req.user.role === 'pharmacy') {
      const pharmacy = await getPharmacyForUser(req.user._id);
      if (pharmacy) {
        filter.pharmacyId = pharmacy._id;
      } else {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
    } else if (pharmacyId) {
      filter.pharmacyId = pharmacyId;
    }

    if (medicineId) {
      filter.medicineId = medicineId;
    }

    let inventory = await Inventory.find(filter)
      .populate('medicineId', 'name genericName manufacturer category description')
      .populate('pharmacyId', 'pharmacyName address city phone openingHours')
      .sort({ updatedAt: -1 });

    // Filter by search query on medicine name/category if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      inventory = inventory.filter(
        (item) =>
          item.medicineId &&
          (searchRegex.test(item.medicineId.name) ||
            searchRegex.test(item.medicineId.genericName) ||
            searchRegex.test(item.medicineId.category))
      );
    }

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/inventory/:id ───────────────────────────────────────────────────
const getInventoryById = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate('medicineId', 'name genericName manufacturer category description')
      .populate('pharmacyId', 'pharmacyName address city phone');

    if (!item) {
      return next(new AppError('Inventory item not found', 404));
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/inventory ──────────────────────────────────────────────────────
const addInventoryItem = async (req, res, next) => {
  try {
    const pharmacy = await getPharmacyForUser(req.user._id);
    if (!pharmacy) {
      return next(
        new AppError('Please complete your pharmacy profile first before adding inventory', 400)
      );
    }

    const { medicineId, totalQuantity, quantity, price } = req.body;
    const itemQuantity = totalQuantity !== undefined ? totalQuantity : quantity;

    if (!medicineId) {
      return next(new AppError('Medicine selection is required', 400));
    }

    if (itemQuantity === undefined || itemQuantity < 0) {
      return next(new AppError('Valid total quantity is required (>= 0)', 400));
    }

    if (price === undefined || price < 0) {
      return next(new AppError('Valid price is required (>= 0)', 400));
    }

    // Check if medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return next(new AppError('Selected medicine does not exist', 404));
    }

    // Check if entry already exists for this pharmacy + medicine
    let existingItem = await Inventory.findOne({
      pharmacyId: pharmacy._id,
      medicineId,
    });

    if (existingItem) {
      existingItem.totalQuantity = Number(itemQuantity);
      existingItem.price = Number(price);
      existingItem.lastUpdated = Date.now();
      await existingItem.save();

      await existingItem.populate('medicineId', 'name genericName category manufacturer');

      return res.status(200).json({
        success: true,
        message: 'Inventory item updated successfully',
        data: existingItem,
      });
    }

    const inventoryItem = await Inventory.create({
      pharmacyId: pharmacy._id,
      medicineId,
      totalQuantity: Number(itemQuantity),
      reservedQuantity: 0,
      price: Number(price),
      lastUpdated: Date.now(),
    });

    await inventoryItem.populate('medicineId', 'name genericName category manufacturer');

    res.status(201).json({
      success: true,
      data: inventoryItem,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/inventory/:id ───────────────────────────────────────────────────
const updateInventoryItem = async (req, res, next) => {
  try {
    const pharmacy = await getPharmacyForUser(req.user._id);
    if (!pharmacy) {
      return next(new AppError('Pharmacy profile not found', 404));
    }

    let item = await Inventory.findById(req.params.id);
    if (!item) {
      return next(new AppError('Inventory item not found', 404));
    }

    // Security Check: Verify item belongs to logged-in pharmacy
    if (item.pharmacyId.toString() !== pharmacy._id.toString()) {
      return next(
        new AppError('Unauthorized: You can only modify your own inventory', 403)
      );
    }

    const { totalQuantity, quantity, price } = req.body;
    const newQuantity = totalQuantity !== undefined ? totalQuantity : quantity;

    if (newQuantity !== undefined) {
      if (newQuantity < 0) {
        return next(new AppError('Quantity cannot be negative', 400));
      }
      item.totalQuantity = Number(newQuantity);
    }

    if (price !== undefined) {
      if (price < 0) {
        return next(new AppError('Price cannot be negative', 400));
      }
      item.price = Number(price);
    }

    item.lastUpdated = Date.now();
    await item.save();

    await item.populate('medicineId', 'name genericName category manufacturer');

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/inventory/:id ────────────────────────────────────────────────
const deleteInventoryItem = async (req, res, next) => {
  try {
    const pharmacy = await getPharmacyForUser(req.user._id);
    if (!pharmacy) {
      return next(new AppError('Pharmacy profile not found', 404));
    }

    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return next(new AppError('Inventory item not found', 404));
    }

    // Security Check: Verify item belongs to logged-in pharmacy
    if (item.pharmacyId.toString() !== pharmacy._id.toString()) {
      return next(
        new AppError('Unauthorized: You can only delete your own inventory items', 403)
      );
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Inventory item removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  getInventoryById,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};
