/**
 * Comet Framework - Reusable tab info component
 * Displays current tab information with proper formatting
 * @module @voilajsx/comet
 * @file src/components/TabInfo.tsx
 */

import React from 'react';
import { Card, CardContent } from '@voilajsx/uikit/card';
import { Globe, Lock, Shield, AlertTriangle } from 'lucide-react';

interface TabInfoProps {
  tab?: {
    id?: number;
    title?: string;
    url?: string;
    favIconUrl?: string;
  } | null;
  showSecurityIcon?: boolean;
  className?: string;
}

/**
 * Tab information display component with security indicators
 */
export default function TabInfo({ 
  tab,
  showSecurityIcon = true,
  className = ''
}: TabInfoProps) {
  if (!tab) {
    return (
      <Card className={`bg-card border-border ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4" />
            <span>No active tab</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get security icon based on URL
  const getSecurityIcon = () => {
    if (!tab.url) return Globe;
    
    if (tab.url.startsWith('https://')) return Lock;
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return Shield;
    return Globe;
  };

  const SecurityIcon = getSecurityIcon();
  
  // Parse hostname safely
  const getHostname = () => {
    try {
      return tab.url ? new URL(tab.url).hostname : 'Unknown';
    } catch {
      return 'Invalid URL';
    }
  };

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-sm">
          {showSecurityIcon && (
            <SecurityIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
          
          {/* Favicon if available */}
          {tab.favIconUrl && (
            <img 
              src={tab.favIconUrl} 
              alt="" 
              className="w-4 h-4 flex-shrink-0"
              onError={(e) => {
                // Hide favicon if it fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate text-card-foreground">
              {tab.title || 'Untitled'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {getHostname()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}