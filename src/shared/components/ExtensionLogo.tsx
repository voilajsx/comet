/**
 * Extension Logo Component - Customizable brand logo
 * @module @voilajsx/comet
 * @file src/shared/components/ExtensionLogo.tsx
 */

import React from 'react';
import { Zap } from 'lucide-react';

interface ExtensionLogoProps {
  name?: string;
  icon?: React.ComponentType<{ className?: string }>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'compact' | 'minimal';
  showIcon?: boolean;
  showName?: boolean;
  className?: string;
}

/**
 * Flexible extension logo component
 * Handles branding with customizable icon and name
 */
export default function ExtensionLogo({
  name = 'Comet Extension',
  icon: Icon = Zap,
  size = 'md',
  variant = 'default',
  showIcon = true,
  showName = true,
  className = ''
}: ExtensionLogoProps) {
  const sizeClasses = {
    sm: {
      container: 'gap-2',
      icon: 'w-4 h-4',
      iconBox: 'w-6 h-6',
      text: 'text-sm'
    },
    md: {
      container: 'gap-2',
      icon: 'w-4 h-4',
      iconBox: 'w-8 h-8',
      text: 'text-base'
    },
    lg: {
      container: 'gap-3',
      icon: 'w-5 h-5',
      iconBox: 'w-10 h-10',
      text: 'text-lg'
    },
    xl: {
      container: 'gap-3',
      icon: 'w-6 h-6',
      iconBox: 'w-12 h-12',
      text: 'text-xl'
    }
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground rounded-lg',
    compact: 'bg-primary/10 text-primary rounded-md',
    minimal: 'bg-muted text-muted-foreground rounded'
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center ${classes.container} ${className}`}>
      {/* Icon Container */}
      {showIcon && (
        <div className={`flex items-center justify-center ${classes.iconBox} ${variantClasses[variant]}`}>
          <Icon className={classes.icon} />
        </div>
      )}

      {/* Extension Name */}
      {showName && (
        <span className={`font-semibold text-foreground ${classes.text}`}>
          {name}
        </span>
      )}
    </div>
  );
}