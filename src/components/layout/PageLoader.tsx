import React from 'react';

export const PageLoader: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', width: '100%' }}>
      <div
        style={{
          width: '42px',
          height: '42px',
          border: '3px solid rgba(13, 148, 136, 0.15)',
          borderTopColor: 'var(--color-primary, #0d9488)',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite'
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
