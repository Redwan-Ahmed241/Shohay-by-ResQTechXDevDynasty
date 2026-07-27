import React from 'react';
import './ProgressBar.css';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  colorVariant?: 'auto' | 'green' | 'orange' | 'red' | 'teal';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  sublabel,
  showPercentage = true,
  colorVariant = 'auto',
  className = ''
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const getColorClass = () => {
    if (colorVariant !== 'auto') return `bar-${colorVariant}`;
    if (clamped >= 90) return 'bar-red';
    if (clamped >= 75) return 'bar-orange';
    return 'bar-green';
  };

  return (
    <div className={`progress-container ${className}`}>
      {(label || showPercentage) && (
        <div className="progress-header">
          <span className="progress-label">{label || sublabel}</span>
          {showPercentage && <span className="progress-percentage">{clamped}%</span>}
        </div>
      )}
      <div className="progress-track">
        <div className={`progress-fill ${getColorClass()}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
};
