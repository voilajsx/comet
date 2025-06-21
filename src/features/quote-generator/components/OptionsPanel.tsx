/**
 * Quote Generator Options Panel Component
 * @module @voilajsx/comet
 * @file src/features/quote-generator/components/OptionsPanel.tsx
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Label } from '@voilajsx/uikit/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@voilajsx/uikit/select';
import { Quote } from 'lucide-react';
import { storage } from '@voilajsx/comet/storage';

export default function QuoteGeneratorOptionsPanel() {
  const [quoteType, setQuoteType] = useState('general');

  // Load setting on mount
  useEffect(() => {
    loadSetting();
  }, []);

  const loadSetting = async () => {
    try {
      const type = await storage.get('quoteGenerator.type', 'general');
      setQuoteType(type);
    } catch (error) {
      console.error('[Quote Generator Options] Failed to load setting:', error);
    }
  };

  const updateQuoteType = async (type) => {
    setQuoteType(type);
    try {
      await storage.set('quoteGenerator.type', type);
    } catch (error) {
      console.error('[Quote Generator Options] Failed to save setting:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quote Generator Settings</h1>
        <p className="text-muted-foreground mt-1">
          Choose the type of quotes you want to see
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="w-5 h-5" />
            Quote Type
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select your preferred quote category
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="quote-type-select" className="text-base font-medium">
              Quote Category
            </Label>
            <Select value={quoteType} onValueChange={updateQuoteType}>
              <SelectTrigger id="quote-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">
                  <div>
                    <div className="font-medium">General Quotes</div>
                    <div className="text-xs text-muted-foreground">
                      Wisdom and life advice
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="motivational">
                  <div>
                    <div className="font-medium">Motivational Quotes</div>
                    <div className="text-xs text-muted-foreground">
                      Inspiring and uplifting messages
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}