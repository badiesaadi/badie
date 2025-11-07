import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Clipboard,
  Hospital,
  BarChart,
  HelpCircle,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../constants';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarLink {
  to: string;
  icon: React.ElementType;
  label: string;
  roles: UserRole[];
}

const sidebarLinks: SidebarLink[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: [UserRole.Client, UserRole.Doctor, UserRole.Admin, UserRole.GeneralAdmin] },
  { to: '/appointments', icon: Calendar, label: 'Appointments', roles: [UserRole.Client, UserRole.Doctor, UserRole.Admin] },
  { to: '/records', icon: Clipboard, label: 'Medical Records', roles: [UserRole.Client, UserRole.Doctor] },
  { to: '/facilities', icon: Hospital, label: 'Facilities', roles: [UserRole.Admin, UserRole.GeneralAdmin] },
  { to: '/reports', icon: BarChart, label: 'Reports', roles: [UserRole.Admin, UserRole.GeneralAdmin] },
  { to: '/profile', icon: User, label: 'Profile', roles: [UserRole.Client, UserRole.Doctor, UserRole.Admin, UserRole.GeneralAdmin] }, // Added a profile page for demonstration
  { to: '/help', icon: HelpCircle, label: 'Help Center', roles: [UserRole.Client, UserRole.Doctor, UserRole.Admin, UserRole.GeneralAdmin] },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const filteredLinks = sidebarLinks.filter(link => user && link.roles.includes(user.role));

  const sidebarVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: { x: '0%', opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  };

  const renderLinks = () => (
    <>
      <div className="p-4 border-b border-blue-700">
        <h1 className="text-2xl font-bold text-white">NCHP</h1>
        {user && (
          <p className="text-sm text-blue-200 mt-2">
            Welcome, {user.username} ({user.role})
          </p>
        )}
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {filteredLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-white hover:bg-blue-600 transition-colors duration-200 ${
                isActive ? 'bg-blue-700' : ''
              }`
            }
            onClick={() => setIsOpen(false)} // Close sidebar on link click
          >
            <link.icon className="h-5 w-5 mr-3" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-700">
        <Button
          variant="ghost"
          className="w-full text-white justify-start hover:bg-blue-600"
          icon={LogOut}
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 z-40 p-4">
        <Button variant="ghost" onClick={toggleSidebar} className="text-primary hover:text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary min-h-screen sticky top-0 left-0 z-20 shadow-lg">
        {renderLinks()}
      </aside>

      {/* Sidebar for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="fixed inset-y-0 left-0 w-64 bg-primary flex flex-col z-40 shadow-xl lg:hidden"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sidebarVariants}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {renderLinks()}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};