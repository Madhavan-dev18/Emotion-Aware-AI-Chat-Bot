import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      // The HTTPOnly cookie is sent automatically by the browser. 
      // If it's valid, this succeeds. If it fails, the catch block runs.
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (err) {
      // If unauthorized, our api.js interceptor handles the cleanup event
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    const handler = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener('auth_change', handler);
    return () => window.removeEventListener('auth_change', handler);
  }, [refreshUser]);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', {
      username: identifier,
      email: identifier,
      password,
    });
    // We only store non-sensitive user metadata now. 
    // Tokens are safely hidden in HTTPOnly cookies.
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      // Tell the backend to destroy the cookies
      await api.post('/auth/logout'); 
    } catch (err) {
      console.error('Logout failed on backend:', err);
    }
    // Clear local state
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const res = await api.patch('/auth/me', payload);
    setUser(res.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}