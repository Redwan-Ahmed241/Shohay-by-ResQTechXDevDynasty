import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AuthUser, UserRole } from '../types';
import { authService, AuthMethod, SignUpMetadata, VolunteerSignupData } from '../services/authService';
import { supabase } from '../services/supabaseClient';

const AUTH_STORAGE_KEY = 'shohay_auth_user';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  /** True until the saved Supabase session has been checked on page load. */
  isLoading: boolean;
  sendCode: (method: AuthMethod, identifier: string, metadata?: SignUpMetadata) => Promise<void>;
  verifyCode: (method: AuthMethod, identifier: string, code: string) => Promise<AuthUser>;
  registerVolunteer: (data: VolunteerSignupData) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Cached profile so pages render instantly; replaced once the Supabase session is checked.
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
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(supabase));
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
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

  // One in-flight /me request shared by sign-in events and verifyCode.
  const profileRequest = useRef<Promise<AuthUser> | null>(null);
  const loadProfile = useCallback((): Promise<AuthUser> => {
    if (!profileRequest.current) {
      profileRequest.current = authService
        .getMe()
        .then((u) => {
          setUser(u);
          return u;
        })
        .finally(() => {
          profileRequest.current = null;
        });
    }
    return profileRequest.current;
  }, []);

  useEffect(() => {
    if (!supabase) {
      setUser(null);
      return;
    }

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      // Restore on page load, or pick up a session from an emailed sign-in link.
      const needsProfile = event === 'INITIAL_SESSION' || (event === 'SIGNED_IN' && !userRef.current);
      if (!needsProfile) return;

      // Deferred: calling Supabase from inside this callback (apiFetch reads the session) can deadlock.
      setTimeout(() => {
        loadProfile()
          .catch((err) => console.warn('Could not load Shohay profile for this session:', err))
          .finally(() => setIsLoading(false));
      }, 0);
    });

    return () => data.subscription.unsubscribe();
  }, [loadProfile]);

  const sendCode = (method: AuthMethod, identifier: string, metadata?: SignUpMetadata) =>
    authService.sendCode(method, identifier, metadata);

  const verifyCode = async (method: AuthMethod, identifier: string, code: string): Promise<AuthUser> => {
    await authService.verifyCode(method, identifier, code);
    return loadProfile();
  };

  const registerVolunteer = async (data: VolunteerSignupData): Promise<AuthUser> => {
    const updated = await authService.registerVolunteer(data);
    setUser(updated);
    return updated;
  };

  const logout = async () => {
    setUser(null);
    try {
      await authService.signOut();
    } catch (err) {
      console.warn('Supabase sign-out failed:', err);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'public',
        isAuthenticated,
        isLoading,
        sendCode,
        verifyCode,
        registerVolunteer,
        logout
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
