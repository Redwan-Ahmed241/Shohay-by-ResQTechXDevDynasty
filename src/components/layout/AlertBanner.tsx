import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './AlertBanner.css';

export const AlertBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="alert-banner pulse-critical">
      <div className="container banner-container">
        <div className="banner-content">
          <span className="banner-badge">{t('alertBannerCritical')}</span>
          <AlertTriangle size={14} className="banner-icon" />
          <span className="banner-text">
            <strong>{t('alertBannerEvacOrder')}</strong> {t('alertBannerWarningDetail')}
          </span>
        </div>
        <div className="banner-actions">
          <Link to="/alerts" className="banner-btn-secondary">
            {t('alertBannerViewAlert')}
          </Link>
          <Link to="/get-help" className="banner-btn-primary">
            <span>{t('alertBannerGetHelpNow')}</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};
