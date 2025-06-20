/**
 * Comet Framework - Options page using updated OptionsWrapper
 * Settings for Page Analyzer and Quote Generator features
 * @module @voilajsx/comet
 * @file src/pages/options/page.tsx
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Label } from '@voilajsx/uikit/label';
import { Switch } from '@voilajsx/uikit/switch';
import { Badge } from '@voilajsx/uikit/badge';
import { Separator } from '@voilajsx/uikit/separator';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Save, RotateCcw, Settings, Palette, FileText, Quote, CheckCircle, AlertCircle, Zap, Info } from 'lucide-react';

// Import comet framework utilities
import { storage } from '@voilajsx/comet/storage';
import { messaging } from '@voilajsx/comet/messaging';

// Import shared components
import ExtensionLogo from '@/shared/components/ExtensionLogo';
import ThemeSelector from '@/shared/components/ThemeSelector';
import OptionsWrapper from '@/shared/layouts/OptionsWrapper';

// Default extension settings
const DEFAULT_SETTINGS = {
  extensionEnabled: true,
  pageAnalyzerEnabled: true,
  quoteGeneratorEnabled: true,
  notificationsEnabled: true,
};

/**
 * Built-in ActionResult component
 */
function ActionResult({ 
  result, 
  onDismiss, 
  autoDismiss = true, 
  autoDismissDelay = 3000 
}: {
  result: any;
  onDismiss: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}) {
  useEffect(() => {
    if (result && autoDismiss && onDismiss) {
      const timer = setTimeout(onDismiss, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [result, autoDismiss, autoDismissDelay, onDismiss]);

  if (!result) return null;

  const getConfig = () => {
    switch (result.type) {
      case 'success':
        return { Icon: CheckCircle, variant: 'default' as const, iconColor: 'text-green-500' };
      case 'error':
        return { Icon: AlertCircle, variant: 'destructive' as const, iconColor: 'text-destructive' };
      case 'info':
        return { Icon: Info, variant: 'default' as const, iconColor: 'text-blue-500' };
      default:
        return { Icon: AlertCircle, variant: 'default' as const, iconColor: 'text-muted-foreground' };
    }
  };

  const { Icon, variant, iconColor } = getConfig();

  return (
    <Alert variant={variant} className="border-border">
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <AlertDescription className="text-sm pt-1">
        {result.message}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Main options content component
 */
function OptionsContent() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      console.log('[Options] Loading settings from storage...');
      
      // Check if storage is initialized with defaults
      const isInitialized = await storage.get('_defaultsInitialized');
      console.log('[Options] Storage initialized:', isInitialized);
      
      const extensionEnabled = await storage.get('extensionEnabled');
      const pageAnalyzerEnabled = await storage.get('pageAnalyzerEnabled');
      const quoteGeneratorEnabled = await storage.get('quoteGeneratorEnabled');
      const notificationsEnabled = await storage.get('notificationsEnabled');
      
      console.log('[Options] Loaded settings:', {
        extensionEnabled,
        pageAnalyzerEnabled,
        quoteGeneratorEnabled,
        notificationsEnabled
      });
      
      setSettings({
        extensionEnabled,
        pageAnalyzerEnabled,
        quoteGeneratorEnabled,
        notificationsEnabled,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      console.log('[Options] Using fallback defaults');
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveResult(null);

    try {
      // Save each setting individually for persistence
      await storage.set('extensionEnabled', settings.extensionEnabled);
      await storage.set('pageAnalyzerEnabled', settings.pageAnalyzerEnabled);
      await storage.set('quoteGeneratorEnabled', settings.quoteGeneratorEnabled);
      await storage.set('notificationsEnabled', settings.notificationsEnabled);
      
      try {
        await messaging.sendToBackground({
          type: 'settingsUpdated',
          data: settings
        });
      } catch (error) {
        console.warn('Could not notify background script:', error);
      }
      
      setSaveResult({
        type: 'success',
        message: 'Settings saved successfully!'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveResult({
        type: 'error',
        message: 'Failed to save settings. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setSaveResult({
      type: 'info',
      message: 'Settings reset to defaults. Click Save to apply.'
    });
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSaveResult(null);
  };

  // Logo for header
  const logo = (
    <ExtensionLogo 
      name="CometOne"
      icon={Zap}
      size="lg"
    />
  );

  // Header actions - Save and Reset buttons
  const headerActions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={resetSettings}
        disabled={isSaving}
        size="sm"
        className="gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
      
      <Button
        onClick={saveSettings}
        disabled={isSaving}
        size="sm"
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );

  // Tab configuration
  const tabs = [
    {
      id: 'features',
      label: 'Features',
      icon: Settings,
      content: (
        <div className="space-y-6">
          {/* Action Result at top */}
          {saveResult && (
            <ActionResult 
              result={saveResult}
              onDismiss={() => setSaveResult(null)}
              autoDismiss={true}
              autoDismissDelay={3000}
            />
          )}

          {/* Feature Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Extension Features
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Control which extension features are available
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Extension master toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="extension-enabled" className="text-base font-medium">
                    Extension Enabled
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Master switch for all extension functionality
                  </p>
                </div>
                <Switch
                  id="extension-enabled"
                  checked={settings.extensionEnabled}
                  onCheckedChange={(checked) => updateSetting('extensionEnabled', checked)}
                />
              </div>

              <Separator />

              {/* Page Analyzer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label htmlFor="page-analyzer">Page Analyzer</Label>
                    <p className="text-sm text-muted-foreground">
                      Analyze page size and basic content metrics
                    </p>
                  </div>
                </div>
                <Switch
                  id="page-analyzer"
                  checked={settings.pageAnalyzerEnabled}
                  onCheckedChange={(checked) => updateSetting('pageAnalyzerEnabled', checked)}
                  disabled={!settings.extensionEnabled}
                />
              </div>

              <Separator />

              {/* Quote Generator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Quote className="w-5 h-5 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label htmlFor="quote-generator">Quote Generator</Label>
                    <p className="text-sm text-muted-foreground">
                      Access inspirational quotes with fallback support
                    </p>
                  </div>
                </div>
                <Switch
                  id="quote-generator"
                  checked={settings.quoteGeneratorEnabled}
                  onCheckedChange={(checked) => updateSetting('quoteGeneratorEnabled', checked)}
                  disabled={!settings.extensionEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Customize the look and feel of the extension
              </p>
            </CardHeader>
            <CardContent>
              <ThemeSelector showLabel={false} />
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'about',
      label: 'About',
      icon: Info,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Extension Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Framework Version</span>
                <Badge variant="secondary">Comet 1.0.0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Extension ID</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {chrome.runtime.id}
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Built with</span>
                <span className="text-sm text-muted-foreground">@voilajsx/comet + UIKit</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  // Footer content
  const footerContent = (
    <div className="text-center text-sm text-muted-foreground">
      <p>Built with Comet Framework • Version 1.0.0</p>
    </div>
  );

  return (
    <OptionsWrapper
      logo={logo}
      title="Extension Settings"
      subtitle="Configure your CometOne extension"
      headerActions={headerActions}
      tabs={tabs}
      defaultTab="features"
      footerContent={footerContent}
      size="lg"
      variant="default"
    />
  );
}

/**
 * Main options app component with theme provider
 */
export default function OptionsPage() {
  return (
    <ThemeProvider theme="metro" variant="light" detectSystem={false}>
      <OptionsContent />
    </ThemeProvider>
  );
}