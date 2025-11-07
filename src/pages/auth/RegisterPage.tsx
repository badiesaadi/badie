import React, { useState } from 'react';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, NavLink } from 'react-router-dom';
import { UserRole } from '../../constants';
import { Alert } from '../../components/ui/Alert';
import { motion } from 'framer-motion';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Client); // Default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ username, email, password, role });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = Object.values(UserRole).map(role => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' '),
  }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary to-secondary p-4">
      <motion.div
        className="bg-card p-8 rounded-lg shadow-xl w-full max-w-md"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center text-text mb-6">Register for NCHP</h2>
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
            label="Email"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Select
            label="Role"
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={roleOptions}
          />
          <Button type="submit" className="w-full mt-6" loading={loading}>
            Register
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <NavLink to="/login" className="text-primary hover:underline font-medium">
            Login
          </NavLink>
        </p>
      </motion.div>
    </div>
  );
};