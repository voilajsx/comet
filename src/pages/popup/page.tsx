/**
 * Comet Framework - Main popup component with tabbed interface
 * Demonstrates how to use Comet platform with UIKit components and auth
 * @module @voilajsx/comet
 * @file src/pages/popup/page.tsx
 */

import { useState, useEffect } from 'react';
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';
import { PopupLayout } from '@voilajsx/uikit/popup';
import { Tabs, TabsList, TabsTrigger } from '@voilajsx/uikit/tabs';
import { Button } from '@voilajsx/uikit/button';
import { Settings, User, FileText, Quote, AlertTriangle, TestTube } from 'lucide-react';

// Import Comet framework utilities
import { storage } from '@voilajsx/comet/storage';
import { messaging } from '@voilajsx/comet/messaging';

// Import auth system
import AuthProvider from '@/components/auth/AuthProvider';

// Import popup tab components
import AccountTab from '@/components/popup/AccountTab';
import PageAnalyzerTab from '@/components/popup/PageAnalyzerTab';
import QuoteGeneratorTab from '@/components/popup/QuoteGeneratorTab';
import TestTab from '@/components/popup/TestTab';

// Import reusable components
import ExtensionLogo from '@/components/ExtensionLogo';
import StatusBadge from '@/components/StatusBadge';
import TabInfo from '@/components/TabInfo';

/**
 * Main popup content component
 */
function PopupContent() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [isEnabled, setIsEnabled] = useState(true);
  const [currentTab, setCurrentTab] = useState(null);
  const [featureSettings, setFeatureSettings] = useState({
    pageAnalyzerEnabled: true,
    quoteGeneratorEnabled: true,
    authenticationEnabled: true,
    testingEnabled: true, // Add testing feature flag
  });

  /**
   * Initialize popup with current tab info and saved settings
   */
  useEffect(() => {
    initializePopup();
  }, []);

  /**
   * Initialize popup data
   */
  const initializePopup = async () => {
    try {
      // Get current tab using Comet messaging
      const tab = await messaging.getActiveTab();
      setCurrentTab(tab);

      // Load saved settings using Comet storage with defaults
      const extensionEnabled = await storage.get('extensionEnabled', true);
      setIsEnabled(extensionEnabled);

      // Load feature settings
      const pageAnalyzerEnabled = await storage.get('pageAnalyzerEnabled', true);
      const quoteGeneratorEnabled = await storage.get('quoteGeneratorEnabled', true);
      const authenticationEnabled = await storage.get('authenticationEnabled', true);
      const testingEnabled = await storage.get('testingEnabled', true);
      
      setFeatureSettings({
        pageAnalyzerEnabled,
        quoteGeneratorEnabled,
        authenticationEnabled,
        testingEnabled,
      });

      // Load last active tab, but ensure it's enabled
      const lastTab = await storage.get('popup.activeTab', 'analyzer');
      let defaultTab = 'analyzer';
      
      if (lastTab === 'analyzer' && pageAnalyzerEnabled) {
        defaultTab = 'analyzer';
      } else if (lastTab === 'quotes' && quoteGeneratorEnabled) {
        defaultTab = 'quotes';
      } else if (lastTab === 'account' && authenticationEnabled) {
        defaultTab = 'account';
      } else if (lastTab === 'test' && testingEnabled) {
        defaultTab = 'test';
      } else {
        // Find first available tab
        if (pageAnalyzerEnabled) defaultTab = 'analyzer';
        else if (authenticationEnabled) defaultTab = 'account';
        else if (quoteGeneratorEnabled) defaultTab = 'quotes';
        else if (testingEnabled) defaultTab = 'test';
      }
      
      setActiveTab(defaultTab);
    } catch (error) {
      console.error('Failed to initialize popup:', error);
    }
  };

  /**
   * Handle tab change
   */
  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    // Save active tab to storage
    await storage.set('popup.activeTab', tab);
  };

  /**
   * Open extension options page
   */
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  /**
   * Check if current page supports extension actions
   */
  const canPerformAction = () => {
    return messaging.isTabSupported(currentTab);
  };

  // Get available tabs based on settings
  const availableTabs = [];
  if (featureSettings.pageAnalyzerEnabled) {
    availableTabs.push({ value: 'analyzer', label: 'Analyzer', icon: FileText });
  }
  if (featureSettings.authenticationEnabled) {
    availableTabs.push({ value: 'account', label: 'Account', icon: User });
  }
  if (featureSettings.quoteGeneratorEnabled) {
    availableTabs.push({ value: 'quotes', label: 'Quotes', icon: Quote });
  }
  if (featureSettings.testingEnabled) {
    availableTabs.push({ value: 'test', label: 'Test', icon: TestTube });
  }

  // Extension logo component
  const logo = (
    <ExtensionLogo 
      name="CometOne"
      size="md"
    />
  );

  // Status badge component
  const statusBadge = (
    <StatusBadge 
      isEnabled={isEnabled}
      isSupported={canPerformAction()}
    />
  );

  // Header actions component
  const headerActions = (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleOpenOptions}
      className="h-6 w-6 p-0"
    >
      <Settings className="text-foreground hover:text-background h-4 w-4" />
    </Button>
  );

  // Show message if extension is disabled
  if (!isEnabled) {
    return (
      <PopupLayout
        variant="default"
        size="lg"
        logo={logo}
        badge={<StatusBadge isEnabled={false} />}
        headerActions={headerActions}
        subtitle="Extension Disabled"
      >
        <div className="text-center py-8">
          <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-medium mb-2">Extension Disabled</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enable the extension in settings to access features.
          </p>
          <Button onClick={handleOpenOptions} variant="default">
            Open Settings
          </Button>
        </div>
      </PopupLayout>
    );
  }

  // Show message if no features are enabled
  if (availableTabs.length === 0) {
    return (
      <PopupLayout
        variant="default"
        size="lg"
        logo={logo}
        badge={statusBadge}
        headerActions={headerActions}
        subtitle="No Features Enabled"
      >
        <div className="text-center py-8">
          <Settings className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-medium mb-2">No Features Available</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enable features in settings to use the extension.
          </p>
          <Button onClick={handleOpenOptions} variant="default">
            Configure Features
          </Button>
        </div>
      </PopupLayout>
    );
  }

  return (
    <PopupLayout
      variant="default"
      size="lg"
      logo={logo}
      badge={statusBadge}
      headerActions={headerActions}
      subtitle="Built with Comet Framework"
      className="rounded-none border-0 shadow-none"
    >
      <div className="space-y-4">
        
        {/* Tabs Container */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Tab Navigation */}
          <TabsList className={`grid w-full grid-cols-${availableTabs.length} mb-3`}>
            {availableTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  <span className="sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content - Only render enabled tabs */}
          {featureSettings.authenticationEnabled && (
            <AccountTab value="account" />
          )}
          
          {featureSettings.pageAnalyzerEnabled && (
            <PageAnalyzerTab 
              value="analyzer" 
              currentTab={currentTab}
            />
          )}
          
          {featureSettings.quoteGeneratorEnabled && (
            <QuoteGeneratorTab value="quotes" />
          )}

          {featureSettings.testingEnabled && (
            <TestTab value="test" />
          )}
        </Tabs>

        {/* Current page info */}
        <TabInfo 
          tab={currentTab}
          showSecurityIcon={true}
        />
      </div>
    </PopupLayout>
  );
}

/**
 * Main popup app component with theme and auth providers
 */
export default function PopupPage() {
  const [theme, setTheme] = useState('metro');
  const [variant, setVariant] = useState('light');

  // Load theme from storage/defaults
  useEffect(() => {
    storage.get('app.theme', 'metro').then(setTheme);
    storage.get('app.variant', 'light').then(setVariant);
  }, []);

  return (
    <ThemeProvider theme={theme} variant={variant} detectSystem={false}>
      <AuthProvider>
        <PopupContent />
      </AuthProvider>
    </ThemeProvider>
  );
}