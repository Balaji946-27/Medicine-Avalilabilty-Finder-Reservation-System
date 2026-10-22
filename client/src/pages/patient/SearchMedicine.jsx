import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import MedicineCard from '../../components/MedicineCard';
import EmptyState from '../../components/EmptyState';
import medicineService from '../../services/medicineService';

const SearchMedicine = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = [
    'All',
    'Analgesic',
    'Antibiotic',
    'Antidiabetic',
    'Antihypertensive',
    'Vitamin',
    'Antacid',
    'Allergy',
    'Gastrointestinal',
    'Respiratory',
    'General',
  ];

  useEffect(() => {
    fetchMedicines();
  }, [filterCategory]);

  const fetchMedicines = async (query = searchQuery) => {
    setLoading(true);
    setError('');
    try {
      const res = await medicineService.getMedicines({
        search: query,
        category: filterCategory,
      });
      if (res.success) {
        setMedicines(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to search medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMedicines(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilterCategory('');
    fetchMedicines('');
  };

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
          Medi<span style={{ color: 'var(--primary)' }}>Find</span>
        </span>
      </header>

      <div className="page-layout">
        <Sidebar
          role="patient"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Search Medicines</h1>
              <p className="page-subtitle">
                Search the MediFind directory to check medicine availability across participating pharmacies.
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="card mb-6" style={{ padding: 'var(--space-5)' }}>
            <form onSubmit={handleSearchSubmit} className="search-bar" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Search input */}
              <div className="search-input-wrapper" style={{ flex: 2, minWidth: '240px' }}>
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="Search medicine name, generic name, category, or manufacturer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search medicines"
                />
              </div>

              {/* Category filter */}
              <select
                className="form-select"
                style={{ flex: 1, minWidth: '160px' }}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                aria-label="Filter by category"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat === 'All' ? '' : cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                🔍 Search
              </button>
              {(searchQuery || filterCategory) && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleClearSearch}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  ✕ Clear
                </button>
              )}
            </form>
          </div>

          {error && (
            <div className="error-message mb-6">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Results Layout */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-4)',
              }}
            >
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', fontWeight: 500 }}>
                {loading ? 'Searching medicines...' : `Showing ${medicines.length} matching medicines`}
              </p>
            </div>

            {loading ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <span className="spinner" /> Searching MediFind database...
              </div>
            ) : medicines.length === 0 ? (
              <EmptyState
                icon="💊"
                title="No medicines found"
                description="No matching medicines found in the directory. Try a different search query or clear filters."
                action={
                  <button className="btn btn-outline btn-sm" onClick={handleClearSearch}>
                    Clear Search
                  </button>
                }
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                {medicines.map((med) => (
                  <MedicineCard
                    key={med._id}
                    medicine={med}
                    onViewDetails={() => navigate(`/patient/medicine/${med._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchMedicine;
