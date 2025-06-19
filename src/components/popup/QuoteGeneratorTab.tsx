/**
 * Comet Framework - Quote generator tab component for popup
 * Handles quote generation functionality (auth required)
 * @module @voilajsx/comet
 * @file src/components/popup/QuoteGeneratorTab.tsx
 */

import React, { useState } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';
import { Separator } from '@voilajsx/uikit/separator';
import { Quote, Loader2, User, LogIn } from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';
import { useAuth } from '@/hooks/useAuth';
import ActionResult from '@/components/ActionResult';

interface QuoteGeneratorTabProps {
  value: string;
}

export default function QuoteGeneratorTab({ value }: QuoteGeneratorTabProps) {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(null);

  const handleGetQuote = async () => {
    setIsLoading(true);
    setQuoteResult(null);

    try {
      const response = await messaging.sendToContent({
        type: 'getQuote',
        data: {}
      });

      if (response?.success && response?.data?.success) {
        setCurrentQuote(response.data.quote);
        setQuoteResult({
          type: 'success',
          message: 'Quote fetched successfully!'
        });
      } else {
        setQuoteResult({
          type: 'error',
          message: response?.data?.error || 'Failed to get quote'
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

  return (
    <TabsContent value={value} className="mt-0">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-card-foreground flex items-center gap-2">
            <Quote className="w-4 h-4" />
            Inspirational Quotes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {!isAuthenticated ? (
            // Show login required message - no quote functionality
            <div className="text-center py-6">
              <Quote className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">
                Authentication Required
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sign in to access inspirational quotes and personalized content
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground border border-dashed rounded py-2">
                <LogIn className="w-3 h-3" />
                <span>Visit the Account tab to sign in</span>
              </div>
            </div>
          ) : (
            // Show quote functionality only for authenticated users
            <>
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
                    <Quote className="w-4 h-4 mr-2" />
                    Get Inspirational Quote
                  </>
                )}
              </Button>

              <ActionResult
                result={quoteResult}
                onDismiss={() => setQuoteResult(null)}
                autoDismiss={true}
                autoDismissDelay={3000}
              />

              {currentQuote && (
                <div className="space-y-3">
                  <Separator className="bg-border" />
                  <div className="bg-muted/50 p-3 rounded text-sm">
                    <div className="italic mb-2 text-card-foreground">"{currentQuote.text}"</div>
                    <div className="text-muted-foreground text-xs">— {currentQuote.author}</div>
                    <Badge variant="default" className="mt-2 text-xs">Premium Member</Badge>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}