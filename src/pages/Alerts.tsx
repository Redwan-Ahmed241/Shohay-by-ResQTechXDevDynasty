import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { alertService } from '../services/alertService';
import { FloodAlert, SeverityLevel } from '../types';
import './Alerts.css';

export const Alerts: React.FC = () => {
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

  const categories: Array<SeverityLevel | 'All'> = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'ALL CLEAR'];

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
            <h1 className="alerts-title">Flood Alerts</h1>
            <span className="active-count-badge">{alerts.length} active</span>
          </div>

          {/* Search Bar */}
          <div className="alerts-search-container">
            <input
              type="text"
              className="alerts-search-input"
              placeholder="Search by area or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Severity Filter Pills */}
          <div className="severity-filters">
            {categories.map((sev) => (
              <button
                key={sev}
                className={`filter-btn ${selectedSeverity === sev ? 'active' : ''}`}
                onClick={() => setSelectedSeverity(sev)}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Alerts List */}
          <div className="alerts-cards-stack">
            {loading ? (
              <div className="skeleton-loading h-40" />
            ) : alerts.length === 0 ? (
              <div className="no-alerts-box">
                <p>No flood alerts found matching your criteria.</p>
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
