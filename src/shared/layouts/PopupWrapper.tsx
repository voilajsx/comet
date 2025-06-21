/**
 * Enhanced Popup Wrapper - Auto-Discovery Version with App Config
 * @module @voilajsx/comet
 * @file src/shared/layouts/PopupWrapper.tsx
 */

import React, { useState, useEffect } from 'react';
import { PopupLayout } from '@voilajsx/uikit/popup';
import { Switch } from '@voilajsx/uikit/switch';
import { Button } from '@voilajsx/uikit/button';
import { Settings } from 'lucide-react';

// Import platform APIs and hooks
import { storage } from '@voilajsx/comet/storage';
import useModuleDiscovery from '../hooks/useModuleDiscovery';

// Import shared components
import ExtensionLogo from '../components/ExtensionLogo';
import TabNavigation from '../components/TabNavigation';

/**
 * Auto-discovery popup wrapper with app config integration
 */
export default function PopupWrapper({
  extensionName,
  extensionIcon,
  size = 'lg',
  variant = 'default',
  className = '',
  customLogo,
  customActions,
  footerContent,
  onSettingsClick,
  onExtensionToggle
}) {
  const [activeTab, setActiveTab] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [appConfig, setAppConfig] = useState({
    name: 'Comet Extension',
    icon: 'Zap'
  });
  
  // Auto-discover modules and generate tabs
  const { 
    popupTabs, 
    loading, 
    currentTab, 
    extensionEnabled 
  } = useModuleDiscovery();

  // Initialize popup state
  useEffect(() => {
    initializePopup();
  }, [popupTabs]);

  const initializePopup = async () => {
    try {
      // Load extension state
      const enabled = await storage.get('extensionEnabled', true);
      setIsEnabled(enabled);

      // Load app configuration if not overridden
      if (!extensionName || !extensionIcon) {
        const name = await storage.get('app.name', 'Comet Extension');
        const icon = await storage.get('app.icon', 'Zap');
        setAppConfig({ name, icon });
      }

      // Set first available tab as default
      if (popupTabs.length > 0 && !activeTab) {
        const savedTab = await storage.get('popup.activeTab', popupTabs[0].id);
        const validTab = popupTabs.find(tab => tab.id === savedTab);
        setActiveTab(validTab ? savedTab : popupTabs[0].id);
      }
    } catch (error) {
      console.error('[PopupWrapper] Failed to initialize:', error);
    }
  };

  // Handle extension toggle
  const handleToggleEnabled = async (enabled) => {
    setIsEnabled(enabled);
    await storage.set('extensionEnabled', enabled);
    onExtensionToggle?.(enabled);
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    storage.set('popup.activeTab', tabId);
  };

  // Handle settings click
  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      // Cross-platform options page opening
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.openOptionsPage) {
        browser.runtime.openOptionsPage();
      } else {
        console.warn('[PopupWrapper] Options page API not available');
      }
    }
  };

  // Generate logo (use app config if not overridden)
  const logo = customLogo || (
    <ExtensionLogo 
      name={extensionName || appConfig.name}
      icon={extensionIcon || appConfig.icon}
      size="md"
    />
  );

  // Generate header actions
  const headerActions = customActions || (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSettingsClick}
        className="h-6 w-6 p-0"
      >
        <Settings className="h-4 w-4" />
      </Button>
      <Switch
        checked={isEnabled}
        onCheckedChange={handleToggleEnabled}
      />
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <PopupLayout 
        size={size} 
        variant={variant} 
        className={`border-0 ${className}`}
        logo={logo}
        headerActions={headerActions}
        footer={footerContent}
      >
        <div className="p-8 text-center text-muted-foreground">
          <div className="text-sm">Loading...</div>
        </div>
      </PopupLayout>
    );
  }

  // Extension disabled state
  if (!isEnabled) {
    return (
      <PopupLayout 
        size={size} 
        variant={variant} 
        className={`border-0 ${className}`}
        logo={logo}
        headerActions={headerActions}
        footer={footerContent}
      >
        <div className="p-8 text-center text-muted-foreground">
          <div className="text-sm">Extension is disabled</div>
          <div className="text-xs mt-1">Toggle above to enable</div>
        </div>
      </PopupLayout>
    );
  }

  // No features available
  if (popupTabs.length === 0) {
    return (
      <PopupLayout 
        size={size} 
        variant={variant} 
        className={`border-0 ${className}`}
        logo={logo}
        headerActions={headerActions}
        footer={footerContent}
      >
        <div className="p-8 text-center text-muted-foreground">
          <div className="text-sm">No features available</div>
          <div className="text-xs mt-1">Check settings or current page</div>
        </div>
      </PopupLayout>
    );
  }

  // Main popup interface with auto-discovered tabs
  return (
    <PopupLayout
      variant={variant}
      size={size}
      className={`border-0 ${className}`}
      logo={logo}
      headerActions={headerActions}
      footer={footerContent}
      scrollable={true}
    >
      <TabNavigation
        tabs={popupTabs}
        defaultTab={activeTab}
        onTabChange={handleTabChange}
      />
    </PopupLayout>
  );
}