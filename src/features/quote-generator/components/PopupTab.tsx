/**
 * Quote Generator Popup Tab - Simplified with Direct Imports
 * @module @voilajsx/comet
 * @file src/features/quote-generator/components/PopupTab.tsx
 */

import React, { useState, useEffect } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Separator } from '@voilajsx/uikit/separator';
import { Badge } from '@voilajsx/uikit/badge';
import { Quote, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { storage } from '@voilajsx/comet/storage';

// ✅ DIRECT IMPORTS - Simple and clean!
import { getQuote, getMotivationalQuote } from '../index.js';

/**
 * Status alert component
 */
function StatusAlert({ result, onDismiss }) {
  React.useEffect(() => {
    if (result && onDismiss) {
      const timer = setTimeout(onDismiss, 2000);
      return () => clearTimeout(timer);
    }
  }, [result, onDismiss]);

  if (!result) return null;

  const Icon = result.type === 'success' ? CheckCircle : AlertCircle;
  const variant = result.type === 'success' ? 'default' : 'destructive';

  return (
    <Alert variant={variant}>
      <Icon className="h-4 w-4" />
      <AlertDescription>{result.message}</AlertDescription>
    </Alert>
  );
}

export default function QuoteGeneratorTab({ value }) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [quoteType, setQuoteType] = useState('general');

  // Load quote type setting
  useEffect(() => {
    storage.get('quoteGenerator.type', 'general').then(setQuoteType);
  }, []);

  const handleGetQuote = async () => {
    console.log('[Quote PopupTab] 🚀 Getting quote, type:', quoteType);
    
    setIsLoading(true);
    setStatus(null);

    try {
      // ✅ DIRECT FUNCTION CALL - No complex messaging!
      const quote = quoteType === 'motivational' 
        ? await getMotivationalQuote()
        : await getQuote();

      console.log('[Quote PopupTab] ✅ Quote received:', quote);
      
      setCurrentQuote(quote);
      setStatus({
        type: 'success',
        message: quote.source === 'api' ? 'Quote fetched!' : 'Offline quote'
      });

    } catch (error) {
      console.error('[Quote PopupTab] ❌ Error:', error);
      setStatus({
        type: 'error',
        message: 'Failed to get quote'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const labels = {
    general: { title: 'General Quote', desc: 'Wisdom and life advice' },
    motivational: { title: 'Motivational Quote', desc: 'Inspiring messages' }
  };

  const current = labels[quoteType] || labels.general;

  return (
    <TabsContent value={value} className="mt-0">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Quote className="w-4 h-4" />
            {current.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{current.desc}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Get Quote Button */}
          <Button
            onClick={handleGetQuote}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting Quote...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Get New Quote
              </>
            )}
          </Button>

          {/* Status */}
          <StatusAlert 
            result={status} 
            onDismiss={() => setStatus(null)} 
          />

          {/* Quote Display */}
          {currentQuote && (
            <div className="space-y-3">
              <Separator />
              
              <div className="bg-muted/50 p-4 rounded border">
                <div className="text-sm italic mb-3 leading-relaxed">
                  "{currentQuote.text}"
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>— {currentQuote.author}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {currentQuote.category}
                    </Badge>
                    <Badge 
                      variant={currentQuote.source === 'api' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {currentQuote.source === 'api' ? 'Live' : 'Offline'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Helper text */}
          <p className="text-center text-xs text-muted-foreground">
            Change quote type in settings
          </p>
        </CardContent>
      </Card>
    </TabsContent>
  );
}