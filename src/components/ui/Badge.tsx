import React from 'react';
import { SeverityLevel, ShelterStatus, RouteStatus, VerificationStatus } from '../../types';
import './Badge.css';

export type BadgeVariant =
  | SeverityLevel
  | ShelterStatus
  | RouteStatus
  | VerificationStatus
  | 'Govt Verified'
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface BadgeProps {
  variant?: BadgeVariant;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', pulse = false, children, className = '' }) => {
  const getVariantClass = (v: BadgeVariant) => {
    switch (v) {
      case 'CRITICAL':
      case 'Full':
      case 'Blocked':
        return 'badge-critical';
      case 'HIGH':
      case 'Nearly Full':
      case 'Caution':
        return 'badge-high';
      case 'MEDIUM':
      case 'Partner Verified':
        return 'badge-medium';
      case 'LOW':
      case 'Route OK':
      case 'Open':
      case 'Government Verified':
      case 'Govt Verified':
      case 'success':
        return 'badge-low';
      case 'ALL CLEAR':
      case 'Unverified':
        return 'badge-allclear';
      default:
        return 'badge-default';
    }
  };

  const classes = [
    'badge',
    getVariantClass(variant),
    pulse ? 'badge-pulse' : '',
    className
  ].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
};
