/**
 * Popup Wrapper Component - Complete popup layout shell (Fixed)
 * @module @voilajsx/comet
 * @file src/shared/layouts/PopupWrapper.tsx
 */

import React from 'react';
import { PopupLayout } from '@voilajsx/uikit/popup';
import ExtensionHeader from '../components/ExtensionHeader';
import TabNavigation from '../components/TabNavigation';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  disabled?: boolean;
}

interface PopupWrapperProps {
  // Header props
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  
  // Tab props
  tabs: TabItem[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  
  // Footer props
  footerContent?: React.ReactNode;
  
  // Layout props
  size?: 'sm' | 'md' | 'lg' | 'auto';
  variant?: 'default' | 'compact' | 'mini';
  className?: string;
}

/**
 * Complete popup wrapper using UIKit PopupLayout
 * Provides ready-made shell for extension popups
 */
export default function PopupWrapper({
  logo,
  title,
  subtitle,
  headerActions,
  tabs,
  defaultTab,
  onTabChange,
  footerContent,
  size = 'lg',
  variant = 'default',
  className = ''
}: PopupWrapperProps) {
  return (
    <PopupLayout
      variant={variant}
      size={size}
      className={className}
      footer={footerContent}
    >
      {/* Custom header with logo and actions */}
      <ExtensionHeader
        logo={logo}
        actions={headerActions}
        className="p-4 border-b border-border mb-4"
      />

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        defaultTab={defaultTab}
        onTabChange={onTabChange}
      />
    </PopupLayout>
  );
}