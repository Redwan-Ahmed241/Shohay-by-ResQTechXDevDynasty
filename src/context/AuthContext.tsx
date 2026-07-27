import React, { createContext, useContext, useState } from 'react';
import { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole, phoneOrEmail: string) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>({
    id: 'usr-demo',
    name: 'Demo User',
    role: 'public'
  });

  const login = (role: UserRole, phoneOrEmail: string) => {
    setUser({
      id: `usr-${Date.now()}`,
      name: role === 'admin' ? 'Administrator' : role === 'volunteer' ? 'Field Volunteer' : 'Public User',
      role,
      phone: phoneOrEmail.includes('@') ? undefined : phoneOrEmail,
      email: phoneOrEmail.includes('@') ? phoneOrEmail : undefined
    });
  };

  const logout = () => {
    setUser(null);
  };

  const setRole = (newRole: UserRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    } else {
      setUser({ id: 'usr-demo', name: 'Demo User', role: newRole });
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
