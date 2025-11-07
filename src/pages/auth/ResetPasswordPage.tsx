import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/api';
import { NavLink, useSearchParams } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { motion } from 'framer-motion';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!token || !email) {
        setError('Invalid or missing reset token/email.');
        setLoading(false);
        return;
    }

    try {
      const response = await authService.confirmReset({ email, token, new_password: password });
      setMessage(response.data.message + " You can now log in with your new password.");
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The token might be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary to-secondary p-4">
        <motion.div
          className="bg-card p-8 rounded-lg shadow-xl w-full max-w-md text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-text mb-4">Invalid Reset Link</h2>
          <Alert type="error" message="The password reset link is invalid or expired. Please request a new one." />
          <NavLink to="/request-reset" className="block text-primary hover:underline font-medium mt-4">
            Request a New Reset Link
          </NavLink>
          <NavLink to="/login" className="block text-primary hover:underline font-medium mt-2">
            Back to Login
          </NavLink>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary to-secondary p-4">
      <motion.div
        className="bg-card p-8 rounded-lg shadow-xl w-full max-w-md"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center text-text mb-6">Set New Password</h2>
        {message && <Alert type="success" message={message} className="mb-4" />}
        {error && <Alert type="error" message={error} className="mb-4" />}
        <form onSubmit={handleSubmit}>
          <Input
            label="New Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full mt-6" loading={loading}>
            Reset Password
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          <NavLink to="/login" className="text-primary hover:underline font-medium">
            Back to Login
          </NavLink>
        </p>
      </motion.div>
    </div>
  );
};
