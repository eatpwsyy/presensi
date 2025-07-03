'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Student, Admin, UserType } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: (Student | Admin) | null;
  userType: UserType | null;
  loading: boolean;
  login: (token: string, userData: Student | Admin, type: UserType) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(Student | Admin) | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedUserType = localStorage.getItem('userType');

        if (token && storedUser && storedUserType) {
          setUser(JSON.parse(storedUser));
          setUserType(storedUserType as UserType);
          
          // Verify token is still valid
          try {
            await authApi.getProfile();
          } catch (error) {
            // Token is invalid, clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userType');
            setUser(null);
            setUserType(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token: string, userData: Student | Admin, type: UserType) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', type);
    setUser(userData);
    setUserType(type);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    setUser(null);
    setUserType(null);
  };

  const value: AuthContextType = {
    user,
    userType,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}