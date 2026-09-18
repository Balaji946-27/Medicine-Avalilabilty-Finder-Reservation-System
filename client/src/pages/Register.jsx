import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError(null);
    if (e.target.name === 'confirmPassword' || e.target.name === 'password') {
      setPasswordMismatch(false);
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setLocalError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (res && res.user) {
        if (res.user.role === 'pharmacy') navigate('/pharmacy/dashboard');
        else navigate('/patient/dashboard');
      }
    } catch (err) {
      setLocalError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">M</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)' }}>
            Medi<span style={{ color: 'var(--primary)' }}>Find</span>
          </span>
        </div>

        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Join MediFind and access medicines near you</p>

        {localError && (
          <div className="error-message" style={{ marginBottom: 'var(--space-5)' }}>
            <span className="error-icon">⚠️</span>
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate id="register-form">
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">I am a <span className="required">*</span></label>
            <div className="role-selector">
              <label
                className={`role-option ${formData.role === 'patient' ? 'selected' : ''}`}
                htmlFor="role-patient"
              >
                <input
                  type="radio"
                  id="role-patient"
                  name="role"
                  value="patient"
                  checked={formData.role === 'patient'}
                  onChange={() => handleRoleSelect('patient')}
                />
                <span className="role-icon">🙋</span>
                <span className="role-label">Patient</span>
              </label>

              <label
                className={`role-option ${formData.role === 'pharmacy' ? 'selected' : ''}`}
                htmlFor="role-pharmacy"
              >
                <input
                  type="radio"
                  id="role-pharmacy"
                  name="role"
                  value="pharmacy"
                  checked={formData.role === 'pharmacy'}
                  onChange={() => handleRoleSelect('pharmacy')}
                />
                <span className="role-icon">🏥</span>
                <span className="role-label">Pharmacy</span>
              </label>
            </div>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="register-name"
              type="text"
              name="name"
              className="form-input"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email address <span className="required">*</span>
            </label>
            <input
              id="register-email"
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

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password <span className="required">*</span>
            </label>
            <div className="input-group">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              id="register-confirm-password"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              className={`form-input ${passwordMismatch ? 'form-input-error' : ''}`}
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              style={passwordMismatch ? { borderColor: 'var(--danger)' } : {}}
            />
            {passwordMismatch && (
              <span className="form-error">Passwords do not match</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link" style={{ marginTop: 'var(--space-4)' }}>
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
