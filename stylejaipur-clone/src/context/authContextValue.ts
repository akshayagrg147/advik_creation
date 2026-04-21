import { createContext } from 'react';

export interface CustomerUser {
  email: string;
  token: string;
}

export interface AuthContextType {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  login: (email: string, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
