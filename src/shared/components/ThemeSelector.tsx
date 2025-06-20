/**
 * Theme Selector Component - UIKit theme picker
 * @module @voilajsx/comet
 * @file src/shared/components/ThemeSelector.tsx
 */

import React from 'react';
import { useTheme } from '@voilajsx/uikit/theme-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@voilajsx/uikit/select';
import { Switch } from '@voilajsx/uikit/switch';
import { Label } from '@voilajsx/uikit/label';
import { Palette, Sun, Moon } from 'lucide-react';

interface ThemeSelectorProps {
  showLabel?: boolean;
  showDarkToggle?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Theme selector component using UIKit themes
 * Provides theme selection and dark mode toggle
 */
export default function ThemeSelector({
  showLabel = true,
  showDarkToggle = true,
  compact = false,
  className = ''
}: ThemeSelectorProps) {
  const { theme, variant, setTheme, setVariant } = useTheme();

  const themes = [
    { id: 'default', name: 'Default', description: 'Ocean blue professional' },
    { id: 'aurora', name: 'Aurora', description: 'Purple-green gradients' },
    { id: 'metro', name: 'Metro', description: 'Clean gray-blue' },
    { id: 'neon', name: 'Neon', description: 'Electric cyberpunk' },
    { id: 'ruby', name: 'Ruby', description: 'Red with gold accents' },
    { id: 'studio', name: 'Studio', description: 'Designer grays' },
  ];

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-32">
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
        
        {showDarkToggle && (
          <Switch
            checked={variant === 'dark'}
            onCheckedChange={(checked) => setVariant(checked ? 'dark' : 'light')}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Theme Settings</Label>
        </div>
      )}

      {/* Theme Selection */}
      <div className="space-y-2">
        <Label htmlFor="theme-select" className="text-sm">
          Color Theme
        </Label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger id="theme-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {themes.map((themeOption) => (
              <SelectItem key={themeOption.id} value={themeOption.id}>
                <div>
                  <div className="font-medium">{themeOption.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {themeOption.description}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dark Mode Toggle */}
      {showDarkToggle && (
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="dark-mode" className="text-sm font-medium">
              Dark Mode
            </Label>
            <p className="text-xs text-muted-foreground">
              Switch between light and dark appearance
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
      )}
    </div>
  );
}