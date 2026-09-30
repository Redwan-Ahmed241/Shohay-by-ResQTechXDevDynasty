import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, Menu, Radio, Shield, X, LogOut } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import './Header.css';

// Each role sees only what's relevant to their job — a coordinator doesn't submit
// rescue requests, a volunteer isn't managing shelters or drones. `key` maps to a
// LanguageContext dictionary entry where one exists; items without one stay English.
const PUBLIC_NAV = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'alerts', label: 'Alerts', path: '/alerts' },
  { key: 'shelters', label: 'Shelters', path: '/shelters' },
  { key: 'getHelp', label: 'Get Help', path: '/get-help' },
  { key: 'campaigns', label: 'Campaigns', path: '/campaigns' },
  { key: 'contacts', label: 'Contacts', path: '/contacts' },
];

const VOLUNTEER_NAV = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'fieldDashboard', label: 'My Dashboard', path: '/volunteer/dashboard' },
  { key: 'alerts', label: 'Alerts', path: '/alerts' },
  { key: 'shelters', label: 'Shelters', path: '/shelters' },
  { key: 'campaigns', label: 'Campaigns', path: '/campaigns' },
  { key: 'contacts', label: 'Contacts', path: '/contacts' },
];

const ADMIN_NAV = [
  { key: 'admin', label: 'Command Center', path: '/admin/command-center' },
  { key: 'alerts', label: 'Alerts', path: '/alerts' },
  { key: 'shelters', label: 'Shelters', path: '/shelters' },
  { label: 'Warehouse', path: '/admin/warehouse' },
  { label: 'UAV Monitor', path: '/admin/uav' },
  { key: 'contacts', label: 'Contacts', path: '/contacts' },
];

function getNavItems(role: UserRole | undefined) {
  if (role === 'admin') return ADMIN_NAV;
  if (role === 'volunteer' || role === 'fieldworker') return VOLUNTEER_NAV;
  return PUBLIC_NAV;
}

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const navigationItems = getNavItems(isAuthenticated ? user?.role : undefined).map((item) => ({
    ...item,
    label: item.key ? t(item.key) : item.label,
  }));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/command-center';
    if (user?.role === 'volunteer') return '/volunteer/dashboard';
    return '/my-requests';
  };

  return (
    <header className={`header${scrolled ? ' header-scrolled' : ''}`}>
      <div className="container header-container">
        <Link to="/" className="header-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon" aria-hidden="true">
            <Radio size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">SHOHAY</span>
            <span className="brand-sub">সহায়</span>
          </div>
        </Link>

        <nav className={`header-nav${scrolled ? ' nav-centered' : ''}`}>
          {navigationItems.map((item) => (
            <Link key={item.path} to={item.path} className={`nav-link ${isActive(item.path) ? 'active' : ''}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button className="utility-btn utility-lang hide-mobile" onClick={toggleLanguage} aria-label="Toggle language">
            <Globe size={14} />
            <span>{t('banglaBtn')}</span>
          </button>

          {isAuthenticated && user ? (
            <div className="auth-header-pill hide-mobile">
              <Link to={getDashboardPath()} className="utility-btn utility-user" title="Open Dashboard">
                <Shield size={14} />
                <span>{user.role === 'admin' ? 'Coordinator' : user.role === 'volunteer' ? 'Volunteer' : 'Citizen'}: {user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleSignOut} className="utility-btn utility-signout" title={t('signOut')}>
                <LogOut size={12} />
                <span>{t('signOut')}</span>
              </button>
            </div>
          ) : (
            <Link to="/sign-in" className="utility-btn utility-signin hide-mobile">
              <Shield size={14} />
              <span>{t('signIn')}</span>
            </Link>
          )}

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
          {isAuthenticated && user ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link user-highlight"
                style={{ color: '#a7f3d0', fontWeight: 600 }}
              >
                Dashboard ({user.name})
              </Link>
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="nav-link"
                style={{ color: '#fca5a5', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 16px' }}
              >
                {t('signOut')}
              </button>
            </>
          ) : (
            <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)} className="nav-link">
              {t('signIn')}
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
