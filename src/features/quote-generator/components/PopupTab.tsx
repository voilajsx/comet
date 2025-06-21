/**
 * Quote Generator Popup Tab Component
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
import { messaging } from '@voilajsx/comet/messaging';
import { storage } from '@voilajsx/comet/storage';

/**
 * Built-in ActionResult component
 */
function ActionResult({ 
  result, 
  onDismiss, 
  autoDismiss = true, 
  autoDismissDelay = 2000 
}) {
  React.useEffect(() => {
    if (result && autoDismiss && onDismiss) {
      const timer = setTimeout(onDismiss, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [result, autoDismiss, autoDismissDelay, onDismiss]);

  if (!result) return null;

  const Icon = result.type === 'success' ? CheckCircle : AlertCircle;
  const variant = result.type === 'success' ? 'default' : 'destructive';
  const iconColor = result.type === 'success' ? 'text-green-500' : 'text-destructive';

  return (
    <Alert variant={variant} className="border-border">
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <AlertDescription className="text-sm pt-1">
        {result.message}
      </AlertDescription>
    </Alert>
  );
}

export default function QuoteGeneratorTab({ value }) {
  const [isLoading, setIsLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [quoteType, setQuoteType] = useState('general');

  // Load quote type setting on mount
  useEffect(() => {
    loadQuoteType();
  }, []);

  const loadQuoteType = async () => {
    try {
      const type = await storage.get('quoteGenerator.type', 'general');
      setQuoteType(type);
    } catch (error) {
      console.error('[Quote Generator] Failed to load quote type:', error);
    }
  };

  const handleGetQuote = async () => {
    setIsLoading(true);
    setQuoteResult(null);

    try {
      const response = await messaging.sendToContent({
        type: quoteType === 'motivational' ? 'getMotivationalQuote' : 'getQuote',
        data: {}
      });

      if (response?.success && response?.data?.success) {
        // API quote
        setCurrentQuote(response.data.quote);
        setQuoteResult({
          type: 'success',
          message: 'Quote fetched successfully!'
        });
      } else if (response?.data?.fallbackQuote) {
        // Fallback quote
        setCurrentQuote(response.data.fallbackQuote);
        setQuoteResult({
          type: 'success',
          message: 'Showing offline quote'
        });
      } else {
        setQuoteResult({
          type: 'error',
          message: 'Failed to get quote'
        });
      }
    } catch (error) {
      setQuoteResult({
        type: 'error',
        message: 'Could not fetch quote'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getQuoteTypeLabel = () => {
    return quoteType === 'motivational' ? 'Motivational Quote' : 'General Quote';
  };

  const getQuoteTypeDescription = () => {
    return quoteType === 'motivational' 
      ? 'Inspiring and uplifting messages'
      : 'Wisdom and life advice';
  };

  return (
    <TabsContent value={value} className="mt-0">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-card-foreground flex items-center gap-2">
            <Quote className="w-4 h-4" />
            {getQuoteTypeLabel()}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {getQuoteTypeDescription()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <Button
            onClick={handleGetQuote}
            disabled={isLoading}
            className="w-full"
            variant="default"
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

          <ActionResult
            result={quoteResult}
            onDismiss={() => setQuoteResult(null)}
            autoDismiss={true}
            autoDismissDelay={2000}
          />

          {currentQuote && (
            <div className="space-y-3">
              <Separator className="bg-border" />
              
              {/* Quote display */}
              <div className="bg-muted/50 p-4 rounded border border-border">
                <div className="text-sm italic mb-3 text-card-foreground leading-relaxed">
                  "{currentQuote.text}"
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>— {currentQuote.author}</span>
                  <div className="flex items-center gap-2">
                    {currentQuote.category && (
                      <Badge variant="outline" className="text-xs">
                        {currentQuote.category}
                      </Badge>
                    )}
                    {currentQuote.source === 'fallback' && (
                      <Badge variant="secondary" className="text-xs">
                        Offline
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Helper text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Change quote type in settings
            </p>
          </div>
          
        </CardContent>
      </Card>
    </TabsContent>
  );
}