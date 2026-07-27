import React from 'react';
import './StatCard.css';

export interface StatCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'critical' | 'warning' | 'success' | 'info';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  sublabel,
  icon,
  variant = 'default',
  className = ''
}) => {
  return (
    <div className={`stat-card stat-${variant} ${className}`}>
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sublabel && <div className="stat-sublabel">{sublabel}</div>}
      </div>
    </div>
  );
};
