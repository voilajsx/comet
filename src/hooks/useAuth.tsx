/**
 * Comet Framework - Auth Hook Only
 * @module @voilajsx/comet
 * @file src/hooks/useAuth.tsx
 */

import { useContext } from 'react';
import { AuthContext } from '@/components/auth/AuthProvider';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useUserDisplayName(): string {
  const { user } = useAuth();
  
  if (!user) return 'Guest';
  if (user.name) return user.name;
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  if (user.email) return user.email.split('@')[0];
  
  return 'User';
}