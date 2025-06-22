/**
 * Quote Generator Popup Tab - Improved TypeScript Version
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
import { getQuote, getMotivationalQuote } from '../index.ts';

// Type definitions
interface QuoteData {
  text: string;
  author: string;
  category: 'advice' | 'wisdom' | 'motivational';
  source: 'api' | 'fallback';
  timestamp: number;
}

interface StatusResult {
  type: 'success' | 'error';
  message: string;
}

interface PopupTabProps {
  value: string;
  currentTab?: chrome.tabs.Tab;
}

interface QuoteTypeConfig {
  title: string;
  desc: string;
  buttonText: string;
}

type QuoteType = 'general' | 'motivational';

/**
 * Status alert component with auto-dismiss
 */
function StatusAlert({ 
  result, 
  onDismiss,
  autoHide = true,
  hideDelay = 2000 
}: {
  result: StatusResult | null;
  onDismiss: () => void;
  autoHide?: boolean;
  hideDelay?: number;
}) {
  useEffect(() => {
    if (result && autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, hideDelay);
      return () => clearTimeout(timer);
    }
  }, [result, onDismiss, autoHide, hideDelay]);

  if (!result) return null;

  const Icon = result.type === 'success' ? CheckCircle : AlertCircle;

  return (
    <Alert variant={result.type === 'success' ? 'default' : 'destructive'}>
      <Icon className="h-4 w-4" />
      <AlertDescription>{result.message}</AlertDescription>
    </Alert>
  );
}

/**
 * Quote display component
 */
function QuoteDisplay({ quote }: { quote: QuoteData }) {
  return (
    <div className="space-y-3">
      <Separator />
      
      <div className="bg-muted/50 p-4 rounded border">
        <div className="text-sm italic mb-3 leading-relaxed">
          "{quote.text}"
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>— {quote.author}</span>
          <div className="flex gap-2">
            <Badge variant="outline">
              {quote.category}
            </Badge>
            <Badge variant={quote.source === 'api' ? 'default' : 'secondary'}>
              {quote.source === 'api' ? 'Live' : 'Offline'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuoteGeneratorTab({ value, currentTab }: PopupTabProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusResult | null>(null);
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(null);
  const [quoteType, setQuoteType] = useState<QuoteType>('general');

  // Load quote type setting on mount
  useEffect(() => {
    loadQuoteType();
  }, []);

  const loadQuoteType = async (): Promise<void> => {
    try {
      const type = await storage.get('quoteGenerator.type', 'general') as QuoteType;
      setQuoteType(type);
    } catch (error: unknown) {
      console.warn('[Quote PopupTab] Failed to load quote type:', error);
      setQuoteType('general');
    }
  };

  const handleGetQuote = async (): Promise<void> => {
    console.log('[Quote PopupTab] 🚀 Getting quote, type:', quoteType);
    
    setIsLoading(true);
    setStatus(null);

    try {
      // ✅ DIRECT FUNCTION CALL - No complex messaging!
      const quote: QuoteData = quoteType === 'motivational' 
        ? await getMotivationalQuote()
        : await getQuote();

      console.log('[Quote PopupTab] ✅ Quote received:', quote);
      
      setCurrentQuote(quote);
      setStatus({
        type: 'success',
        message: quote.source === 'api' ? 'Fresh quote fetched!' : 'Offline quote loaded'
      });

    } catch (error: unknown) {
      console.error('[Quote PopupTab] ❌ Error:', error);
      setStatus({
        type: 'error',
        message: 'Failed to get quote. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quote type configuration
  const quoteTypeConfig: Record<QuoteType, QuoteTypeConfig> = {
    general: { 
      title: 'General Quote', 
      desc: 'Wisdom and life advice',
      buttonText: 'Get Wisdom Quote'
    },
    motivational: { 
      title: 'Motivational Quote', 
      desc: 'Inspiring messages for motivation',
      buttonText: 'Get Motivational Quote'
    }
  };

  const currentConfig = quoteTypeConfig[quoteType];

  return (
    <TabsContent value={value}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Quote className="w-4 h-4" />
            {currentConfig.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{currentConfig.desc}</p>
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
                {currentConfig.buttonText}
              </>
            )}
          </Button>

          {/* Status Alert */}
          <StatusAlert 
            result={status} 
            onDismiss={() => setStatus(null)}
            autoHide={true}
            hideDelay={3000}
          />

          {/* Quote Display */}
          {currentQuote && <QuoteDisplay quote={currentQuote} />}

          {/* Helper text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Change quote type in extension settings
            </p>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}