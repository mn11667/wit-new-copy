import React, { createContext, useEffect, useState } from 'react';
import { SEEDED_USERS } from '../data/users';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING';
  avatarUrl?: string;
  subscription?: any;
  isActive?: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
  showCookieMessage: boolean;
  dismissCookieMessage: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  initialized: false,
  login: async () => {
    return {} as User;
  },
  register: async () => {
    return {} as User;
  },
  logout: async () => { },
  refresh: async () => {
    return null;
  },
  showCookieMessage: false,
  dismissCookieMessage: () => { },
});

// Helper to get user structure
const getUserData = (email: string, name: string): User => ({
  id: `user-${email}`,
  name: name,
  email: email,
  role: 'USER',
  status: 'ACTIVE',
  subscription: {
    status: 'ACTIVE',
    plan: {
      tier: 'PREMIUM'
    }
  }
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showCookieMessage, setShowCookieMessage] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('static_auth');
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('static_auth');
      }
    }
    setInitialized(true);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const foundUser = SEEDED_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (foundUser) {
        const userData = getUserData(foundUser.email, foundUser.name);
        localStorage.setItem('static_auth', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Check credentials even on register for simplicity or just auto-login
    // For static site, we only allow logging in with pre-seeded users
    const foundUser = SEEDED_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const userData = getUserData(foundUser.email, foundUser.name);
      localStorage.setItem('static_auth', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    }
    setLoading(false);
    throw new Error('Registration disabled. Use universal login.');
  };

  const logout = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    localStorage.removeItem('static_auth');
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  const refresh = async () => {
    return user;
  };

  const dismissCookieMessage = () => setShowCookieMessage(false);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, initialized, login, register, logout, refresh, showCookieMessage, dismissCookieMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
};
