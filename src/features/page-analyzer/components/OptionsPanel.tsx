/**
 * Page Analyzer Options Panel Component - Minimal Version
 * @module @voilajsx/comet
 * @file src/features/page-analyzer/components/OptionsPanel.tsx
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Switch } from '@voilajsx/uikit/switch';
import { Label } from '@voilajsx/uikit/label';
import { FileText } from 'lucide-react';
import { storage } from '@voilajsx/comet/storage';

export default function PageAnalyzerOptionsPanel() {
  const [settings, setSettings] = useState({
    showDetailedView: true,
    autoAnalyze: false
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const analyzerSettings = {
        showDetailedView: await storage.get('pageAnalyzer.showDetailedView', true),
        autoAnalyze: await storage.get('pageAnalyzer.autoAnalyze', false)
      };
      setSettings(analyzerSettings);
    } catch (error) {
      console.error('[Page Analyzer Options] Failed to load settings:', error);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await storage.set(`pageAnalyzer.${key}`, value);
    } catch (error) {
      console.error('[Page Analyzer Options] Failed to save setting:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Page Analyzer Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure how page analysis is displayed and behaves
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Display & Behavior
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Detailed View Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-detailed-view" className="text-sm font-medium">
                Show Detailed View
              </Label>
              <p className="text-xs text-muted-foreground">
                Display breakdown of HTML, text, images, and links
              </p>
            </div>
            <Switch
              id="show-detailed-view"
              checked={settings.showDetailedView}
              onCheckedChange={(checked) => updateSetting('showDetailedView', checked)}
            />
          </div>

          {/* Auto Analyze Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-analyze" className="text-sm font-medium">
                Auto Analyze Pages
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically analyze page size when visiting new pages
              </p>
            </div>
            <Switch
              id="auto-analyze"
              checked={settings.autoAnalyze}
              onCheckedChange={(checked) => updateSetting('autoAnalyze', checked)}
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}