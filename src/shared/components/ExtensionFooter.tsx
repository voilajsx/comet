/**
 * Extension Footer Component - Flexible footer with content slots
 * @module @voilajsx/comet
 * @file src/shared/components/ExtensionFooter.tsx
 */

import React from 'react';

interface ExtensionFooterProps {
  children?: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
}

/**
 * Flexible footer component for extension pages
 * Supports multiple content slots and layouts
 */
export default function ExtensionFooter({
  children,
  leftContent,
  rightContent,
  centerContent,
  variant = 'default',
  className = ''
}: ExtensionFooterProps) {
  const variantClasses = {
    default: 'p-4 border-t border-border',
    compact: 'p-2 border-t border-border',
    minimal: 'p-2'
  };

  // If children provided, use simple layout
  if (children) {
    return (
      <footer className={`bg-background ${variantClasses[variant]} ${className}`}>
        {children}
      </footer>
    );
  }

  // Multi-slot layout
  const hasMultipleSlots = [leftContent, rightContent, centerContent].filter(Boolean).length > 1;

  if (hasMultipleSlots) {
    return (
      <footer className={`bg-background ${variantClasses[variant]} ${className}`}>
        <div className="flex items-center justify-between">
          {/* Left slot */}
          <div className="flex items-center">
            {leftContent}
          </div>

          {/* Center slot */}
          {centerContent && (
            <div className="flex items-center">
              {centerContent}
            </div>
          )}

          {/* Right slot */}
          <div className="flex items-center">
            {rightContent}
          </div>
        </div>
      </footer>
    );
  }

  // Single content layout
  const singleContent = leftContent || rightContent || centerContent;
  
  return (
    <footer className={`bg-background ${variantClasses[variant]} ${className}`}>
      <div className="flex items-center justify-center">
        {singleContent}
      </div>
    </footer>
  );
}