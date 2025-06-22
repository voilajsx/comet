/**
 * Weather Widget Options Panel Component - TypeScript Version
 * @module @voilajsx/comet
 * @file src/features/weather-widget/components/OptionsPanel.tsx
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Switch } from '@voilajsx/uikit/switch';
import { Label } from '@voilajsx/uikit/label';
import { Input } from '@voilajsx/uikit/input';
import { Button } from '@voilajsx/uikit/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@voilajsx/uikit/select';
import { Separator } from '@voilajsx/uikit/separator';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Sun, MapPin, Thermometer, CheckCircle, AlertCircle } from 'lucide-react';
import { storage } from '@voilajsx/comet/storage';

// Type definitions
interface WeatherSettings {
  defaultCity: string;
  useGPS: boolean;
  temperatureUnit: 'celsius' | 'fahrenheit';
}

interface StatusMessage {
  type: 'success' | 'error';
  message: string;
}

/**
 * Status alert component
 */
function StatusAlert({ 
  status, 
  onDismiss 
}: { 
  status: StatusMessage | null; 
  onDismiss: () => void; 
}) {
  useEffect(() => {
    if (status) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, onDismiss]);

  if (!status) return null;

  const Icon = status.type === 'success' ? CheckCircle : AlertCircle;

  return (
    <Alert variant={status.type === 'success' ? 'default' : 'destructive'}>
      <Icon className="h-4 w-4" />
      <AlertDescription>{status.message}</AlertDescription>
    </Alert>
  );
}

export default function WeatherWidgetOptionsPanel() {
  const [settings, setSettings] = useState<WeatherSettings>({
    defaultCity: 'Hyderabad',
    useGPS: true,
    temperatureUnit: 'celsius',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [tempCityInput, setTempCityInput] = useState<string>('');

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const weatherSettings: WeatherSettings = {
        defaultCity: await storage.get('weatherWidget.defaultCity', 'Hyderabad'),
        useGPS: await storage.get('weatherWidget.useGPS', true),
        temperatureUnit: await storage.get('weatherWidget.temperatureUnit', 'celsius'),
      };
      
      setSettings(weatherSettings);
      setTempCityInput(weatherSettings.defaultCity);
    } catch (error: unknown) {
      console.error('[Weather Options] Failed to load settings:', error);
      setStatus({
        type: 'error',
        message: 'Failed to load settings'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (): Promise<void> => {
    try {
      setSaving(true);
      
      // Validate city input
      const cityToSave = tempCityInput.trim();
      if (!cityToSave) {
        setStatus({
          type: 'error',
          message: 'City name cannot be empty'
        });
        return;
      }

      const updatedSettings = {
        ...settings,
        defaultCity: cityToSave,
      };

      // Save all settings
      await storage.set('weatherWidget.defaultCity', updatedSettings.defaultCity);
      await storage.set('weatherWidget.useGPS', updatedSettings.useGPS);
      await storage.set('weatherWidget.temperatureUnit', updatedSettings.temperatureUnit);

      setSettings(updatedSettings);
      setStatus({
        type: 'success',
        message: 'Settings saved successfully!'
      });
    } catch (error: unknown) {
      console.error('[Weather Options] Failed to save settings:', error);
      setStatus({
        type: 'error',
        message: 'Failed to save settings'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = async <K extends keyof WeatherSettings>(
    key: K, 
    value: WeatherSettings[K]
  ): Promise<void> => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await storage.set(`weatherWidget.${key}`, value);
    } catch (error: unknown) {
      console.error(`[Weather Options] Failed to save ${key}:`, error);
      setStatus({
        type: 'error',
        message: `Failed to save ${key} setting`
      });
    }
  };

  const resetToDefaults = async (): Promise<void> => {
    try {
      setSaving(true);
      
      const defaultSettings: WeatherSettings = {
        defaultCity: 'Hyderabad',
        useGPS: true,
        temperatureUnit: 'celsius',
      };

      // Save defaults
      await storage.set('weatherWidget.defaultCity', defaultSettings.defaultCity);
      await storage.set('weatherWidget.useGPS', defaultSettings.useGPS);
      await storage.set('weatherWidget.temperatureUnit', defaultSettings.temperatureUnit);

      setSettings(defaultSettings);
      setTempCityInput(defaultSettings.defaultCity);
      
      setStatus({
        type: 'success',
        message: 'Settings reset to defaults'
      });
    } catch (error: unknown) {
      console.error('[Weather Options] Failed to reset settings:', error);
      setStatus({
        type: 'error',
        message: 'Failed to reset settings'
      });
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-2xl font-bold">Weather Widget Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure weather information display and location preferences
        </p>
      </div>

      {/* Status Alert */}
      <StatusAlert 
        status={status} 
        onDismiss={() => setStatus(null)} 
      />

      {/* Location Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* GPS Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="use-gps" className="text-sm font-medium">
                Use GPS Location
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically detect your location for weather
              </p>
            </div>
            <Switch
              id="use-gps"
              checked={settings.useGPS}
              onCheckedChange={(checked) => updateSetting('useGPS', checked)}
            />
          </div>

          <Separator />

          {/* Default City */}
          <div className="space-y-3">
            <Label htmlFor="default-city" className="text-sm font-medium">
              Default City
            </Label>
            <p className="text-xs text-muted-foreground">
              Fallback city when GPS is unavailable or disabled
            </p>
            <div className="flex gap-2">
              <Input
                id="default-city"
                value={tempCityInput}
                onChange={(e) => setTempCityInput(e.target.value)}
                placeholder="Enter city name"
                className="flex-1"
              />
              <Button 
                onClick={saveSettings} 
                disabled={saving || tempCityInput.trim() === settings.defaultCity}
                size="sm"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Temperature Unit */}
          <div className="space-y-3">
            <Label htmlFor="temperature-unit" className="text-sm font-medium">
              Temperature Unit
            </Label>
            <Select 
              value={settings.temperatureUnit} 
              onValueChange={(value: 'celsius' | 'fahrenheit') => updateSetting('temperatureUnit', value)}
            >
              <SelectTrigger id="temperature-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="celsius">
                  <div>
                    <div className="font-medium">Celsius (°C)</div>
                    <div className="text-xs text-muted-foreground">
                      Metric temperature scale
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="fahrenheit">
                  <div>
                    <div className="font-medium">Fahrenheit (°F)</div>
                    <div className="text-xs text-muted-foreground">
                      Imperial temperature scale
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5" />
            Advanced
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Reset to Defaults</Label>
              <p className="text-xs text-muted-foreground">
                Restore all settings to their default values
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={resetToDefaults}
              disabled={saving}
              size="sm"
            >
              {saving ? 'Resetting...' : 'Reset'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}