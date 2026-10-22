import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import inventoryService from '../../services/inventoryService';
import medicineService from '../../services/medicineService';
import pharmacyService from '../../services/pharmacyService';

const getAvailableQty = (item) => item.totalQuantity - (item.reservedQuantity || 0);

const getStatus = (item) => {
  const available = getAvailableQty(item);
  if (available <= 0) return 'unavailable';
  if (available <= 10) return 'low';
  return 'available';
};

const Inventory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pharmacyProfile, setPharmacyProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalForm, setModalForm] = useState({
    medicineId: '',
    newMedicineName: '',
    newCategory: 'General',
    totalQuantity: 50,
    price: 30,
  });
  const [isCreatingNewMedicine, setIsCreatingNewMedicine] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // 1. Get profile
      const profRes = await pharmacyService.getProfile();
      if (profRes.success && profRes.data) {
        setPharmacyProfile(profRes.data);
      } else {
        setPharmacyProfile(null);
      }

      // 2. Fetch inventory
      const invRes = await inventoryService.getInventory();
      if (invRes.success) {
        setInventory(invRes.data || []);
      }

      // 3. Fetch medicine directory
      const medRes = await medicineService.getMedicines();
      if (medRes.success) {
        setMedicines(medRes.data || []);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsCreatingNewMedicine(false);
    setModalForm({
      medicineId: medicines.length > 0 ? medicines[0]._id : '',
      newMedicineName: '',
      newCategory: 'General',
      totalQuantity: 50,
      price: 30,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setIsCreatingNewMedicine(false);
    setModalForm({
      medicineId: item.medicineId?._id || '',
      newMedicineName: item.medicineId?.name || '',
      newCategory: item.medicineId?.category || 'General',
      totalQuantity: item.totalQuantity,
      price: item.price,
    });
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    const medicineName = item.medicineId?.name || 'this item';
    if (!window.confirm(`Are you sure you want to delete ${medicineName} from your inventory?`)) {
      return;
    }

    try {
      const res = await inventoryService.deleteInventoryItem(item._id);
      if (res.success) {
        setSuccessMessage('Item deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadData();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete item');
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      let targetMedicineId = modalForm.medicineId;

      if (!editingItem && isCreatingNewMedicine) {
        if (!modalForm.newMedicineName) {
          throw new Error('Medicine name is required');
        }
        const medRes = await medicineService.createMedicine({
          name: modalForm.newMedicineName,
          category: modalForm.newCategory,
        });
        targetMedicineId = medRes.data._id;
      }

      if (editingItem) {
        const res = await inventoryService.updateInventoryItem(editingItem._id, {
          totalQuantity: Number(modalForm.totalQuantity),
          price: Number(modalForm.price),
        });
        if (res.success) {
          setSuccessMessage('Inventory item updated successfully!');
        }
      } else {
        if (!targetMedicineId) {
          throw new Error('Please select or create a medicine');
        }
        const res = await inventoryService.addInventoryItem({
          medicineId: targetMedicineId,
          totalQuantity: Number(modalForm.totalQuantity),
          price: Number(modalForm.price),
        });
        if (res.success) {
          setSuccessMessage('Medicine added to inventory!');
        }
      }

      setShowModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
      loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = inventory.filter((item) => {
    if (!search) return true;
    const medName = item.medicineId?.name || '';
    const catName = item.medicineId?.category || '';
    return (
      medName.toLowerCase().includes(search.toLowerCase()) ||
      catName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div>
      <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <button
          className="hamburger"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>
          Inventory
        </span>
      </header>

      <div className="page-layout">
        <Sidebar role="pharmacy" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Medicine Inventory</h1>
              <p className="page-subtitle">Manage your pharmacy's stock availability and pricing.</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleOpenAddModal}
              id="add-medicine-btn"
              disabled={!pharmacyProfile}
            >
              ➕ Add Medicine
            </button>
          </div>

          {!pharmacyProfile && !loading && (
            <div
              style={{
                background: 'var(--warning-light)', border: '1px solid rgba(217,119,6,0.3)',
                borderRadius: 'var(--radius)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)',
                color: 'var(--warning-dark)', fontWeight: 600, fontSize: '0.875rem',
              }}
            >
              ⚠️ You must complete your Pharmacy Profile first before managing inventory items.
            </div>
          )}

          {successMessage && (
            <div
              style={{
                background: 'var(--success-light)', border: '1px solid rgba(22,163,74,0.25)',
                borderRadius: 'var(--radius)', padding: 'var(--space-4)', marginBottom: 'var(--space-5)',
                color: 'var(--success-dark)', fontWeight: 600, fontSize: '0.875rem',
              }}
            >
              ✅ {successMessage}
            </div>
          )}

          {errorMessage && (
            <div
              style={{
                background: 'var(--danger-light)', border: '1px solid rgba(220,38,38,0.25)',
                borderRadius: 'var(--radius)', padding: 'var(--space-4)', marginBottom: 'var(--space-5)',
                color: 'var(--danger-dark)', fontWeight: 600, fontSize: '0.875rem',
              }}
            >
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Search */}
          <div style={{ marginBottom: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div className="search-input-wrapper" style={{ flex: 1, maxWidth: '360px' }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Search medicine by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search inventory"
              />
            </div>
          </div>

          {/* Table */}
          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <span className="spinner" /> Loading inventory data...
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="📦"
                title="No inventory items found"
                description="Your inventory is currently empty or no items matched your search."
                action={
                  pharmacyProfile && (
                    <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
                      Add Medicine to Inventory
                    </button>
                  )
                }
              />
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Category</th>
                    <th>Total Qty</th>
                    <th>Reserved</th>
                    <th>Available Qty</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const available = getAvailableQty(item);
                    const status = getStatus(item);
                    return (
                      <tr key={item._id}>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                            {item.medicineId?.name || 'Unknown Medicine'}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              background: 'var(--secondary-50)', color: 'var(--secondary-700)',
                              fontSize: '0.75rem', fontWeight: 600,
                              padding: '2px 8px', borderRadius: 'var(--radius-full)',
                            }}
                          >
                            {item.medicineId?.category || 'General'}
                          </span>
                        </td>
                        <td>{item.totalQuantity}</td>
                        <td style={{ color: 'var(--warning-dark)', fontWeight: 600 }}>
                          {item.reservedQuantity || 0}
                        </td>
                        <td style={{ fontWeight: 700, color: available <= 0 ? 'var(--danger)' : available <= 10 ? 'var(--warning)' : 'var(--success)' }}>
                          {available}
                        </td>
                        <td style={{ fontWeight: 600 }}>₹{item.price}</td>
                        <td><StatusBadge status={status} /></td>
                        <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>
                          <div className="table-actions" style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Inventory Item"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)' }}
                              onClick={() => handleDelete(item)}
                              title="Delete Item"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: 500, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>
                {editingItem ? '✏️ Edit Inventory Item' : '➕ Add Medicine to Inventory'}
              </h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <form onSubmit={handleModalSubmit}>
              {!editingItem && (
                <div className="form-group mb-4">
                  <label className="form-label">Select Source</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="radio"
                        name="medSource"
                        checked={!isCreatingNewMedicine}
                        onChange={() => setIsCreatingNewMedicine(false)}
                      /> Select Existing Medicine
                    </label>
                    <label style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="radio"
                        name="medSource"
                        checked={isCreatingNewMedicine}
                        onChange={() => setIsCreatingNewMedicine(true)}
                      /> Create New Medicine
                    </label>
                  </div>
                </div>
              )}

              {!editingItem && !isCreatingNewMedicine && (
                <div className="form-group mb-4">
                  <label className="form-label">Select Medicine <span className="required">*</span></label>
                  <select
                    className="form-input"
                    value={modalForm.medicineId}
                    onChange={(e) => setModalForm({ ...modalForm, medicineId: e.target.value })}
                    required
                  >
                    {medicines.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.category || 'General'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!editingItem && isCreatingNewMedicine && (
                <>
                  <div className="form-group mb-4">
                    <label className="form-label">Medicine Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Paracetamol 500mg"
                      value={modalForm.newMedicineName}
                      onChange={(e) => setModalForm({ ...modalForm, newMedicineName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group mb-4">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Painkiller, Antibiotic"
                      value={modalForm.newCategory}
                      onChange={(e) => setModalForm({ ...modalForm, newCategory: e.target.value })}
                    />
                  </div>
                </>
              )}

              {editingItem && (
                <div className="form-group mb-4">
                  <label className="form-label">Medicine Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.medicineId?.name || ''}
                    disabled
                  />
                </div>
              )}

              <div className="form-group mb-4">
                <label className="form-label">Total Quantity <span className="required">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={modalForm.totalQuantity}
                  onChange={(e) => setModalForm({ ...modalForm, totalQuantity: e.target.value })}
                  required
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Price (₹) <span className="required">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  step="any"
                  value={modalForm.price}
                  onChange={(e) => setModalForm({ ...modalForm, price: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
