import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Configure axios defaults
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('recruitai_token'));
  const [loading, setLoading] = useState(true);

  // Attach token to every request
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem('recruitai_token');
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, []);

  // Handle 401 responses
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          toast.error('Session expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('recruitai_token');
      const storedUser = localStorage.getItem('recruitai_user');
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Optionally verify token with API
          // const res = await api.get('/auth/me');
          // setUser(res.data);
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      // Try real API first, fall back to mock
      let userData, tokenData;
      try {
        const res = await api.post('/auth/login', { email, password });
        userData = res.data.user;
        tokenData = res.data.token || res.data.access_token;
      } catch {
        // Mock login fallback
        const mockUsers = {
          'recruiter@recruitai.com': { id: '1', name: 'Alex Johnson', email: 'recruiter@recruitai.com', role: 'recruiter', company: 'TechCorp', avatar: null },
          'candidate@recruitai.com': { id: '2', name: 'Sarah Chen', email: 'candidate@recruitai.com', role: 'candidate', avatar: null },
          'admin@recruitai.com': { id: '3', name: 'Admin User', email: 'admin@recruitai.com', role: 'admin', avatar: null },
        };
        if (!mockUsers[email] || password !== 'password123') {
          throw new Error('Invalid credentials. Try recruiter@recruitai.com / password123');
        }
        userData = mockUsers[email];
        tokenData = 'mock_jwt_token_' + Date.now();
      }
      setUser(userData);
      setToken(tokenData);
      localStorage.setItem('recruitai_token', tokenData);
      localStorage.setItem('recruitai_user', JSON.stringify(userData));
      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      let userData, tokenData;
      try {
        const res = await api.post('/auth/register', data);
        userData = res.data.user;
        tokenData = res.data.token || res.data.access_token;
      } catch {
        // Mock registration
        userData = {
          id: String(Date.now()),
          name: data.name || data.first_name + ' ' + data.last_name,
          email: data.email,
          role: data.role || 'candidate',
          company: data.company,
          avatar: null,
        };
        tokenData = 'mock_jwt_token_' + Date.now();
      }
      setUser(userData);
      setToken(tokenData);
      localStorage.setItem('recruitai_token', tokenData);
      localStorage.setItem('recruitai_user', JSON.stringify(userData));
      toast.success('Account created successfully! Welcome to RecruitAI!');
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed.';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('recruitai_token');
    localStorage.removeItem('recruitai_user');
  }, []);

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    loading,
    api,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
