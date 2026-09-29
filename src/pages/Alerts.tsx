import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { alertService } from '../services/alertService';
import { FloodAlert, SeverityLevel } from '../types';
import { useLanguage } from '../context/LanguageContext';
import './Alerts.css';

export const Alerts: React.FC = () => {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<FloodAlert[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, [selectedSeverity, searchQuery]);

  const fetchAlerts = async () => {
    setLoading(true);
    const filter = selectedSeverity === 'All' ? undefined : (selectedSeverity as SeverityLevel);
    const res = await alertService.getAlerts(filter, searchQuery);
    setAlerts(res);
    setLoading(false);
  };

  const categories: Array<{ id: SeverityLevel | 'All'; labelKey: string }> = [
    { id: 'All', labelKey: 'filterAll' },
    { id: 'CRITICAL', labelKey: 'sevCritical' },
    { id: 'HIGH', labelKey: 'sevHigh' },
    { id: 'MEDIUM', labelKey: 'sevMedium' },
    { id: 'LOW', labelKey: 'sevLow' },
    { id: 'ALL CLEAR', labelKey: 'sevAllClear' }
  ];

  const getSeverityHeaderClass = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'header-critical';
      case 'HIGH':
        return 'header-high';
      case 'MEDIUM':
        return 'header-medium';
      case 'LOW':
        return 'header-low';
      case 'ALL CLEAR':
        return 'header-allclear';
      default:
        return '';
    }
  };

  return (
    <PageLayout showAlertBanner={false}>
      <div className="alerts-page-bg">
        <div className="alerts-container">
          {/* Header Title + Count */}
          <div className="alerts-header-row">
            <h1 className="alerts-title">{t('floodAlerts')}</h1>
            <span className="active-count-badge">{alerts.length} {t('activeLabel')}</span>
          </div>

          {/* Search Bar */}
          <div className="alerts-search-container">
            <input
              type="text"
              className="alerts-search-input"
              placeholder={t('alertsSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Severity Filter Pills */}
          <div className="severity-filters">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`filter-btn ${selectedSeverity === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedSeverity(cat.id)}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>

          {/* Alerts List */}
          <div className="alerts-cards-stack">
            {loading ? (
              <div className="skeleton-loading h-40" />
            ) : alerts.length === 0 ? (
              <div className="no-alerts-box">
                <p>{t('noAlertsFound')}</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="alert-figma-card">
                  {/* Alert Header Banner matching Figma */}
                  <div className={`alert-card-banner ${getSeverityHeaderClass(alert.severity)}`}>
                    <span className="banner-severity">{alert.severity}</span>
                    <span className="banner-type">{alert.type}</span>
                  </div>

                  {/* Alert Card Body */}
                  <div className="alert-card-body">
                    <div className="alert-card-top-info">
                      <h3 className="alert-card-title">{alert.title}</h3>
                      <span className={`verification-badge ${alert.verificationStatus === 'Partner Verified' ? 'partner' : 'gov'}`}>
                        {alert.verificationStatus}
                      </span>
                    </div>

                    <p className="alert-card-desc">{alert.description}</p>

                    {/* Affected Areas Tags */}
                    <div className="affected-areas-tags">
                      {alert.affectedAreas.map((area) => (
                        <span key={area} className="area-tag">
                          {area}
                        </span>
                      ))}
                    </div>

                    {/* Footer Timestamp */}
                    <div className="alert-card-timestamp">
                      <Clock size={12} className="clock-icon" />
                      <span>{alert.issuedAt}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
