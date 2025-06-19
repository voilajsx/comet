/**
 * Comet Framework - Login Form Component (Updated for simplified auth)
 * Reusable login form with validation and error handling
 * @module @voilajsx/comet
 * @file src/components/auth/LoginForm.tsx
 */

import React, { useState } from 'react';
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Label } from '@voilajsx/uikit/label';
import { Card, CardContent } from '@voilajsx/uikit/card';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Loader2, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ActionResult from '@/components/ActionResult';

interface LoginFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  title?: string;
  subtitle?: string;
  showCard?: boolean;
  className?: string;
}

/**
 * Login Form Component
 * Handles user authentication with validation and feedback
 */
export default function LoginForm({
  onSuccess,
  onError,
  title = 'Sign In',
  subtitle = 'Enter your credentials to continue',
  showCard = true,
  className = ''
}: LoginFormProps) {
  // Use simplified auth hook
  const { login, isLoading, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loginResult, setLoginResult] = useState<any>(null);

  /**
   * Handle input changes
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear login result when user modifies form
    if (loginResult) {
      setLoginResult(null);
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      errors.password = 'Password must be at least 3 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(formData);
      
      if (result.success && result.user) {
        setLoginResult({ 
          type: 'success', 
          message: 'Login successful!' 
        });
        onSuccess?.(result.user);
      } else {
        const errorMsg = result.error || 'Login failed';
        setLoginResult({ 
          type: 'error', 
          message: errorMsg 
        });
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Login request failed';
      setLoginResult({ 
        type: 'error', 
        message: errorMsg 
      });
      onError?.(errorMsg);
    }
  };

  /**
   * Handle demo login (for testing)
   */
  const handleDemoLogin = () => {
    setFormData({
      email: 'eve.holt@reqres.in',
      password: 'cityslicka'
    });
    setFormErrors({});
    setLoginResult(null);
  };

  const formContent = (
    <div className="space-y-4">
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center space-y-1">
          {title && (
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}

      {/* Login form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </span>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isLoading}
              className={`px-10 ${formErrors.email ? 'border-destructive' : ''}`}
            />
          </div>
          {formErrors.email && (
            <p className="text-xs text-destructive">{formErrors.email}</p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`pl-10 ${formErrors.password ? 'border-destructive' : ''}`}
              disabled={isLoading}
            />
          </div>
          {formErrors.password && (
            <p className="text-xs text-destructive">{formErrors.password}</p>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </>
          )}
        </Button>

        {/* Demo button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleDemoLogin}
          disabled={isLoading}
        >
          Try Demo Login
        </Button>
      </form>

      {/* Login result */}
      <ActionResult 
        result={loginResult}
        onDismiss={() => setLoginResult(null)}
        autoDismiss={loginResult?.type === 'success'}
        autoDismissDelay={2000}
      />

      {/* Auth error */}
      {authError && !loginResult && (
        <Alert variant="destructive">
          <AlertDescription className="text-sm">
            {authError}
          </AlertDescription>
        </Alert>
      )}

      {/* Helper text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Demo credentials: eve.holt@reqres.in / cityslicka
        </p>
      </div>
    </div>
  );

  if (showCard) {
    return (
      <Card className={`w-full max-w-sm mx-auto ${className}`}>
        <CardContent className="p-6">
          {formContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      {formContent}
    </div>
  );
}