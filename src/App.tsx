import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layouts/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { MedicalRecordsPage } from './pages/MedicalRecordsPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { ReportsPage } from './pages/ReportsPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { ProfilePage } from './pages/ProfilePage';
import { RequestResetPage } from './pages/auth/RequestResetPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

import { UserRole } from './constants';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/request-reset" element={<RequestResetPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={[UserRole.Client, UserRole.Doctor, UserRole.Admin, UserRole.GeneralAdmin]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute allowedRoles={[UserRole.Client, UserRole.Doctor, UserRole.Admin]}>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records"
            element={
              <ProtectedRoute allowedRoles={[UserRole.Client, UserRole.Doctor]}>
                <MedicalRecordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/facilities"
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.GeneralAdmin, UserRole.Client, UserRole.Doctor]}>
                <FacilitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.GeneralAdmin]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={[UserRole.Client, UserRole.Doctor, UserRole.Admin, UserRole.GeneralAdmin]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute allowedRoles={[UserRole.Client, UserRole.Doctor, UserRole.Admin, UserRole.GeneralAdmin]}>
                <HelpCenterPage />
              </ProtectedRoute>
            }
          />

          {/* Default/Catch-all Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;