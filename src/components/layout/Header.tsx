import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, Radio, Shield, Layers3, ChevronDown, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './Header.css';

const navigationItems = [
  { label: 'Home', path: '/' },
  { label: 'Alerts', path: '/alerts' },
  { label: 'Shelters', path: '/shelters' },
  { label: 'Get Help', path: '/get-help' },
  { label: 'Campaigns', path: '/campaigns' },
  { label: 'Contacts', path: '/contacts' },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const { toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="header-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <Radio size={18} />
          </div>
          <div className="brand-text">
            <span className="brand-title">SHOHAY</span>
            <span className="brand-sub">সহায়</span>
          </div>
        </Link>

        <nav className="header-nav hide-mobile">
          {navigationItems.map((item) => (
            <Link key={item.path} to={item.path} className={`nav-link ${isActive(item.path) ? 'active' : ''}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button className="utility-btn utility-lang hide-mobile" onClick={toggleLanguage} aria-label="Toggle language">
            <Globe size={14} />
            <span>বাংলা</span>
          </button>

          <Link to="/sign-in" className="utility-btn utility-signin hide-mobile">
            <Shield size={14} />
            <span>Sign In</span>
          </Link>

          <button className="utility-btn utility-icon hide-mobile" type="button" aria-label="More options">
            <Layers3 size={14} />
            <ChevronDown size={12} />
          </button>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-nav-drawer animate-slide-down">
          {navigationItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={isActive(item.path) ? 'active' : ''}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
