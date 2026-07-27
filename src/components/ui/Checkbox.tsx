import React from 'react';
import { Check } from 'lucide-react';
import './Checkbox.css';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  icon,
  checked,
  onChange,
  className = '',
  id,
  ...props
}) => {
  const checkboxId = id || `cb-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <label htmlFor={checkboxId} className={`checkbox-container ${className}`}>
      <input
        type="checkbox"
        id={checkboxId}
        checked={checked}
        onChange={onChange}
        className="checkbox-input"
        {...props}
      />
      <span className="checkbox-box">
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      <span className="checkbox-content">
        {icon && <span className="checkbox-icon">{icon}</span>}
        <span className="checkbox-label">{label}</span>
      </span>
    </label>
  );
};
