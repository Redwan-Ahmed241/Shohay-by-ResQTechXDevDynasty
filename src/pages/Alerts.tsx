import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, Plus, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageLayout } from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import { useFlash } from '../hooks/useFlash';
import { useAlerts } from '../hooks/queries';
import { alertService } from '../services/alertService';
import { ApiError } from '../services/api';
import { SeverityLevel } from '../types';
import './CommandCenter.css';
import './Alerts.css';

const EMPTY_ALERT = { severity: 'MEDIUM' as SeverityLevel, type: '', title: '', description: '', affectedAreas: '' };

export const Alerts: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();
  const { notice, flash } = useFlash();

  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_ALERT);
  const [busy, setBusy] = useState(false);

  // Wait until the user pauses typing before updating the value the query key depends on.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: alerts = [], isLoading: loading } = useAlerts(selectedSeverity, debouncedSearchQuery);

  const categories: Array<SeverityLevel | 'All'> = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'ALL CLEAR'];
  const createCategories: SeverityLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'ALL CLEAR'];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await alertService.createAlert({
        severity: form.severity,
        type: form.type.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        affectedAreas: form.affectedAreas.split(',').map((a) => a.trim()).filter(Boolean)
      });
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setShowCreate(false);
      setForm(EMPTY_ALERT);
      flash('ok', 'Alert published.');
    } catch (err) {
      flash('error', err instanceof ApiError ? err.message : 'Could not publish the alert.');
    } finally {
      setBusy(false);
    }
  };

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="active-count-badge">{alerts.length} active</span>
              {isAdmin && (
                <button className="btn-table-action btn-action-assign" onClick={() => setShowCreate(true)} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 6 }}>
                  <Plus size={14} /> New Alert
                </button>
              )}
            </div>
          </div>

          {notice && (
            <div role={notice.kind === 'error' ? 'alert' : 'status'} style={{ padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16, background: notice.kind === 'ok' ? '#ecfdf5' : '#fef2f2', border: `1px solid ${notice.kind === 'ok' ? '#a7f3d0' : '#fecaca'}`, color: notice.kind === 'ok' ? '#065f46' : '#991b1b' }}>
              {notice.text}
            </div>
          )}

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

      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal-box animate-scale-up" role="dialog" aria-modal="true" aria-labelledby="alert-create-title" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 id="alert-create-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Publish a Flood Alert</h3>
              <button onClick={() => setShowCreate(false)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }} htmlFor="a-title">TITLE</label>
                <input id="a-title" className="form-input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Extreme Flash Flood Warning — Sunamganj Sadar" required minLength={5} autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }} htmlFor="a-severity">SEVERITY</label>
                  <select id="a-severity" className="form-input-field" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as SeverityLevel })}>
                    {createCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }} htmlFor="a-type">TYPE</label>
                  <input id="a-type" className="form-input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="e.g. Flash Flood Warning" required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }} htmlFor="a-desc">DESCRIPTION</label>
                <textarea id="a-desc" className="form-input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What's happening and what should people do?" required minLength={10} rows={3} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }} htmlFor="a-areas">AFFECTED AREAS (comma-separated)</label>
                <input id="a-areas" className="form-input-field" value={form.affectedAreas} onChange={(e) => setForm({ ...form, affectedAreas: e.target.value })} placeholder="e.g. Sunamganj Sadar, Tahirpur, Bishwambarpur" required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button type="button" className="btn-outline-subtle" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-navy-primary" disabled={busy}>{busy ? 'Publishing…' : 'Publish Alert'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
