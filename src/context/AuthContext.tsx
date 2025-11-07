import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/api';
import { API_BASE_URL } from '../constants'; // Import for error handling feedback

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const storeAuthData = useCallback((token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    setIsAuthenticated(true);
  }, []);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const getProfile = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setLoading(true);
      try {
        const profile = await authService.getProfile();
        // Assume the API only returns the User object on success
        setToken(storedToken);
        setUser(profile);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to fetch profile or token invalid:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [clearAuthData]);

  useEffect(() => {
    getProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials: any) => {
    try {
      const response: AuthResponse = (await authService.login(credentials)).data;
      storeAuthData(response.token, response.user);
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Login failed. Please check your credentials.');
      } else if (error.request) {
        throw new Error(`No response from server. Is the backend running at ${API_BASE_URL}?`);
      } else {
        throw new Error('An unexpected error occurred during login.');
      }
    }
  };

  const register = async (userData: any) => {
    try {
      const response: AuthResponse = (await authService.register(userData)).data;
      storeAuthData(response.token, response.user);
    } catch (error: any) {
      console.error('Registration failed:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Registration failed.');
      } else if (error.request) {
        throw new Error(`No response from server. Is the backend running at ${API_BASE_URL}?`);
      } else {
        throw new Error('An unexpected error occurred during registration.');
      }
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API call fails, clear local data for UX
    } finally {
      clearAuthData();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        getProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};