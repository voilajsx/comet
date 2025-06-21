/**
 * Extension Footer Component - Flexible footer with content slots and storage integration
 * @module @voilajsx/comet
 * @file src/shared/components/ExtensionFooter.tsx
 */

import React, { useState, useEffect } from 'react';
import { storage } from '@voilajsx/comet/storage';

interface ExtensionFooterProps {
  children?: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
  useStorageContent?: boolean; // New prop to enable storage content loading
}

/**
 * Flexible footer component for extension pages
 * Supports multiple content slots and layouts with storage integration
 */
export default function ExtensionFooter({
  children,
  leftContent,
  rightContent,
  centerContent,
  variant = 'default',
  className = '',
  useStorageContent = false
}: ExtensionFooterProps) {
  const [footerContent, setFooterContent] = useState<string>('');
  const [loading, setLoading] = useState(useStorageContent);

  // Load footer content from storage if enabled
  useEffect(() => {
    if (useStorageContent) {
      loadFooterContent();
    }
  }, [useStorageContent]);

  const loadFooterContent = async () => {
    try {
      const content = await storage.get('footer-content', '');
      setFooterContent(content);
    } catch (error) {
      console.warn('[ExtensionFooter] Failed to load footer content:', error);
      setFooterContent('');
    } finally {
      setLoading(false);
    }
  };

  const variantClasses = {
    default: 'p-4 ',
    compact: 'p-2 ',
    minimal: 'p-2'
  };

  // Loading state for storage content
  if (loading) {
    return (
      <footer className={` ${variantClasses[variant]} ${className}`}>
        <div className="flex items-center justify-center">
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </div>
      </footer>
    );
  }

  // If children provided, use simple layout
  if (children) {
    return (
      <footer className={` ${variantClasses[variant]} ${className}`}>
        {children}
      </footer>
    );
  }

  // If using storage content and it exists, show it
  if (useStorageContent && footerContent) {
    return (
      <footer className={` ${variantClasses[variant]} ${className}`}>
        <div className="flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            {footerContent}
          </div>
        </div>
      </footer>
    );
  }

  // Multi-slot layout
  const hasMultipleSlots = [leftContent, rightContent, centerContent].filter(Boolean).length > 1;

  if (hasMultipleSlots) {
    return (
      <footer className={` ${variantClasses[variant]} ${className}`}>
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
  
  if (singleContent) {
    return (
      <footer className={` ${variantClasses[variant]} ${className}`}>
        <div className="flex items-center justify-center">
          {singleContent}
        </div>
      </footer>
    );
  }

  // Empty footer - don't render anything
  return null;
}