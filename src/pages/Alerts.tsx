import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/Input';
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

  return (
    <PageLayout showAlertBanner={false}>
      <div className="container alerts-page">
        {/* Header Title + Count */}
        <div className="alerts-page-header flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1>Flood Alerts</h1>
            <span className="active-count-badge">{alerts.length} active</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="alerts-search-wrapper mt-4">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Severity Filter Pills */}
        <div className="severity-filters flex gap-2 flex-wrap mt-4">
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
        <div className="alerts-list flex flex-col gap-4 mt-6">
          {loading ? (
            <div className="skeleton-loading h-40" />
          ) : alerts.length === 0 ? (
            <Card className="text-center py-8">
              <p>No flood alerts found matching your criteria.</p>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className="alert-item-card">
                {/* Alert Top Strip */}
                <div className="alert-top-bar flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.severity}>{alert.severity}</Badge>
                  </div>
                  <span className="alert-type-label">{alert.type}</span>
                </div>

                {/* Main Content */}
                <div className="alert-content">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="alert-title">{alert.title}</h3>
                    <span className="verification-badge">
                      <CheckCircle size={12} />
                      {alert.verificationStatus}
                    </span>
                  </div>

                  <p className="alert-desc">{alert.description}</p>

                  {/* Affected Areas Tags */}
                  <div className="affected-areas flex gap-2 flex-wrap mt-3">
                    {alert.affectedAreas.map((area) => (
                      <span key={area} className="area-tag">
                        {area}
                      </span>
                    ))}
                  </div>

                  {/* Footer Timestamp */}
                  <div className="alert-timestamp flex items-center gap-1 mt-4">
                    <Clock size={12} />
                    <span>{alert.issuedAt}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
};
