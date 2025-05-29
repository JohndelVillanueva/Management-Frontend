import React, { createContext, useContext, useState, useEffect } from 'react';

// Constants for storage keys
const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'user';

type User = {
  id: string;
  username: string;
  email: string;
  user_type: 'ADMIN' | 'HEAD' | 'STAFF';
  is_verified?: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User, rememberMe: boolean) => void;
  logout: () => void;
  verifyEmail: (verificationToken: string, rememberMe: boolean) => Promise<boolean>;
  resendVerification: (userId: string) => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Initialize from storage
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_DATA_KEY) || sessionStorage.getItem(USER_DATA_KEY);
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (newToken: string, userData: User, rememberMe: boolean) => {
    setToken(newToken);
    setUser(userData);
    
    if (rememberMe) {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(USER_DATA_KEY);
    } else {
      sessionStorage.setItem(AUTH_TOKEN_KEY, newToken);
      sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    }
  };

  const verifyEmail = async (verificationToken: string, rememberMe: boolean) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Update state and storage
      setUser(data.user);
      setToken(data.token);
      
      if (rememberMe) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
      } else {
        sessionStorage.setItem(AUTH_TOKEN_KEY, data.token);
        sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
      }

      return true;
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  };

  const resendVerification = async (userId: string) => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification');
      }

      return data;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(USER_DATA_KEY);
  };

  const value = {
    user,
    token,
    login,
    logout,
    verifyEmail,
    resendVerification,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};