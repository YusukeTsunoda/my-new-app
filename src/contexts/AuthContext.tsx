'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClientSession, UserProfile } from '@/lib/session';

interface AuthContextType {
  user: Partial<UserProfile> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: Partial<UserProfile>) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Partial<UserProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check client-side session first
      const userData = ClientSession.getUserData();
      if (userData && !ClientSession.isSessionExpired()) {
        setUser(userData);
      } else {
        // Check server-side session
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setUser(data.user);
            ClientSession.setUserData(data.user);
          } else {
            ClientSession.clearUserData();
          }
        } else {
          ClientSession.clearUserData();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      ClientSession.clearUserData();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: Partial<UserProfile>) => {
    setUser(userData);
    ClientSession.setUserData(userData);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      ClientSession.clearUserData();
    }
  };

  const refreshSession = async () => {
    try {
      const response = await fetch('/api/auth/session', { method: 'POST' });
      if (response.ok) {
        await checkAuth();
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}