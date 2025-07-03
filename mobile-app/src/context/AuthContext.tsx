import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../services/api';

interface User {
  id: number;
  student_id: string;
  name: string;
  email: string;
  class: string;
  grade: string;
  phone_number?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (studentId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        // Set token in API client
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token by getting user profile
        const response = await apiClient.get('/student/profile');
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Token is invalid, clear it
      await SecureStore.deleteItemAsync('authToken');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (studentId: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/student/login', {
        student_id: studentId,
        password: password,
      });

      const { token, user: userData } = response.data;
      
      // Store token securely
      await SecureStore.setItemAsync('authToken', token);
      
      // Set token in API client
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Remove token from storage
      await SecureStore.deleteItemAsync('authToken');
      
      // Clear API client authorization
      delete apiClient.defaults.headers.common['Authorization'];
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      login,
      logout,
    }}>
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