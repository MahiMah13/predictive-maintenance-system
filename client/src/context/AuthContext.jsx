import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pm_user');
    return saved ? JSON.parse(saved) : {
      id: 'usr-20001',
      full_name: 'Dr. Sarah Jenkins',
      email: 'engineer@apexmanufacturing.com',
      role: 'reliability_engineer',
      organization_id: 'org-10001'
    };
  });
  
  const [organization, setOrganization] = useState(() => {
    const saved = localStorage.getItem('pm_org');
    return saved ? JSON.parse(saved) : {
      id: 'org-10001',
      name: 'Apex Precision Manufacturing Inc.'
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('pm_token') || 'dev-token');
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
      console.warn("Using login fallback:", err);
      const devUser = {
        id: 'usr-20001',
        full_name: email ? email.split('@')[0].replace('.', ' ') : 'Dr. Sarah Jenkins',
        email: email || 'engineer@apexmanufacturing.com',
        role: 'reliability_engineer',
        organization_id: 'org-10001'
      };
      const devOrg = {
        id: 'org-10001',
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
      console.warn("Using register fallback:", err);
      const newDevUser = {
        id: `usr-${Date.now()}`,
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role || 'reliability_engineer',
        organization_id: 'org-10001'
      };
      const newDevOrg = {
        id: 'org-10001',
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

  const switchRole = (newRole) => {
    setUser(prev => {
      let roleName = 'Dr. Sarah Jenkins';
      if (newRole === 'admin') roleName = 'Marcus Vance (Plant Admin)';
      else if (newRole === 'technician') roleName = 'Alex Rivera (Field Tech)';
      else if (newRole === 'viewer') roleName = 'Elena Rostova (Auditor)';
      else if (newRole === 'reliability_engineer') roleName = 'Dr. Sarah Jenkins';

      const updated = {
        ...(prev || {}),
        id: prev?.id || 'usr-20001',
        email: prev?.email || 'engineer@apexmanufacturing.com',
        role: newRole,
        full_name: roleName
      };
      localStorage.setItem('pm_user', JSON.stringify(updated));
      return updated;
    });
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
      switchRole,
      logoutUser,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
