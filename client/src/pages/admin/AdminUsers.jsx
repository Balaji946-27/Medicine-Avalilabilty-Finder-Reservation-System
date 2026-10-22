import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import adminService from '../../services/adminService';

const AdminUsers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers();
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (user) => {
    const actionName = user.isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${actionName} ${user.name}?`)) return;

    try {
      const res = await adminService.toggleBlockUser(user._id);
      if (res.success) {
        setSuccess(`User ${user.name} has been ${user.isBlocked ? 'unblocked' : 'blocked'}.`);
        setTimeout(() => setSuccess(''), 3000);
        fetchUsers();
      }
    } catch (err) {
      setError(err.message || 'Action failed');
    }
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
          Admin — User Management
        </span>
      </header>

      <div className="page-layout">
        <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">User Accounts</h1>
              <p className="page-subtitle">Manage registered patient, pharmacy, and admin users.</p>
            </div>
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

          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}><span className="spinner" /> Loading users...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: u.isBlocked ? 'var(--danger-light)' : 'var(--success-light)',
                            color: u.isBlocked ? 'var(--danger-dark)' : 'var(--success-dark)',
                          }}
                        >
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          <button
                            className={`btn btn-sm ${u.isBlocked ? 'btn-outline' : 'btn-ghost'}`}
                            style={{ color: u.isBlocked ? 'var(--success)' : 'var(--danger)' }}
                            onClick={() => handleToggleBlock(u)}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block User'}
                          </button>
                        )}
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

export default AdminUsers;
