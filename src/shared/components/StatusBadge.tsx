/**
 * Status Badge Component - Extension status indicator
 * @module @voilajsx/comet
 * @file src/shared/components/StatusBadge.tsx
 */

import React from 'react';
import { Badge } from '@voilajsx/uikit/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  isEnabled?: boolean;
  isSupported?: boolean;
  isLoading?: boolean;
  status?: 'active' | 'inactive' | 'error' | 'loading' | 'unsupported';
  customStatus?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon?: React.ComponentType<{ className?: string }>;
  };
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Extension status badge with automatic status detection
 * Shows current extension state with appropriate styling
 */
export default function StatusBadge({
  isEnabled = true,
  isSupported = true,
  isLoading = false,
  status,
  customStatus,
  showIcon = true,
  size = 'md',
  className = ''
}: StatusBadgeProps) {
  // Use custom status if provided
  if (customStatus) {
    const CustomIcon = customStatus.icon;
    
    return (
      <Badge variant={customStatus.variant} className={className}>
        {showIcon && CustomIcon && <CustomIcon className="w-3 h-3 mr-1" />}
        {customStatus.text}
      </Badge>
    );
  }

  // Determine status automatically if not explicitly provided
  const getStatus = () => {
    if (status) return status;
    
    if (isLoading) return 'loading';
    if (!isSupported) return 'unsupported';
    if (!isEnabled) return 'inactive';
    return 'active';
  };

  const currentStatus = getStatus();

  // Status configuration
  const statusConfig = {
    active: {
      text: 'Active',
      variant: 'default' as const,
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    inactive: {
      text: 'Inactive',
      variant: 'secondary' as const,
      icon: XCircle,
      iconColor: 'text-muted-foreground'
    },
    error: {
      text: 'Error',
      variant: 'destructive' as const,
      icon: AlertCircle,
      iconColor: 'text-destructive'
    },
    loading: {
      text: 'Loading',
      variant: 'outline' as const,
      icon: Loader2,
      iconColor: 'text-muted-foreground'
    },
    unsupported: {
      text: 'Unavailable',
      variant: 'outline' as const,
      icon: AlertCircle,
      iconColor: 'text-muted-foreground'
    }
  };

  const config = statusConfig[currentStatus];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1'
  };

  return (
    <Badge 
      variant={config.variant} 
      className={`${sizeClasses[size]} ${className}`}
    >
      {showIcon && (
        <Icon 
          className={`w-3 h-3 mr-1 ${config.iconColor} ${
            currentStatus === 'loading' ? 'animate-spin' : ''
          }`} 
        />
      )}
      {config.text}
    </Badge>
  );
}