/**
 * Comet Framework - Minimal popup using PopupWrapper with synced theme
 * @module @voilajsx/comet
 * @file src/pages/popup/page.tsx
 */

import { useState, useEffect } from 'react';
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';
import { Switch } from '@voilajsx/uikit/switch';
import { Button } from '@voilajsx/uikit/button';
import { FileText, Quote, Settings } from 'lucide-react';

// Import Comet framework utilities
import { storage } from '@voilajsx/comet/storage';
import { messaging } from '@voilajsx/comet/messaging';

// Import feature tab components
import PageAnalyzerTab from '@/features/page-analyzer/components/PageAnalyzerTab';
import QuoteGeneratorTab from '@/features/quote-generator/components/QuoteGeneratorTab';

// Import shared components
import ExtensionLogo from '@/shared/components/ExtensionLogo';
import PopupWrapper from '@/shared/layouts/PopupWrapper';

function PopupContent() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [isEnabled, setIsEnabled] = useState(true);
  const [currentTab, setCurrentTab] = useState(null);
  const [featureSettings, setFeatureSettings] = useState({
    pageAnalyzerEnabled: true,
    quoteGeneratorEnabled: true,
  });

  /**
   * Initialize popup
   */
  useEffect(() => {
    initializePopup();
  }, []);

  const initializePopup = async () => {
    try {
      // Get current tab
      const tab = await messaging.getActiveTab();
      setCurrentTab(tab);

      // Load settings from storage (with defaults from defaults.json)
      const extensionEnabled = await storage.get('extensionEnabled');
      const pageAnalyzerEnabled = await storage.get('pageAnalyzerEnabled');
      const quoteGeneratorEnabled = await storage.get('quoteGeneratorEnabled');
      
      setIsEnabled(extensionEnabled);
      setFeatureSettings({
        pageAnalyzerEnabled,
        quoteGeneratorEnabled,
      });

      // Smart tab selection - find best available tab
      const lastTab = await storage.get('popup.activeTab');
      let defaultTab = null;
      
      // First check if last tab is still available and enabled
      if (lastTab === 'analyzer' && pageAnalyzerEnabled) {
        defaultTab = 'analyzer';
      } else if (lastTab === 'quotes' && quoteGeneratorEnabled) {
        defaultTab = 'quotes';
      } else {
        // Find first available tab if last tab is disabled/unavailable
        if (pageAnalyzerEnabled) {
          defaultTab = 'analyzer';
        } else if (quoteGeneratorEnabled) {
          defaultTab = 'quotes';
        }
      }
      
      if (defaultTab) {
        setActiveTab(defaultTab);
      }
    } catch (error) {
      console.error('Failed to initialize popup:', error);
    }
  };

  /**
   * Open extension options page
   */
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  /**
   * Handle enable/disable toggle
   */
  const handleToggleEnabled = async (enabled: boolean) => {
    setIsEnabled(enabled);
    await storage.set('extensionEnabled', enabled);
  };

  // Logo component
  const logo = (
    <ExtensionLogo 
      name="CometOne"
      size="md"
    />
  );

  // Header actions (settings button + toggle switch)
  const headerActions = (
    <div className="flex items-center gap-2 ">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpenOptions}
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

  // Tab configuration - only show enabled features
  const tabs = [];
  if (featureSettings.pageAnalyzerEnabled) {
    tabs.push({
      id: 'analyzer',
      label: 'Analyzer',
      icon: FileText,
      content: <PageAnalyzerTab value="analyzer" currentTab={currentTab} />
    });
  }
  if (featureSettings.quoteGeneratorEnabled) {
    tabs.push({
      id: 'quotes',
      label: 'Quotes', 
      icon: Quote,
      content: <QuoteGeneratorTab value="quotes" />
    });
  }

  // Show disabled state or no features available
  if (!isEnabled || tabs.length === 0) {
    return (
      <div className="w-80 bg-background text-foreground">
        <div className="flex items-center justify-between p-4 border-b border-border">
          {logo}
          {headerActions}
        </div>
        <div className="p-8 text-center text-muted-foreground">
          {!isEnabled ? (
            <>
              <p className="text-sm">Extension is disabled</p>
              <p className="text-xs mt-1">Toggle above to enable</p>
            </>
          ) : (
            <>
              <p className="text-sm">No features enabled</p>
              <p className="text-xs mt-1">Enable features in settings</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <PopupWrapper
      logo={logo}
      title="CometOne"
      headerActions={headerActions}
      tabs={tabs}
      defaultTab={activeTab}
      onTabChange={(tabId) => {
        setActiveTab(tabId);
        storage.set('popup.activeTab', tabId);
      }}
      size="lg"
      variant="default"
    />
  );
}

export default function PopupPage() {
  const [theme, setTheme] = useState('metro');
  const [variant, setVariant] = useState('light');

  // Load theme from storage to sync with options page
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const appTheme = await storage.get('app.theme');
      const appVariant = await storage.get('app.variant');
      
      if (appTheme) setTheme(appTheme);
      if (appVariant) setVariant(appVariant);
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  return (
    <ThemeProvider theme={theme} variant={variant} detectSystem={false}>
      <PopupContent />
    </ThemeProvider>
  );
}