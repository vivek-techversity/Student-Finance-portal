import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);         // { username }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);     // page refresh pe verify chalega

  // Page refresh pe token verify karo
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/api/auth/verify');
      if (data.success) {
        setAdmin(data.admin);
        setIsAuthenticated(true);
      }
    } catch {
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login → POST /api/auth/login
  const login = async (username, password) => {
    const { data } = await api.post('/api/auth/login', { username, password });
    if (data.success) {
      setAdmin(data.admin);
      setIsAuthenticated(true);
    }
    return data;
  };

  // Logout → cookie 7 din mein expire hogi,
  // lekin UI se turant hatao
  // NOTE: Backend mein /api/auth/logout route add karo jo res.clearCookie('token') kare
  const logout = async () => {
    try {
      await api.post('/api/auth/logout'); // optional — backend mein add karna hoga
    } catch {
      // ignore if route doesn't exist yet
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}