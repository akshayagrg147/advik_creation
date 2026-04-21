import { createContext } from 'react';

export interface CustomerUser {
  name?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  token: string;
}

export type CustomerProfile = {
  name?: string | null;
  photoURL?: string | null;
};

export interface AuthContextType {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  login: (email: string, token: string, profile?: CustomerProfile) => void;
  loginWithPhone: (phone: string, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
