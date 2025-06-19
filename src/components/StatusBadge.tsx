/**
 * comet Framework - Reusable status badge component
 * Shows extension status with appropriate styling
 * @module @voilajsx/comet
 * @file src/components/StatusBadge.tsx
 */

import React from 'react';
import { Badge } from '@voilajsx/uikit/badge';

interface StatusBadgeProps {
  isEnabled?: boolean;
  isSupported?: boolean;
  customStatus?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  className?: string;
}

/**
 * Extension status badge with automatic status detection
 */
export default function StatusBadge({ 
  isEnabled = true,
  isSupported = true,
  customStatus,
  className = ''
}: StatusBadgeProps) {
  // Use custom status if provided
  if (customStatus) {
    return (
      <Badge variant={customStatus.variant} className={className}>
        {customStatus.text}
      </Badge>
    );
  }

  // Determine status automatically
  const getStatus = () => {
    if (!isEnabled) {
      return { text: 'Disabled', variant: 'secondary' as const };
    }
    
    if (!isSupported) {
      return { text: 'Unavailable', variant: 'outline' as const };
    }
    
    return { text: 'Ready', variant: 'default' as const };
  };

  const status = getStatus();

  return (
    <Badge variant={status.variant} className={className}>
      {status.text}
    </Badge>
  );
}