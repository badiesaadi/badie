import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, NavLink } from 'react-router-dom';
import { UserRole } from '../../constants';
import { Alert } from '../../components/ui/Alert';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      switch (user.role) {
        case UserRole.Client:
        case UserRole.Doctor:
        case UserRole.Admin:
        case UserRole.GeneralAdmin:
          navigate('/dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true }); // Fallback
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ username, password });
      // Redirection handled by useEffect
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
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
        <h2 className="text-3xl font-bold text-center text-text mb-6">Login to NCHP</h2>
        {error && <Alert type="error" message={error} className="mb-4" />}
        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <Input
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full mt-6" loading={loading}>
            Login
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <NavLink to="/register" className="text-primary hover:underline font-medium">
            Register
          </NavLink>
        </p>
        <p className="text-center text-sm text-gray-600 mt-2">
          Forgot your password?{' '}
          <NavLink to="/request-reset" className="text-primary hover:underline font-medium">
            Reset Password
          </NavLink>
        </p>
      </motion.div>
    </div>
  );
};