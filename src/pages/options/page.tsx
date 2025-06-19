/**
 * Comet Framework - Main options page component (Enhanced)
 * Demonstrates settings management with comet platform utilities
 * @module @voilajsx/comet
 * @file src/pages/options/page.tsx
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@voilajsx/uikit/theme-provider';
import { PageLayout, PageHeader, PageContent } from '@voilajsx/uikit/page';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Label } from '@voilajsx/uikit/label';
import { Switch } from '@voilajsx/uikit/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@voilajsx/uikit/select';
import { Badge } from '@voilajsx/uikit/badge';
import { Separator } from '@voilajsx/uikit/separator';
import { Save, RotateCcw, Settings, Zap, Sun, Moon, Palette, FileText, Quote, User } from 'lucide-react';

// Import comet framework utilities
import { storage } from '@voilajsx/comet/storage';
import { messaging } from '@voilajsx/comet/messaging';

// Import reusable components
import ExtensionLogo from '@/components/ExtensionLogo';
import ActionResult from '@/components/ActionResult';

// Default extension settings
const DEFAULT_SETTINGS = {
  // Feature toggles
  pageAnalyzerEnabled: true,
  quoteGeneratorEnabled: true,
  authenticationEnabled: true,
  
  // General settings
  extensionEnabled: true,
  notificationsEnabled: true,
  
  // Theme settings (handled by ThemeProvider)
  theme: 'metro',
  themeVariant: 'light',
};

/**
 * Theme selector component for options page
 */
function ThemeSelector() {
  const { theme, variant, setTheme, setVariant } = useTheme();
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="theme-select">Extension Theme</Label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger id="theme-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default (Ocean Blue)</SelectItem>
            <SelectItem value="aurora">Aurora (Purple-Green)</SelectItem>
            <SelectItem value="metro">Metro (Gray-Blue)</SelectItem>
            <SelectItem value="neon">Neon (Cyberpunk)</SelectItem>
            <SelectItem value="ruby">Ruby (Red-Gold)</SelectItem>
            <SelectItem value="studio">Studio (Designer)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Choose the color theme for extension interfaces
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="dark-mode">Dark Mode</Label>
          <p className="text-sm text-muted-foreground">
            Use dark appearance for extension interfaces
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          <Switch
            id="dark-mode"
            checked={variant === 'dark'}
            onCheckedChange={(checked) => setVariant(checked ? 'dark' : 'light')}
          />
          <Moon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

/**
 * Main options page component using comet framework
 */
function OptionsContent() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  /**
   * Load settings on component mount
   */
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Load current settings from comet storage
   */
  const loadSettings = async () => {
    try {
      const settingsKeys = Object.keys(DEFAULT_SETTINGS);
      const stored = await storage.get(settingsKeys);
      
      const userSettings = { ...DEFAULT_SETTINGS };
      settingsKeys.forEach(key => {
        if (stored[key] !== undefined) {
          userSettings[key] = stored[key];
        }
      });
      
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSaveResult({
        type: 'error',
        message: 'Failed to load settings'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save settings to comet storage
   */
  const saveSettings = async () => {
    setIsSaving(true);
    setSaveResult(null);

    try {
      await storage.set(settings);
      
      // Notify background script
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

  /**
   * Reset settings to defaults
   */
  const resetSettings = async () => {
    setSettings(DEFAULT_SETTINGS);
    setSaveResult({
      type: 'info',
      message: 'Settings reset to defaults. Click Save to apply.'
    });
  };

  /**
   * Update a specific setting
   */
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSaveResult(null);
  };

  const logo = (
    <ExtensionLogo 
      name="CometOne"
      icon={Zap}
      size="lg"
    />
  );

  if (isLoading) {
    return (
      <PageLayout variant="default" size="lg">
        <PageContent>
          <div className="flex items-center justify-center min-h-64">
            <div>Loading settings...</div>
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout variant="default" size="md">
      <PageHeader variant="default" className="py-6 border-b border-border">
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
          {logo}
          
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <h1 className="text-2xl font-bold">Extension Settings</h1>
              <p className="text-muted-foreground">Built with Comet Framework</p>
            </div>
            
            {/* Action buttons in header */}
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
        </div>
      </PageHeader>

      <PageContent className="bg-background">
        <div className="max-w-4xl mx-auto">
          
          {/* Action result below header */}
          {saveResult && (
            <div className="py-4">
              <ActionResult 
                result={saveResult}
                onDismiss={() => setSaveResult(null)}
                autoDismiss={true}
                autoDismissDelay={3000}
              />
            </div>
          )}
          
          <div className="py-6 space-y-6">
            
            {/* Feature Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Features
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
                        Analyze page content, word count, and size
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
                        Access inspirational quotes (requires login)
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

                <Separator />

                {/* Authentication */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label htmlFor="authentication">User Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable user login and personalized features
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="authentication"
                    checked={settings.authenticationEnabled}
                    onCheckedChange={(checked) => updateSetting('authenticationEnabled', checked)}
                    disabled={!settings.extensionEnabled}
                  />
                </div>


               
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Customize the look and feel of the extension
                </p>
              </CardHeader>
              <CardContent>
                <ThemeSelector />
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
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
        </div>
      </PageContent>
    </PageLayout>
  );
}

/**
 * Main options app component with theme provider
 */
export default function OptionsPage() {
  return (
    <ThemeProvider theme="metro" variant="light" detectSystem={false}>
      <div className="min-h-screen bg-background">
        <OptionsContent />
      </div>
    </ThemeProvider>
  );
}