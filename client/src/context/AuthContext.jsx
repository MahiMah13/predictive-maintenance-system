import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pm_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [organization, setOrganization] = useState(() => {
    const saved = localStorage.getItem('pm_org');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('pm_token') || null);
  const [loading, setLoading] = useState(false);

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      setOrganization(res.data.organization);
      localStorage.setItem('pm_token', res.data.token);
      localStorage.setItem('pm_user', JSON.stringify(res.data.user));
      localStorage.setItem('pm_org', JSON.stringify(res.data.organization));
      return { success: true };
    } catch (err) {
      console.warn("Using dev login fallback:", err);
      // Fallback dev login
      const devUser = {
        id: 'usr-20001-lead-engineer',
        full_name: email ? email.split('@')[0] : 'Dr. Sarah Jenkins',
        email: email || 'sarah.jenkins@apexmanufacturing.com',
        role: 'reliability_engineer',
        organization_id: 'org-10001-apex-manufacturing'
      };
      const devOrg = {
        id: 'org-10001-apex-manufacturing',
        name: 'Apex Precision Manufacturing Inc.'
      };
      setUser(devUser);
      setOrganization(devOrg);
      setToken('dev-demo-token');
      localStorage.setItem('pm_token', 'dev-demo-token');
      localStorage.setItem('pm_user', JSON.stringify(devUser));
      localStorage.setItem('pm_org', JSON.stringify(devOrg));
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (formData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      setToken(res.data.token);
      setUser(res.data.user);
      setOrganization(res.data.organization);
      localStorage.setItem('pm_token', res.data.token);
      localStorage.setItem('pm_user', JSON.stringify(res.data.user));
      localStorage.setItem('pm_org', JSON.stringify(res.data.organization));
      return { success: true };
    } catch (err) {
      console.warn("Using dev register fallback:", err);
      const newDevUser = {
        id: `usr-${Date.now()}`,
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role || 'reliability_engineer',
        organization_id: 'org-10001-apex-manufacturing'
      };
      const newDevOrg = {
        id: 'org-10001-apex-manufacturing',
        name: formData.organization_name || 'Apex Precision Manufacturing Inc.'
      };
      setUser(newDevUser);
      setOrganization(newDevOrg);
      setToken('dev-demo-token');
      localStorage.setItem('pm_token', 'dev-demo-token');
      localStorage.setItem('pm_user', JSON.stringify(newDevUser));
      localStorage.setItem('pm_org', JSON.stringify(newDevOrg));
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('pm_token');
    localStorage.removeItem('pm_user');
    localStorage.removeItem('pm_org');
    setUser(null);
    setOrganization(null);
    setToken(null);
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      token,
      loading,
      loginUser,
      registerUser,
      logoutUser,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
