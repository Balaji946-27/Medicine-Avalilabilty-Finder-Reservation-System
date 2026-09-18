import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div className="footer-brand-text">
              Medi<span>Find</span>
            </div>
            <p className="footer-desc">
              Connecting patients with the medicines they need at nearby pharmacies.
              Real-time availability, instant reservation.
            </p>
          </div>

          {/* For Patients */}
          <div>
            <p className="footer-col-title">For Patients</p>
            <ul className="footer-links">
              <li><Link to="/patient/search">Find Medicine</Link></li>
              <li><Link to="/patient/dashboard">Dashboard</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          {/* For Pharmacies */}
          <div>
            <p className="footer-col-title">For Pharmacies</p>
            <ul className="footer-links">
              <li><Link to="/register">Register Pharmacy</Link></li>
              <li><Link to="/pharmacy/dashboard">Dashboard</Link></li>
              <li><Link to="/pharmacy/inventory">Manage Inventory</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="footer-col-title">Support</p>
            <ul className="footer-links">
              <li><Link to="/#about">About</Link></li>
              <li><Link to="/#how-it-works">How It Works</Link></li>
              <li><a href="mailto:support@medifind.app">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} MediFind. All rights reserved.</span>
          <span>Built as a college project — not a real pharmacy system.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
