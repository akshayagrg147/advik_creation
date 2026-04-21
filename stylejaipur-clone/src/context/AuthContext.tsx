import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext, type CustomerProfile, type CustomerUser } from './authContextValue';

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

  const login = (email: string, token: string, profile?: CustomerProfile) => {
    const u = {
      email,
      token,
      name: profile?.name || undefined,
      photoURL: profile?.photoURL || undefined,
    };
    setUser(u);
    localStorage.setItem('customerAuth', JSON.stringify(u));
  };

  const loginWithPhone = (phone: string, token: string) => {
    const u = { phone, token };
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
        loginWithPhone,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
