import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';

const AUTH_STORAGE_KEY = 'shohay_auth_user';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole, phoneOrEmail: string, customName?: string) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) return parsed;
      }
    } catch {
      // fallback
    }
    return null;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [user]);

  const login = (role: UserRole, phoneOrEmail: string, customName?: string) => {
    const isEmail = phoneOrEmail.includes('@');
    const defaultName =
      customName ||
      (role === 'admin'
        ? 'District Coordinator'
        : role === 'volunteer'
        ? 'Field Volunteer'
        : 'Public Citizen');

    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: defaultName,
      role,
      phone: isEmail ? undefined : phoneOrEmail,
      email: isEmail ? phoneOrEmail : undefined
    };

    setUser(newUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const setRole = (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
    } else {
      login(newRole, '01712345678');
    }
  };

  const isAuthenticated = !!user && user.role !== 'public';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'public',
        isAuthenticated,
        login,
        logout,
        setRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
