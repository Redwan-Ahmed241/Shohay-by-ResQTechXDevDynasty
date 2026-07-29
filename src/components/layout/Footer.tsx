import React from 'react';
import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand & Bio */}
          <div className="footer-brand-col">
            <div className="footer-logo">
              <div className="logo-icon">
                <Radio size={16} />
              </div>
              <div className="logo-text-wrapper">
                <div className="logo-title">SHOHOY / সহায়</div>
                <div className="logo-sub">Bangladesh Flood Relief Platform</div>
              </div>
            </div>
            <p className="footer-desc">
              Coordinating immediate rescue, shelter, and relief operations for flood-affected communities.
            </p>
          </div>

          {/* Col 2: Public Services */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Public Services</h4>
            <ul className="footer-links">
              <li><Link to="/alerts">Flood Alerts</Link></li>
              <li><Link to="/shelters">Find Shelter</Link></li>
              <li><Link to="/get-help">Request Assistance</Link></li>
              <li><Link to="/alerts">Report Hazard</Link></li>
              <li><Link to="/contacts">Emergency Contacts</Link></li>
            </ul>
          </div>

          {/* Col 3: Platform */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/">Track Request</Link></li>
              <li><Link to="/campaigns">Campaigns & Donations</Link></li>
              <li><Link to="/volunteer">Volunteer</Link></li>
              <li><Link to="/contacts">Feedback</Link></li>
              <li><Link to="/sign-in">Staff Login</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Disclaimer */}
        <div className="footer-bottom">
          <span>SHOHOY / সহায় — Prototype Platform for Bangladesh Flood Relief Coordination</span>
          <span>All data shown is placeholder content for demonstration purposes</span>
        </div>
      </div>
    </footer>
  );
};
