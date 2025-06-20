/**
 * Tab Navigation Component - Developer-friendly tabs wrapper
 * @module @voilajsx/comet
 * @file src/shared/components/TabNavigation.tsx
 */

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@voilajsx/uikit/tabs';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: TabItem[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

/**
 * Simple tab navigation wrapper around UIKit Tabs
 * Makes it easy for developers to create tabbed interfaces
 */
export default function TabNavigation({
  tabs,
  defaultTab,
  onTabChange,
  className = ''
}: TabNavigationProps) {
  const initialTab = defaultTab || tabs[0]?.id;

  return (
    <div className={`w-full ${className}`}>
      <Tabs
        defaultValue={initialTab}
        onValueChange={onTabChange}
        className="w-full"
      >
        {/* Tab Headers */}
        <TabsList className={`grid w-full grid-cols-${tabs.length} mb-4`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={tab.disabled}
                className="flex items-center gap-2"
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content Areas */}
        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className="mt-0 focus:outline-none"
          >
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}