import { createContext } from 'react';

export interface AdminUser {
  username: string;
  email: string;
  role: string;
}

export interface AuthContextType {
  user: AdminUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
