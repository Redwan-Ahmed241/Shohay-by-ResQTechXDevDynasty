import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole, phoneOrEmail: string, fullUser?: AuthUser) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  updateProfile: (updated: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('shohay_current_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      id: 'usr-demo',
      name: 'Rahim Uddin',
      first_name: 'Rahim',
      last_name: 'Uddin',
      role: 'public',
      email: 'rahim@shohay.gov.bd'
    };
  });

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('shohay_current_user', JSON.stringify(user));
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem('shohay_current_user');
    }
  }, [user]);

  const login = (role: UserRole, phoneOrEmail: string, fullUser?: AuthUser) => {
    const isEmail = phoneOrEmail.includes('@');
    const newUser: AuthUser = fullUser || {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: isEmail ? phoneOrEmail.split('@')[0] : 'Relief Worker',
      first_name: isEmail ? phoneOrEmail.split('@')[0] : 'Relief',
      last_name: 'Worker',
      role,
      phone: !isEmail ? phoneOrEmail : undefined,
      phone_number: !isEmail ? phoneOrEmail : undefined,
      email: isEmail ? phoneOrEmail : undefined,
      verification_status: 'Verified'
    };

    setUser(newUser);

    // Save to registered users list for instant direct sign-in
    if (newUser.email) {
      try {
        const stored = localStorage.getItem('shohay_registered_users');
        const map = stored ? JSON.parse(stored) : {};
        map[newUser.email.trim().toLowerCase()] = newUser;
        localStorage.setItem('shohay_registered_users', JSON.stringify(map));
      } catch {
        // ignore
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shohay_current_user');
  };

  const setRole = (newRole: UserRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    } else {
      setUser({ id: 'usr-demo', name: 'Demo User', role: newRole });
    }
  };

  const updateProfile = (updated: Partial<AuthUser>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updated };
    setUser(updatedUser);
    if (updatedUser.email) {
      try {
        const stored = localStorage.getItem('shohay_registered_users');
        const map = stored ? JSON.parse(stored) : {};
        map[updatedUser.email.trim().toLowerCase()] = updatedUser;
        localStorage.setItem('shohay_registered_users', JSON.stringify(map));
      } catch {
        // ignore
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'public',
        isAuthenticated: !!user,
        login,
        logout,
        setRole,
        updateProfile
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
