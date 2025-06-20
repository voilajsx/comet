/**
 * Options Wrapper Component - Complete options page layout shell (Updated)
 * @module @voilajsx/comet
 * @file src/shared/layouts/OptionsWrapper.tsx
 */

import React from 'react';
import { PageLayout, PageHeader, PageContent } from '@voilajsx/uikit/page';
import ExtensionHeader from '../components/ExtensionHeader';
import TabNavigation from '../components/TabNavigation';
import ExtensionFooter from '../components/ExtensionFooter';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  disabled?: boolean;
}

interface OptionsWrapperProps {
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
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'minimal' | 'contained';
  className?: string;
}

/**
 * Complete options page wrapper using UIKit PageLayout
 * Provides ready-made shell for extension options pages
 */
export default function OptionsWrapper({
  logo,
  title = 'Extension Settings',
  subtitle,
  headerActions,
  tabs,
  defaultTab,
  onTabChange,
  footerContent,
  size = 'lg',
  variant = 'default',
  className = ''
}: OptionsWrapperProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <PageLayout variant={variant} size={size}>
        {/* Header with Logo, Title, and Actions */}
        <PageHeader  className="border-b border-border">
          <ExtensionHeader
            logo={logo}
            actions={headerActions}
          />
        </PageHeader>

        {/* Main Content with Tabs */}
        <PageContent className="py-6">
          <div className="">
            <TabNavigation
              tabs={tabs}
              defaultTab={defaultTab}
              onTabChange={onTabChange}
            />
          </div>
        </PageContent>

        {/* Footer */}
        {footerContent && (
          <ExtensionFooter variant="compact">
            {footerContent}
          </ExtensionFooter>
        )}
      </PageLayout>
    </div>
  );
}