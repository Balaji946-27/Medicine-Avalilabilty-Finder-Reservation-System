import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import DashboardCard from '../../components/DashboardCard';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import inventoryService from '../../services/inventoryService';
import pharmacyService from '../../services/pharmacyService';
import { useAuth } from '../../context/AuthContext';

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pharmacyProfile, setPharmacyProfile] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const profileRes = await pharmacyService.getProfile();
      if (profileRes.success && profileRes.data) {
        setPharmacyProfile(profileRes.data);
      }

      const invRes = await inventoryService.getInventory();
      if (invRes.success) {
        setInventory(invRes.data || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalMedicines = inventory.length;
  const availableStockCount = inventory.reduce(
    (acc, item) => acc + Math.max(0, item.totalQuantity - (item.reservedQuantity || 0)),
    0
  );
  const lowStockCount = inventory.filter(
    (item) => (item.totalQuantity - (item.reservedQuantity || 0)) <= 10
  ).length;

  const stats = [
    { title: 'Total Medicines',  value: totalMedicines, icon: '💊', colorClass: 'teal',  subtitle: 'Distinct SKUs' },
    { title: 'Available Stock',  value: availableStockCount, icon: '✅', colorClass: 'green', subtitle: 'Units in stock' },
    { title: 'Low Stock Items',  value: lowStockCount, icon: '⚠️', colorClass: 'amber', subtitle: '≤10 units left' },
    { title: 'Inventory Items',  value: totalMedicines, icon: '📦', colorClass: 'blue',  subtitle: 'Total cataloged' },
  ];

  return (
    <div>
      <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <button className="hamburger" style={{ display: 'flex' }} onClick={() => setSidebarOpen(true)} aria-label="Open menu">☰</button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>
          Medi<span style={{ color: 'var(--primary)' }}>Find</span>
        </span>
      </header>

      <div className="page-layout">
        <Sidebar role="pharmacy" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                Pharmacy Dashboard {pharmacyProfile ? `— ${pharmacyProfile.pharmacyName}` : ''}
              </h1>
              <p className="page-subtitle">Welcome back, {user?.name}! Manage your medicine stock and profile.</p>
            </div>
            <Link to="/pharmacy/inventory" className="btn btn-primary">
              📦 Manage Inventory
            </Link>
          </div>

          {!pharmacyProfile && !loading && (
            <div
              className="card mb-8"
              style={{
                background: 'linear-gradient(135deg, var(--primary-50), var(--secondary-50))',
                border: '1px solid var(--primary-200)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <span style={{ fontSize: '2rem' }}>🏥</span>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0 }}>Complete Your Pharmacy Profile</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: '0.25rem 0 0 0' }}>
                    Add your address, phone number, and opening hours so patients can find your medicine availability.
                  </p>
                </div>
                <Link to="/pharmacy/profile" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  Setup Profile
                </Link>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="dashboard-cards mb-8">
            {stats.map((s) => (
              <DashboardCard key={s.title} {...s} />
            ))}
          </div>

          {/* Inventory preview table */}
          <div className="card mb-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>📦 Stock & Inventory Overview</h3>
              <Link to="/pharmacy/inventory" className="btn btn-ghost btn-sm">View All ({inventory.length})</Link>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}><span className="spinner" /> Loading stock items...</div>
            ) : inventory.length === 0 ? (
              <EmptyState
                icon="📦"
                title="No inventory added"
                description="Start by adding medicines to your pharmacy inventory."
                action={<Link to="/pharmacy/inventory" className="btn btn-primary btn-sm">Add Inventory Item</Link>}
              />
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Category</th>
                      <th>Total Quantity</th>
                      <th>Available Quantity</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.slice(0, 5).map((item) => {
                      const avail = item.totalQuantity - (item.reservedQuantity || 0);
                      const status = avail <= 0 ? 'unavailable' : avail <= 10 ? 'low' : 'available';
                      return (
                        <tr key={item._id}>
                          <td style={{ fontWeight: 600 }}>{item.medicineId?.name || 'Medicine'}</td>
                          <td>{item.medicineId?.category || 'General'}</td>
                          <td>{item.totalQuantity}</td>
                          <td style={{ fontWeight: 700, color: avail <= 0 ? 'var(--danger)' : avail <= 10 ? 'var(--warning)' : 'var(--success)' }}>
                            {avail}
                          </td>
                          <td style={{ fontWeight: 600 }}>₹{item.price}</td>
                          <td><StatusBadge status={status} /></td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
