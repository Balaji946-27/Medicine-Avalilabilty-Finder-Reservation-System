import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import DashboardCard from '../../components/DashboardCard';
import adminService from '../../services/adminService';
import { DailyReservationTrendsChart, ReservationStatusChart } from '../../components/AdminCharts';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalPharmacies: 0,
    totalMedicines: 0,
    totalInventoryItems: 0,
    totalReservations: 0,
    dailyReservations: [],
    statusDistribution: [],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStats();
      if (res.success && res.data) {
        setStatsData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: 'Total Users',           value: statsData.totalUsers, icon: '👥', colorClass: 'teal',  subtitle: `${statsData.totalPatients || 0} patients, ${statsData.totalPharmacyUsers || 0} pharmacies` },
    { title: 'Registered Pharmacies', value: statsData.totalPharmacies, icon: '🏥', colorClass: 'blue',  subtitle: 'Active pharmacies' },
    { title: 'Medicine Catalogue',    value: statsData.totalMedicines, icon: '💊', colorClass: 'green', subtitle: 'Cataloged medicines' },
    { title: 'Total Reservations',    value: statsData.totalReservations || 0, icon: '📋', colorClass: 'indigo', subtitle: 'All-time reservations' },
  ];

  const managementSections = [
    {
      title: 'User Management',
      icon: '👥',
      desc: 'View registered users, manage permissions, block or unblock accounts.',
      link: '/admin/users',
    },
    {
      title: 'Pharmacy Management',
      icon: '🏥',
      desc: 'View registered pharmacies and update verification status.',
      link: '/admin/pharmacies',
    },
    {
      title: 'Medicine Catalogue',
      icon: '💊',
      desc: 'Manage global directory of medicines, categories, and details.',
      link: '/admin/medicines',
    },
  ];

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
          Admin Panel
        </span>
        <span
          style={{
            marginLeft: 'auto',
            background: 'var(--danger-light)', color: 'var(--danger-dark)',
            fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          ADMIN
        </span>
      </header>

      <div className="page-layout">
        <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="page-subtitle">Real-time system statistics and platform governance.</p>
            </div>
          </div>

          {/* Stats */}
          {loading ? (
            <div style={{ padding: '2rem 0', color: 'var(--text-muted)' }}>
              <span className="spinner" /> Loading real-time statistics...
            </div>
          ) : (
            <div className="dashboard-cards mb-8">
              {stats.map((s) => (
                <DashboardCard key={s.title} {...s} />
              ))}
            </div>
          )}

          {/* Charts: Daily Reservation Trends & Reservation Status Distribution */}
          {!loading && (
            <div className="grid grid-2 mb-8" style={{ gap: 'var(--space-5)' }}>
              <DailyReservationTrendsChart data={statsData.dailyReservations || []} />
              <ReservationStatusChart data={statsData.statusDistribution || []} />
            </div>
          )}

          {/* Management Sections */}
          <h2 style={{ fontSize: '1.15rem', marginBottom: 'var(--space-5)', color: 'var(--text)' }}>
            Management Controls
          </h2>
          <div className="grid grid-2" style={{ gap: 'var(--space-5)' }}>
            {managementSections.map((section) => (
              <div key={section.title} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  <span style={{ fontSize: '1.75rem' }}>{section.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                      <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0 }}>{section.title}</p>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>{section.desc}</p>
                    <Link to={section.link} className="btn btn-outline btn-sm">
                      Manage →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
