/**
 * comet Framework - Reusable action result component
 * Displays success/error messages with auto-dismiss functionality
 * @module @voilajsx/comet
 * @file src/components/ActionResult.tsx
 */

import React, { useEffect } from 'react';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Button } from '@voilajsx/uikit/button';

interface ActionResultProps {
  result?: {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    details?: string;
  } | null;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  showDismissButton?: boolean;
  className?: string;
}

/**
 * Action result component with customizable styling and auto-dismiss
 */
export default function ActionResult({ 
  result,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 3000,
  showDismissButton = false,
  className = ''
}: ActionResultProps) {
  // Auto-dismiss functionality
  useEffect(() => {
    if (result && autoDismiss && onDismiss) {
      const timer = setTimeout(onDismiss, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [result, autoDismiss, autoDismissDelay, onDismiss]);

  if (!result) return null;

  // Get appropriate icon and variant for each type
  const getAlertConfig = () => {
    switch (result.type) {
      case 'success':
        return {
          icon: CheckCircle,
          variant: 'default' as const,
          iconColor: 'text-green-500'
        };
      case 'error':
        return {
          icon: AlertCircle,
          variant: 'destructive' as const,
          iconColor: 'text-destructive'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          variant: 'default' as const,
          iconColor: 'text-yellow-500'
        };
      case 'info':
        return {
          icon: Info,
          variant: 'default' as const,
          iconColor: 'text-blue-500'
        };
      default:
        return {
          icon: Info,
          variant: 'default' as const,
          iconColor: 'text-muted-foreground'
        };
    }
  };

  const { icon: Icon, variant, iconColor } = getAlertConfig();

  return (
    <Alert 
      variant={variant}
      className={`border-border ${className}`}
    >
      <Icon className={`h-4 w-4 ${iconColor}`} />
      
      <div className="flex-1">
        <AlertDescription className="text-sm pt-1">
          {result.message}
          {result.details && (
            <div className="text-xs text-muted-foreground mt-1 pt-1">
              {result.details}
            </div>
          )}
        </AlertDescription>
      </div>
      
      {/* Dismiss button */}
      {showDismissButton && onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 ml-2"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Alert>
  );
}