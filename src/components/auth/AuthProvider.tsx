/**
 * Comet Framework - Auth Provider with 7-day persistence
 * @module @voilajsx/comet
 * @file src/components/auth/AuthProvider.tsx
 */

import { createContext, useState, useEffect, ReactNode } from 'react';
import { messaging } from '@voilajsx/comet/messaging';
import { storage } from '@voilajsx/comet/storage';

interface User {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  token?: string;
  loginTime?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<{ success: boolean }>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from storage on startup (7-day persistence)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await storage.get('auth.token');
        const timestamp = await storage.get('auth.timestamp');
        const storedUser = await storage.get('auth.userData');

        if (token && timestamp && storedUser) {
          const tokenAge = Date.now() - timestamp;
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

          if (tokenAge < maxAge) {
            setUser(storedUser);
          } else {
            await storage.remove(['auth.token', 'auth.timestamp', 'auth.userData']);
          }
        }
      } catch (error) {
        console.warn('[Auth] Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      // Try content script first, then fallback to direct
      let result;
      try {
        const response = await messaging.sendToContent({ type: 'login', data: credentials });
        result = response?.data;
      } catch {
        // Fallback: Direct API
        const response = await fetch('https://reqres.in/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': 'reqres-free-v1' },
          body: JSON.stringify(credentials),
        });
        const apiResult = await response.json();

        if (response.ok && apiResult.token) {
          result = {
            success: true,
            user: {
              email: credentials.email,
              token: apiResult.token,
              loginTime: Date.now(),
              firstName: 'Demo',
              lastName: 'User',
              name: 'Demo User',
              avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${credentials.email}`
            }
          };
        } else {
          result = { success: false, error: apiResult.error || 'Login failed' };
        }
      }

      if (result?.success && result?.user) {
        setUser(result.user);
        await storage.set({
          'auth.userData': result.user,
          'auth.token': result.user.token,
          'auth.timestamp': Date.now()
        });
        return { success: true, user: result.user };
      } else {
        const errorMsg = result?.error || 'Login failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = 'Login request failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await messaging.sendToContent({ type: 'logout', data: {} });
    } catch {} // Ignore if content script unavailable
    
    setUser(null);
    setError(null);
    await storage.remove(['auth.userData', 'auth.token', 'auth.timestamp']);
    return { success: true };
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
}