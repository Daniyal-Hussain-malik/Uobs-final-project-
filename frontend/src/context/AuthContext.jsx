import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('oasis_token'));
  const [loading, setLoading] = useState(true);

  // Initialize and check current token
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.success) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      localStorage.setItem('oasis_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.success) {
      localStorage.setItem('oasis_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const quickLogin = async (role) => {
    const res = await api.get(`/auth/quick-login/${role}`);
    if (res.success) {
      localStorage.setItem('oasis_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('oasis_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    quickLogin,
    logout,
    isAdmin: user?.role === 'admin',
    isReception: user?.role === 'reception',
    isGuest: user?.role === 'guest',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
