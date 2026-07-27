import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import './AlertBanner.css';

export const AlertBanner: React.FC = () => {
  return (
    <div className="alert-banner pulse-critical">
      <div className="container banner-container">
        <div className="banner-content">
          <span className="banner-badge">CRITICAL ALERT</span>
          <AlertTriangle size={14} className="banner-icon" />
          <span className="banner-text">
            <strong>Immediate Evacuation Order:</strong> Extreme Flash Flood Warning — Sunamganj Sadar &amp; Surrounding Areas.
          </span>
        </div>
        <div className="banner-actions">
          <Link to="/alerts" className="banner-btn-secondary">
            View Alert
          </Link>
          <Link to="/get-help" className="banner-btn-primary">
            <span>GET HELP NOW</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};
