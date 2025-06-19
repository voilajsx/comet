/**
 * Comet Framework - Page analyzer tab component for popup
 * Handles page analysis functionality
 * @module @voilajsx/comet
 * @file src/components/popup/PageAnalyzerTab.tsx
 */

import React, { useState } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Separator } from '@voilajsx/uikit/separator';
import { FileText, Loader2, AlertTriangle } from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';
import ActionResult from '@/components/ActionResult';

interface PageAnalyzerTabProps {
  value: string;
  currentTab: any;
}

export default function PageAnalyzerTab({ value, currentTab }: PageAnalyzerTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analyzerResult, setAnalyzerResult] = useState(null);
  const [pageData, setPageData] = useState(null);

  const canAnalyze = messaging.isTabSupported(currentTab);

  const handleAnalyzePage = async () => {
    if (!canAnalyze) return;

    setIsLoading(true);
    setAnalyzerResult(null);

    try {
      const response = await messaging.sendToContent({
        type: 'getPageData',
        data: {}
      });

      if (response?.success) {
        setPageData(response.data);
        setAnalyzerResult({
          type: 'success',
          message: 'Page analyzed successfully!'
        });
      } else {
        setAnalyzerResult({
          type: 'error',
          message: response?.error || 'Analysis failed'
        });
      }
    } catch (error) {
      setAnalyzerResult({
        type: 'error',
        message: 'Could not analyze page'
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
            <FileText className="w-4 h-4" />
            Page Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleAnalyzePage}
            disabled={!canAnalyze || isLoading}
            className="w-full"
            variant={canAnalyze ? 'default' : 'secondary'}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Analyze Page
              </>
            )}
          </Button>

          <ActionResult
            result={analyzerResult}
            onDismiss={() => setAnalyzerResult(null)}
            autoDismiss={true}
            autoDismissDelay={3000}
          />

          {pageData && (
            <div className="space-y-3 text-sm">
              <Separator className="bg-border" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="font-medium text-card-foreground">Word Count</div>
                  <div className="text-muted-foreground">{pageData.wordCount || 0}</div>
                </div>
                <div>
                  <div className="font-medium text-card-foreground">Page Size</div>
                  <div className="text-muted-foreground">{pageData.pageSize?.formatted || 'Unknown'}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <div className="truncate">Title: {pageData.title}</div>
              </div>
            </div>
          )}

          {!canAnalyze && (
            <div className="text-center text-sm text-muted-foreground py-2">
              <AlertTriangle className="w-4 h-4 mx-auto mb-1" />
              Analysis not available on this page type
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}