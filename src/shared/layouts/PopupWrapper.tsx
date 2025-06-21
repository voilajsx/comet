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
  extensionName, // Prop override for logo text (will act as overrideName)
  extensionIcon, // Prop override for logo icon
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
    appName: 'Comet Extension',      // General app name from storage ('app.name')
    appIcon: 'Zap',                  // General app icon from storage ('app.icon')
    popupOverrideLogoText: ''        // Specific text for the popup header logo from storage ('popup.logoOverrideText')
  });
  
  // Auto-discover modules and generate tabs
  const { 
    popupTabs, 
    loading, 
    currentTab, 
    extensionEnabled 
  } = useModuleDiscovery();

  // Initialize popup state and load configurations
  useEffect(() => {
    initializePopup();
  }, [popupTabs]);

  const initializePopup = async () => {
    try {
      // Load extension state
      const enabled = await storage.get('extensionEnabled', true);
      setIsEnabled(enabled);

      // Load general app configuration from storage
      const appName = await storage.get('app.name', 'Comet Extension');
      const appIcon = await storage.get('app.icon', 'Zap');
      
      // NEW: Load popup specific logo override text from storage
      // Crucial part: If 'popup.logoOverrideText' is not set, it explicitly defaults to 'Comet One' here.
      // If it IS set, even to an empty string, it will retrieve that.
      const popupOverrideLogoText = await storage.get('popup.logoOverrideText', 'Comet One'); 

      // Update app config state
      setAppConfig({ 
        appName, 
        appIcon, 
        popupOverrideLogoText 
      });

      // Set first available tab as default if no active tab or it's invalid
      if (popupTabs.length > 0) {
        const savedTab = await storage.get('popup.activeTab', popupTabs[0].id);
        const validTab = popupTabs.find(tab => tab.id === savedTab);
        setActiveTab(validTab ? savedTab : popupTabs[0].id);
      }
    } catch (error) {
      console.error('[PopupWrapper] Failed to initialize:', error);
      // Fallback to default config on error
      setAppConfig({
        appName: 'Comet Extension',
        appIcon: 'Zap',
        popupOverrideLogoText: 'Comet One' // Ensure fallback also defaults correctly
      });
      setIsEnabled(true);
      setActiveTab('');
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

  // Generate logo using the new priority logic
  const logo = customLogo || (() => {
    let logoComponentProps: {
      size: 'sm' | 'md' | 'lg';
      name?: string;
      icon?: string;
      overrideName?: string;
    } = { size: 'md' };

    // Priority 1: `extensionName` prop passed to PopupWrapper (acts as an immediate override)
    if (extensionName) {
      logoComponentProps.overrideName = extensionName;
    } 
    // Priority 2: `popupOverrideLogoText` from storage (acts as an override)
    // IMPORTANT: Check that it's a non-empty string to avoid using '' as an override.
    else if (typeof appConfig.popupOverrideLogoText === 'string' && appConfig.popupOverrideLogoText.length > 0) {
      logoComponentProps.overrideName = appConfig.popupOverrideLogoText;
    } 
    // Priority 3: Fallback to general app name from storage
    else {
      logoComponentProps.name = appConfig.appName;
    }

    // Determine the icon for the logo
    // 1. If `extensionIcon` prop is provided (highest precedence for icon)
    if (extensionIcon) {
      logoComponentProps.icon = extensionIcon;
    } 
    // 2. If we determined an `overrideName` (from prop or storage), typically no separate icon is shown
    else if (logoComponentProps.overrideName) { 
      logoComponentProps.icon = undefined; 
    }
    // 3. Otherwise (not in overrideName mode and no extensionIcon prop), use the general app icon from storage
    else {
      logoComponentProps.icon = appConfig.appIcon;
    }

    return <ExtensionLogo {...logoComponentProps} />;
  })();

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