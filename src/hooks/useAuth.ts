import { useContext } from 'react';
import { AuthContext } from '../core/auth/authContext';
import type { AuthContextType } from '../core/auth/authContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { UserProfile, AuthSession, AuthMode, AuthMethod } from '../types/auth';
