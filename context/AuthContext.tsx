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
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if auth data exists in storage
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
      // Clear session storage
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(USER_DATA_KEY);
    } else {
      sessionStorage.setItem(AUTH_TOKEN_KEY, newToken);
      sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      // Clear local storage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    }
  };

// In your AuthContext.tsx
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

    // Update auth state with verified user
    setUser(data.user);
    setToken(data.token);
    
    // Store in appropriate storage
    if (rememberMe) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } else {
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
    }

    return true;
  } catch (error) {
    console.error('Verification error:', error);
    throw error;
  }
};

// Add to your context value
// This function will be used to verify the user's email after they click the verification link
  const logout = () => {
    setToken(null);
    setUser(null);
    // Clear all storage
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