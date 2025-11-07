import React from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';
import { User as UserIcon, Mail, Briefcase, Hospital } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" className="text-primary mx-auto mt-10" />;
  }

  if (!user) {
    return <Alert type="error" message="User not authenticated." />;
  }

  return (
    <DashboardLayout title="My Profile">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <Card title="User Information">
          <div className="space-y-4">
            <div className="flex items-center">
              <UserIcon size={20} className="text-primary mr-3" />
              <p className="text-lg font-semibold text-text">Username: <span className="font-normal">{user.username}</span></p>
            </div>
            <div className="flex items-center">
              <Mail size={20} className="text-primary mr-3" />
              <p className="text-lg font-semibold text-text">Email: <span className="font-normal">{user.email}</span></p>
            </div>
            <div className="flex items-center">
              <Briefcase size={20} className="text-primary mr-3" />
              <p className="text-lg font-semibold text-text">Role: <span className="font-normal capitalize">{user.role.replace('_', ' ')}</span></p>
            </div>
            {user.facility_id && (
              <div className="flex items-center">
                <Hospital size={20} className="text-primary mr-3" />
                <p className="text-lg font-semibold text-text">Facility ID: <span className="font-normal">{user.facility_id}</span></p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};
