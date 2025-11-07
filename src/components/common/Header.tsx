import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-card shadow-sm p-4 sm:p-6 lg:p-4 border-b border-gray-200 flex items-center h-16 lg:h-20">
      <h1 className="text-2xl font-semibold text-text ml-14 lg:ml-0">
        {title}
      </h1>
    </header>
  );
};