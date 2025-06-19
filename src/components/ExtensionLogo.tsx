/**
 * comet Framework - Reusable extension logo component
 * Customizable logo for extension interfaces
 * @module @voilajsx/comet
 * @file src/components/ExtensionLogo.tsx
 */

import React from 'react';
import { Zap } from 'lucide-react';

interface ExtensionLogoProps {
  name?: string;
  icon?: React.ComponentType<{ className?: string }>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Extension logo component with customizable icon and name
 */
export default function ExtensionLogo({ 
  name = 'comet Extension',
  icon: Icon = Zap,
  size = 'md',
  className = ''
}: ExtensionLogoProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };
  const textsizeClasses = {
    sm: 'text-sm',
    md: 'text-md', 
    lg: 'text-lg'
  };
  const iconSizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center justify-center ${sizeClasses[size]} bg-primary rounded`}>
        <Icon className={`${iconSizeClasses[size]} text-primary-foreground`} />
      </div>
      <span className={`${textsizeClasses[size]} font-medium text-foreground`}>{name}</span>
    </div>
  );
}