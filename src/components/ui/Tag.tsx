import React from 'react';
import './Tag.css';

export interface TagProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'teal';
  size?: 'sm' | 'md';
}

export const Tag: React.FC<TagProps> = ({
  children,
  active = false,
  onClick,
  variant = 'default',
  size = 'md'
}) => {
  const classes = [
    'tag',
    `tag-${variant}`,
    `tag-${size}`,
    active ? 'tag-active' : '',
    onClick ? 'tag-clickable' : ''
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} onClick={onClick}>
      {children}
    </span>
  );
};
