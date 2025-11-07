import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/api';
import { NavLink } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { motion } from 'framer-motion';

export const RequestResetPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await authService.requestReset(email);
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary to-secondary p-4">
      <motion.div
        className="bg-card p-8 rounded-lg shadow-xl w-full max-w-md"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center text-text mb-6">Request Password Reset</h2>
        {message && <Alert type="success" message={message} className="mb-4" />}
        {error && <Alert type="error" message={error} className="mb-4" />}
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="Enter your registered email"
          />
          <Button type="submit" className="w-full mt-6" loading={loading}>
            Send Reset Link
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Remember your password?{' '}
          <NavLink to="/login" className="text-primary hover:underline font-medium">
            Login
          </NavLink>
        </p>
      </motion.div>
    </div>
  );
};