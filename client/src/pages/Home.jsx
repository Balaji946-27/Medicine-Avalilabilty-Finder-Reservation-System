import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [heroSearch, setHeroSearch] = useState('');

  useEffect(() => {
    // Health check logged silently in dev mode
    if (import.meta.env.DEV) {
      api.get('/api/test')
        .then((res) => console.log('Backend health status:', res.data?.message))
        .catch((err) => console.warn('Backend health check failed:', err.message));
    }
  }, []);

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate(`/patient/search${heroSearch ? `?search=${encodeURIComponent(heroSearch)}` : ''}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>💊</span>
              Find. Check. Reserve.
            </div>

            <h1 className="hero-title">
              Find the medicine you need,{' '}
              <span>near you.</span>
            </h1>

            <p className="hero-subtitle">
              Search medicines, check live pharmacy stock availability, and compare prices.
              No more wasted trips — know before you go.
            </p>

            {/* Search Box */}
            <form onSubmit={handleHeroSearchSubmit} className="hero-search-box">
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search for a medicine (e.g. Paracetamol, Amoxicillin)..."
                aria-label="Search for a medicine"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
              />
              <button type="submit" className="hero-search-btn">
                🔍 Find Medicine
              </button>
            </form>

            <p
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.85rem',
                marginTop: '1rem',
              }}
            >
              ✅ Real-time medicine search & pharmacy availability live.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="text-center mb-8">
            <p className="section-label">Simple & Fast</p>
            <h2 className="section-title">How MediFind Works</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Simple steps to find medicine availability without the hassle.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">🔍</div>
              <p className="step-title">Search Medicine</p>
              <p className="step-desc">
                Type the medicine name or generic name. Our system searches across registered pharmacies.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">🏥</div>
              <p className="step-title">Find Participating Pharmacies</p>
              <p className="step-desc">
                See pharmacies in your area that stock the medicine with live inventory levels.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">✅</div>
              <p className="step-title">Check Availability & Price</p>
              <p className="step-desc">
                View stock counts, prices in ₹, and pharmacy details before making the trip.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">📋</div>
              <p className="step-title">Visit Pharmacy</p>
              <p className="step-desc">
                Visit the pharmacy with complete stock availability confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--surface-2)' }} id="pharmacies">
        <div className="container">
          <div className="text-center mb-8">
            <p className="section-label">Why MediFind</p>
            <h2 className="section-title">Built for Patients & Pharmacies</h2>
          </div>

          <div className="grid grid-3" style={{ gap: 'var(--space-6)' }}>
            {[
              {
                icon: '⚡',
                title: 'Real-Time Availability',
                desc: 'Live inventory data updated by participating pharmacy staff.',
              },
              {
                icon: '📍',
                title: 'Pharmacy Information',
                desc: 'View address, phone number, and opening hours for local pharmacies.',
              },
              {
                icon: '💰',
                title: 'Transparent INR Pricing',
                desc: 'Compare medicine prices in ₹ across different pharmacies.',
              },
              {
                icon: '🏥',
                title: 'Multi-Pharmacy Coverage',
                desc: 'Aggregated inventory from multiple pharmacies in your area in one search.',
              },
              {
                icon: '🔒',
                title: 'Secure & Private',
                desc: 'Role-based security protecting user data and pharmacy inventory.',
              },
              {
                icon: '📱',
                title: 'Works Everywhere',
                desc: 'Fully responsive — use on your phone, tablet, or desktop.',
              },
            ].map((feature) => (
              <div key={feature.title} className="card" style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '2rem',
                    marginBottom: 'var(--space-4)',
                    display: 'block',
                  }}
                >
                  {feature.icon}
                </div>
                <h4 style={{ marginBottom: 'var(--space-2)', color: 'var(--text)' }}>
                  {feature.title}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section
        className="section"
        style={{
          background: 'linear-gradient(135deg, var(--primary-700), var(--secondary-700))',
        }}
        id="about"
      >
        <div className="container text-center">
          <h2
            style={{
              color: '#fff',
              fontSize: 'clamp(1.6rem, 3vw, 2.25rem)',
              marginBottom: 'var(--space-4)',
            }}
          >
            Ready to find your medicine?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.75)',
              marginBottom: 'var(--space-8)',
              fontSize: '1.05rem',
            }}
          >
            Join MediFind today as a patient or register your pharmacy.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)' }}>
              Get Started as Patient
            </Link>
            <Link
              to="/register"
              className="btn btn-lg"
              style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.5)', color: '#fff' }}
            >
              Register Your Pharmacy
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;
