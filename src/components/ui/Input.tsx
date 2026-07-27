import React from 'react';
import { Search } from 'lucide-react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={inputId}
          className={['input-field', icon ? 'has-icon' : '', error ? 'has-error' : '', className]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export const SearchInput: React.FC<InputProps> = (props) => {
  return <Input icon={<Search size={16} />} placeholder="Search by area or keyword…" {...props} />;
};
