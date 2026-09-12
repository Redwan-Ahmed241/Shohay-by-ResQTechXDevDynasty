import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import { authService } from '../services/authService';
import { TOKEN_STORAGE_KEY } from '../services/api';

const AUTH_STORAGE_KEY = 'shohay_auth_user';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole, phoneOrEmail: string, customName?: string) => Promise<AuthUser>;
  register: (data: {
    firstName: string;
    lastName: string;
    mobile?: string;
    email: string;
    skills?: string[];
    equipment?: string[];
    gender?: string;
  }) => Promise<AuthUser>;
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

  const login = async (role: UserRole, phoneOrEmail: string, customName?: string): Promise<AuthUser> => {
    const result = await authService.login(phoneOrEmail, role, customName);
    setUser(result.user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.user));
    } catch {
      // ignore
    }
    return result.user;
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    mobile?: string;
    email: string;
    skills?: string[];
    equipment?: string[];
    gender?: string;
  }): Promise<AuthUser> => {
    const result = await authService.registerPublic(data);
    setUser(result.user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.user));
    } catch {
      // ignore
    }
    return result.user;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const setRole = (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    } else {
      login(newRole, '01712345678');
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'public',
        isAuthenticated,
        login,
        register,
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
