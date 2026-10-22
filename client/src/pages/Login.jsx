import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.email || !formData.password) {
      setLocalError('Please enter both email and password');
      return;
    }

    try {
      const res = await login(formData);
      if (res && res.user) {
        const role = res.user.role;
        if (role === 'pharmacy') navigate('/pharmacy/dashboard');
        else if (role === 'admin') navigate('/admin/dashboard');
        else navigate('/patient/dashboard');
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-login">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">M</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', color: 'var(--text)' }}>
            Medi<span style={{ color: 'var(--primary)' }}>Find</span>
          </span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your MediFind account</p>

        {/* Error display */}
        {localError && (
          <div className="error-message" style={{ marginBottom: 'var(--space-5)' }}>
            <span className="error-icon">⚠️</span>
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email address <span className="required">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password <span className="required">*</span>
            </label>
            <div className="input-group">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-group-icon"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
            id="login-submit-btn"
            style={{ marginTop: '1rem' }}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="auth-link" style={{ marginTop: 'var(--space-5)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
