import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface NavLinkItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

export const NavLinkItem: React.FC<NavLinkItemProps> = ({ to, icon: Icon, label, onClick }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 rounded-md text-white hover:bg-blue-600 transition-colors duration-200 ${
          isActive ? 'bg-blue-700' : ''
        }`
      }
      onClick={onClick}
    >
      <Icon className="h-5 w-5 mr-3" />
      <span>{label}</span>
    </NavLink>
  );
};