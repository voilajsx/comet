/**
 * GeneralSettingsPanel Component - Auto-save version (simple)
 * @module @voilajsx/comet
 * @file src/shared/components/GeneralSettingsPanel.tsx
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Switch } from '@voilajsx/uikit/switch';
import { Label } from '@voilajsx/uikit/label';
import { Badge } from '@voilajsx/uikit/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@voilajsx/uikit/select';
import { Separator } from '@voilajsx/uikit/separator';
import { useTheme } from '@voilajsx/uikit/theme-provider';
import { Settings, Sun, Moon, ExternalLink } from 'lucide-react';
import { storage } from '@voilajsx/comet/storage';

export default function GeneralSettingsPanel() {
  const [extensionEnabled, setExtensionEnabled] = useState(true);
  const [appInfo, setAppInfo] = useState({
    name: 'Comet Extension',
    version: '1.0.0',
    description: 'Minimal but powerful Chrome extension framework',
    author: 'Comet Framework',
    website: ''
  });
  const [loading, setLoading] = useState(true);
  
  // Use UIKit theme auto-save
  const { theme, variant, setTheme, setVariant } = useTheme();

  // Load settings and app info on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load extension setting
      const enabled = await storage.get('extensionEnabled', true);
      setExtensionEnabled(enabled);

      // Load app configuration
      const name = await storage.get('app-name', 'Comet Extension');
      const version = await storage.get('app-version', '1.0.0');
      const description = await storage.get('app-description', 'Minimal but powerful Chrome extension framework');
      const author = await storage.get('app-author', 'Comet Framework');
      const website = await storage.get('app-website', '');

      setAppInfo({ name, version, description, author, website });
    } catch (error) {
      console.error('[General Settings] Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExtension = async (enabled) => {
    setExtensionEnabled(enabled);
    try {
      await storage.set('extensionEnabled', enabled);
    } catch (error) {
      console.error('[General Settings] Failed to save setting:', error);
    }
  };

  const themes = [
    { id: 'default', name: 'Default' },
    { id: 'aurora', name: 'Aurora' },
    { id: 'metro', name: 'Metro' },
    { id: 'neon', name: 'Neon' },
    { id: 'ruby', name: 'Ruby' },
    { id: 'studio', name: 'Studio' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-12 bg-muted animate-pulse rounded" />
              <div className="h-12 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{appInfo.name} Settings</h1>
        <p className="text-muted-foreground mt-1">
          {appInfo.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Extension Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Extension Control */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="extension-enabled" className="text-sm font-medium">
                Extension Enabled
              </Label>
              <p className="text-xs text-muted-foreground">
                Master switch for all functionality
              </p>
            </div>
            <Switch
              id="extension-enabled"
              checked={extensionEnabled}
              onCheckedChange={handleToggleExtension}
            />
          </div>

          <Separator />

          {/* Theme Selection - Auto-save */}
          <div className="space-y-3">
            <Label htmlFor="theme-select" className="text-sm font-medium">
              Theme
            </Label>
            <div class="pt-2">
              <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themes.map((themeOption) => (
                  <SelectItem key={themeOption.id} value={themeOption.id}>
                    {themeOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
            
          </div>

          {/* Dark Mode Toggle - Auto-save */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode" className="text-sm font-medium">
                Dark Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Switch between light and dark
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                id="dark-mode"
                checked={variant === 'dark'}
                onCheckedChange={(checked) => setVariant(checked ? 'dark' : 'light')}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <Separator />

          {/* Extension Information */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Extension Information</Label>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Version</span>
                <Badge variant="secondary">{appInfo.version}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Created by</span>
                <Badge variant="outline">{appInfo.author}</Badge>
              </div>

              {appInfo.website && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Website</span>
                  <a 
                    href={appInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Visit
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Extension ID</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {typeof chrome !== 'undefined' ? chrome.runtime.id : 'dev-mode'}
                </code>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}