import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Globe, User, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './Header.css';

export const Header: React.FC = () => {
  const { role, setRole, isAuthenticated, logout } = useAuth();
  const { toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header">
      <div className="container header-container">
        {/* Brand / Logo */}
        <Link to="/" className="header-brand">
          <div className="brand-icon">
            <Shield size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">SHOHOY</span>
            <span className="brand-sub">সহায়</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="header-nav hide-mobile">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            {t('home')}
          </Link>
          <Link to="/alerts" className={`nav-link ${isActive('/alerts') ? 'active' : ''}`}>
            {t('alerts')}
          </Link>
          <Link to="/shelters" className={`nav-link ${isActive('/shelters') ? 'active' : ''}`}>
            {t('shelters')}
          </Link>
          <Link to="/get-help" className={`nav-link ${isActive('/get-help') ? 'active' : ''}`}>
            {t('getHelp')}
          </Link>
          <Link to="/campaigns" className={`nav-link ${isActive('/campaigns') ? 'active' : ''}`}>
            {t('campaigns')}
          </Link>
          <Link to="/contacts" className={`nav-link ${isActive('/contacts') ? 'active' : ''}`}>
            {t('contacts')}
          </Link>
          {role === 'volunteer' && (
            <Link to="/volunteer/dashboard" className={`nav-link nav-special ${isActive('/volunteer/dashboard') ? 'active' : ''}`}>
              My Assignments
            </Link>
          )}
          {role === 'admin' && (
            <Link to="/admin/command-center" className={`nav-link nav-special ${isActive('/admin/command-center') ? 'active' : ''}`}>
              Command Center
            </Link>
          )}
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions">
          {/* Language Toggle */}
          <button className="lang-toggle-btn" onClick={toggleLanguage} title="Toggle Language">
            <Globe size={14} />
            <span>{t('banglaBtn')}</span>
          </button>

          {/* Sign In / User Profile */}
          {isAuthenticated ? (
            <Link to="/sign-in" className="btn-signin">
              <User size={14} />
              <span>Sign In</span>
            </Link>
          ) : (
            <Link to="/sign-in" className="btn-signin">
              <User size={14} />
              <span>{t('signIn')}</span>
            </Link>
          )}

          {/* Role Switcher (For prototype testing: Public / Volunteer / Admin) */}
          <div className="role-switcher-wrapper">
            <button
              className="role-switcher-btn"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              title="Switch Demo Role"
            >
              <Shield size={14} />
              <ChevronDown size={12} />
            </button>
            {roleDropdownOpen && (
              <div className="role-dropdown animate-slide-down">
                <div className="dropdown-header">Select Prototype Role:</div>
                <button
                  className={`dropdown-item ${role === 'public' ? 'active' : ''}`}
                  onClick={() => {
                    setRole('public');
                    setRoleDropdownOpen(false);
                  }}
                >
                  🌐 Public Visitor
                </button>
                <button
                  className={`dropdown-item ${role === 'volunteer' ? 'active' : ''}`}
                  onClick={() => {
                    setRole('volunteer');
                    setRoleDropdownOpen(false);
                  }}
                >
                  💚 Volunteer Field Worker
                </button>
                <button
                  className={`dropdown-item ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => {
                    setRole('admin');
                    setRoleDropdownOpen(false);
                  }}
                >
                  🛡️ Administrator / Control Room
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer animate-slide-down">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            {t('home')}
          </Link>
          <Link to="/alerts" onClick={() => setMobileMenuOpen(false)}>
            {t('alerts')}
          </Link>
          <Link to="/shelters" onClick={() => setMobileMenuOpen(false)}>
            {t('shelters')}
          </Link>
          <Link to="/get-help" onClick={() => setMobileMenuOpen(false)}>
            {t('getHelp')}
          </Link>
          <Link to="/campaigns" onClick={() => setMobileMenuOpen(false)}>
            {t('campaigns')}
          </Link>
          <Link to="/contacts" onClick={() => setMobileMenuOpen(false)}>
            {t('contacts')}
          </Link>
          <Link to="/volunteer" onClick={() => setMobileMenuOpen(false)}>
            Volunteer Portal
          </Link>
          <Link to="/admin/command-center" onClick={() => setMobileMenuOpen(false)}>
            Command Center
          </Link>
        </div>
      )}
    </header>
  );
};
