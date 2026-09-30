import React from 'react';
import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './Footer.css';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

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
                <div className="logo-title">SHOHAY / সহায়</div>
                <div className="logo-sub">{t('subTitle')}</div>
              </div>
            </div>
            <p className="footer-desc">
              {t('footerDesc')}
            </p>
          </div>

          {/* Col 2: Public Services */}
          <div className="footer-links-col">
            <h4 className="footer-heading">{t('publicServices')}</h4>
            <ul className="footer-links">
              <li><Link to="/alerts">{t('floodAlerts')}</Link></li>
              <li><Link to="/shelters">{t('findShelter')}</Link></li>
              <li><Link to="/get-help">{t('requestAssistance')}</Link></li>
              <li><Link to="/alerts">{t('reportHazard')}</Link></li>
              <li><Link to="/contacts">{t('emergencyContacts')}</Link></li>
            </ul>
          </div>

          {/* Col 3: Platform */}
          <div className="footer-links-col">
            <h4 className="footer-heading">{t('platformHeading')}</h4>
            <ul className="footer-links">
              <li><Link to="/">{t('trackRequest')}</Link></li>
              <li><Link to="/campaigns">{t('campaignsDonations')}</Link></li>
              <li><Link to="/volunteer">{t('volunteer')}</Link></li>
              <li><Link to="/contacts">{t('feedback')}</Link></li>
              <li><Link to="/sign-in">{t('staffLogin')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Disclaimer */}
        <div className="footer-bottom">
          <span>{t('footerDisclaimer1')}</span>
          <span>{t('footerDisclaimer2')}</span>
        </div>
      </div>
    </footer>
  );
};
