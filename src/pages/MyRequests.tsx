import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Hand } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import { useMyRequests } from '../hooks/queries';
import { TRACK_STATUS_TEXT } from '../utils/requestStatus';
import './MyRequests.css';

const STATUS_COLOR: Record<string, string> = {
  Pending: '#92400e',
  Verified: '#0369a1',
  Assigned: '#1d4ed8',
  'In Progress': '#7c3aed',
  Resolved: '#059669'
};
const STATUS_BG: Record<string, string> = {
  Pending: '#fffbeb',
  Verified: '#eff6ff',
  Assigned: '#eef2ff',
  'In Progress': '#f5f3ff',
  Resolved: '#ecfdf5'
};

export const MyRequests: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: requests = [], isLoading } = useMyRequests(isAuthenticated);

  return (
    <PageLayout showAlertBanner={false}>
      <div className="myreq-page-bg">
        <div className="myreq-container">
          <div className="myreq-header-row">
            <div>
              <h1 className="myreq-title">My Requests</h1>
              <p className="myreq-subtitle">Every assistance request you've submitted while signed in — no tracking ID needed.</p>
            </div>
            <Link to="/get-help" className="myreq-new-btn"><Hand size={14} /> New Request</Link>
          </div>

          {isLoading ? (
            <div className="skeleton-loading h-40" />
          ) : requests.length === 0 ? (
            <div className="myreq-empty">
              <p>You haven't submitted any requests yet{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.</p>
              <Link to="/get-help" className="myreq-new-btn">Request Assistance</Link>
            </div>
          ) : (
            <div className="myreq-cards-stack">
              {requests.map((r) => (
                <div key={r.trackingId} className="myreq-card">
                  <div className="myreq-card-top">
                    <div>
                      <div className="myreq-tracking-id">{r.trackingId}</div>
                      <div className="myreq-types">{r.types.map((t) => t.replace(/_/g, ' ')).join(', ')}</div>
                    </div>
                    <span
                      className="myreq-status-badge"
                      style={{ color: STATUS_COLOR[r.status] || '#334155', background: STATUS_BG[r.status] || '#f1f5f9' }}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="myreq-meta-row">
                    <span><MapPin size={12} /> {[r.upazila, r.district].filter(Boolean).join(', ') || 'Location on file'}</span>
                    <span><Clock size={12} /> {r.createdAt}</span>
                  </div>
                  <p className="myreq-status-text">{TRACK_STATUS_TEXT[r.status] || r.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
