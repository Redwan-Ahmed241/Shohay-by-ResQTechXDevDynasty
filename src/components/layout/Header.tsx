import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, Radio, Shield, X, LogOut, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const navConfig = [
  { key: 'home', path: '/' },
  { key: 'alerts', path: '/alerts' },
  { key: 'shelters', path: '/shelters' },
  { key: 'getHelp', path: '/get-help' },
  { key: 'campaigns', path: '/campaigns' },
  { key: 'contacts', path: '/contacts' },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const { t, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = navConfig.map((item) => ({
    label: t(item.key),
    path: item.path,
  }));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const displayName = user ? (user.first_name || user.name || (user.email ? user.email.split('@')[0] : 'User')) : '';

  return (
    <header className={`header${scrolled ? ' header-scrolled' : ''}`}>
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

        <nav className={`header-nav${scrolled ? ' nav-centered' : ''}`}>
          {navigationItems.map((item) => (
            <Link key={item.path} to={item.path} className={`nav-link ${isActive(item.path) ? 'active' : ''}`}>
              {item.label}
            </Link>
          ))}
          {user?.role === 'fieldworker' && (
            <Link to="/volunteer/dashboard" className={`nav-link ${isActive('/volunteer/dashboard') ? 'active' : ''}`}>
              {t('fieldDashboard')}
            </Link>
          )}
        </nav>

        <div className="header-actions">
          <button className="utility-btn utility-lang hide-mobile" onClick={toggleLanguage} aria-label="Toggle language">
            <Globe size={14} />
            <span>{t('banglaBtn')}</span>
          </button>

          {user ? (
            <div className="user-auth-badge hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  background: 'rgba(255, 255, 255, 0.08)', 
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  padding: '3px 8px 3px 4px', 
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  color: '#ffffff'
                }}
              >
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={displayName} 
                    style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={12} color="#ffffff" />
                  </div>
                )}
                <span style={{ fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </span>
                <span 
                  style={{ 
                    fontSize: '9px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em', 
                    padding: '1px 5px', 
                    borderRadius: '3px',
                    background: user.role === 'fieldworker' ? '#0284c7' : '#059669',
                    color: '#ffffff',
                    fontWeight: 700
                  }}
                >
                  {user.role === 'fieldworker' ? 'FIELD' : 'PUBLIC'}
                </span>
              </div>

              <button 
                onClick={logout} 
                className="utility-btn" 
                title={t('signOut')}
                style={{ padding: '0 8px', color: '#fda4af', borderColor: 'rgba(244,63,94,0.3)' }}
              >
                <LogOut size={13} />
                <span>{t('exit')}</span>
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
          {user ? (
            <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: '13px' }}>{t('signedInAs')} <strong>{displayName}</strong> ({user.role})</span>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ background: '#e11d48', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                {t('signOut')}
              </button>
            </div>
          ) : (
            <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)} style={{ color: '#38bdf8', fontWeight: 600 }}>
              {t('signIn')}
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
