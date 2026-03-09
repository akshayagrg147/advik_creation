import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface CustomerUser {
  email: string;
  token: string;
}

interface AuthContextType {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  login: (email: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUser(): CustomerUser | null {
  try {
    const saved = localStorage.getItem('customerAuth');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomerUser | null>(getStoredUser);

  const login = (email: string, token: string) => {
    const u = { email, token };
    setUser(u);
    localStorage.setItem('customerAuth', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('customerAuth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
