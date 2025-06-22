/**
 * Website Screenshot Options Panel Component
 * @module @voilajsx/comet
 * @file src/features/website-screenshot/components/OptionsPanel.tsx
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Switch } from '@voilajsx/uikit/switch';
import { Label } from '@voilajsx/uikit/label';
import { Camera } from 'lucide-react';
import { storage } from '@voilajsx/comet/storage';

export default function WebsiteScreenshotOptionsPanel() {
  const [isEnabled, setIsEnabled] = useState(true);

  // Load setting on mount
  useEffect(() => {
    loadSetting();
  }, []);

  const loadSetting = async () => {
    try {
      const enabled = await storage.get('websiteScreenshot.enabled', true);
      setIsEnabled(enabled);
    } catch (error) {
      console.error('[Screenshot Options] Failed to load setting:', error);
    }
  };

  const updateEnabled = async (enabled) => {
    setIsEnabled(enabled);
    try {
      await storage.set('websiteScreenshot.enabled', enabled);
    } catch (error) {
      console.error('[Screenshot Options] Failed to save setting:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Website Screenshot Settings</h1>
        <p className="text-muted-foreground mt-1">
          Control screenshot functionality
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Screenshot Feature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="screenshot-enabled" className="text-sm font-medium">
                Enable Screenshot Feature
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow taking screenshots of websites from the popup
              </p>
            </div>
            <Switch
              id="screenshot-enabled"
              checked={isEnabled}
              onCheckedChange={updateEnabled}
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}