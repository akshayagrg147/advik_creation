import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext, type AdminUser } from './authContextValue';

function getStoredUser(): AdminUser | null {
  try {
    const saved = localStorage.getItem('adminUser');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(getStoredUser);

  const login = (username: string, password: string): boolean => {
    // Demo authentication - in production, use proper API
    if (username === 'admin' && password === 'admin123') {
      const userData = {
        username: 'admin',
        email: 'admin@advikcreation.com',
        role: 'super-admin',
      };
      setUser(userData);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminUser');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
