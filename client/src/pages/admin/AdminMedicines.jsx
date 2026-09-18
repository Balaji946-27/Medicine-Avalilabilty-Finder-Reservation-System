import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import medicineService from '../../services/medicineService';

const AdminMedicines = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state for creating medicine
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    manufacturer: '',
    category: 'General',
    description: '',
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await medicineService.getMedicines();
      if (res.success) {
        setMedicines(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await medicineService.createMedicine(formData);
      if (res.success) {
        setSuccess('Medicine added to global directory!');
        setFormData({ name: '', genericName: '', manufacturer: '', category: 'General', description: '' });
        setShowForm(false);
        setTimeout(() => setSuccess(''), 3000);
        fetchMedicines();
      }
    } catch (err) {
      setError(err.message || 'Failed to add medicine');
    }
  };

  const handleDelete = async (med) => {
    if (!window.confirm(`Are you sure you want to delete ${med.name}?`)) return;
    try {
      const res = await medicineService.deleteMedicine(med._id);
      if (res.success) {
        setSuccess(`Medicine ${med.name} removed.`);
        setTimeout(() => setSuccess(''), 3000);
        fetchMedicines();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete medicine');
    }
  };

  return (
    <div>
      <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <button className="hamburger" style={{ display: 'flex' }} onClick={() => setSidebarOpen(true)}>☰</button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>
          Admin — Medicine Catalogue
        </span>
      </header>

      <div className="page-layout">
        <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Global Medicine Catalogue</h1>
              <p className="page-subtitle">Manage medicine directory entries across MediFind.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '➕ Add New Medicine'}
            </button>
          </div>

          {success && (
            <div style={{ background: 'var(--success-light)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem', color: 'var(--success-dark)' }}>
              ✅ {success}
            </div>
          )}

          {error && (
            <div style={{ background: 'var(--danger-light)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem', color: 'var(--danger-dark)' }}>
              ⚠️ {error}
            </div>
          )}

          {showForm && (
            <div className="card mb-8">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Add New Medicine</h3>
              <form onSubmit={handleCreate}>
                <div className="grid grid-2 mb-4">
                  <div className="form-group">
                    <label className="form-label">Medicine Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Paracetamol 500mg"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Generic Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Acetaminophen"
                      value={formData.genericName}
                      onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-2 mb-4">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Analgesic, Antibiotic"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Manufacturer</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Cipla, Sun Pharma"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group mb-4">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Short summary of indications..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary">Save Medicine</button>
              </form>
            </div>
          )}

          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}><span className="spinner" /> Loading medicines...</div>
            ) : medicines.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No medicines in global directory yet.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Generic Name</th>
                    <th>Category</th>
                    <th>Manufacturer</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((m) => (
                    <tr key={m._id}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td>{m.genericName || 'N/A'}</td>
                      <td>{m.category || 'General'}</td>
                      <td>{m.manufacturer || 'N/A'}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => handleDelete(m)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminMedicines;
