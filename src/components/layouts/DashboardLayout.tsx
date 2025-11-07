import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from '../common/Header';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col lg:ml-64"> {/* Adjust for sidebar width on desktop */}
        <Header title={title} />
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
