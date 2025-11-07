import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-card shadow-md rounded-lg p-6 ${className}`}>
      {title && <h2 className="text-xl font-semibold text-text mb-4">{title}</h2>}
      {children}
    </div>
  );
};
