// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync authentication state from localStorage
  const syncAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    // console.log([token,userData])
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial sync on mount
    syncAuth();

    // Listen for custom login event and storage changes
    window.addEventListener('user-login', syncAuth);
    window.addEventListener('storage', syncAuth);

    return () => {
      window.removeEventListener('user-login', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Notify other tabs/windows of logout
    window.dispatchEvent(new Event('user-login'));
  };

  const value: AuthContextType = {
    user,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
