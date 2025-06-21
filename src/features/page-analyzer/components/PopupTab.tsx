/**
 * Page Analyzer Popup Tab Component - Updated with Settings Integration
 * @module @voilajsx/comet
 * @file src/features/page-analyzer/components/PopupTab.tsx
 */

import React, { useState, useEffect } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Separator } from '@voilajsx/uikit/separator';
import { FileText, Loader2, AlertTriangle, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';
import { storage } from '@voilajsx/comet/storage';

/**
 * Built-in ActionResult component
 */
function ActionResult({ 
  result, 
  onDismiss, 
  autoDismiss = true, 
  autoDismissDelay = 3000 
}) {
  React.useEffect(() => {
    if (result && autoDismiss && onDismiss) {
      const timer = setTimeout(onDismiss, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [result, autoDismiss, autoDismissDelay, onDismiss]);

  if (!result) return null;

  const getAlertConfig = () => {
    switch (result.type) {
      case 'success':
        return {
          icon: CheckCircle,
          variant: 'default',
          iconColor: 'text-green-500'
        };
      case 'error':
        return {
          icon: AlertCircle,
          variant: 'destructive',
          iconColor: 'text-destructive'
        };
      default:
        return {
          icon: AlertCircle,
          variant: 'default',
          iconColor: 'text-muted-foreground'
        };
    }
  };

  const { icon: Icon, variant, iconColor } = getAlertConfig();

  return (
    <Alert variant={variant} className="border-border">
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <AlertDescription className="text-sm pt-1">
        {result.message}
      </AlertDescription>
    </Alert>
  );
}

export default function PageAnalyzerTab({ value, currentTab }) {
  const [isLoading, setIsLoading] = useState(false);
  const [analyzerResult, setAnalyzerResult] = useState(null);
  const [pageSizeData, setPageSizeData] = useState(null);
  const [settings, setSettings] = useState({
    showDetailedView: true,
    autoAnalyze: false
  });

  const canAnalyze = messaging.isTabSupported(currentTab);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Auto analyze if enabled
  useEffect(() => {
    if (settings.autoAnalyze && canAnalyze && !pageSizeData) {
      handleAnalyzePage();
    }
  }, [settings.autoAnalyze, canAnalyze]);

  const loadSettings = async () => {
    try {
      const showDetailedView = await storage.get('pageAnalyzer.showDetailedView', true);
      const autoAnalyze = await storage.get('pageAnalyzer.autoAnalyze', false);
      setSettings({ showDetailedView, autoAnalyze });
    } catch (error) {
      console.error('[Page Analyzer Popup] Failed to load settings:', error);
    }
  };

  const handleAnalyzePage = async () => {
    if (!canAnalyze) {
      setAnalyzerResult({
        type: 'error',
        message: 'Page analysis not available on this page type'
      });
      return;
    }

    setIsLoading(true);
    setAnalyzerResult(null);

    try {
      const response = await messaging.sendToContent({
        type: 'getPageSize',
        data: {}
      });

      if (response?.success) {
        setPageSizeData(response.data);
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
        message: 'Could not analyze page size'
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
            Page Size Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Analyze Button */}
          <Button
            onClick={handleAnalyzePage}
            disabled={isLoading}
            className="w-full"
            variant={canAnalyze ? 'default' : 'secondary'}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Page Size...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                {canAnalyze ? 'Analyze Page Size' : 'Analysis Not Available'}
              </>
            )}
          </Button>

          {/* Result Status */}
          <ActionResult
            result={analyzerResult}
            onDismiss={() => setAnalyzerResult(null)}
            autoDismiss={true}
            autoDismissDelay={3000}
          />

          {/* Analysis Results */}
          {pageSizeData && (
            <div className="space-y-3 text-sm">
              <Separator className="bg-border" />
              
              {/* Main page size - Always show */}
              <div className="bg-muted/50 p-3 rounded">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{pageSizeData.formatted}</div>
                  <div className="text-xs text-muted-foreground">Total Page Size</div>
                </div>
              </div>

              {/* Detailed breakdown - Show based on settings */}
              {settings.showDetailedView && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-card border border-border rounded">
                      <div className="font-medium text-card-foreground">{Math.round(pageSizeData.htmlBytes / 1024)} KB</div>
                      <div className="text-xs text-muted-foreground">HTML Size</div>
                    </div>
                    <div className="text-center p-2 bg-card border border-border rounded">
                      <div className="font-medium text-card-foreground">{Math.round(pageSizeData.textBytes / 1024)} KB</div>
                      <div className="text-xs text-muted-foreground">Text Content</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-card border border-border rounded">
                      <div className="font-medium text-card-foreground">{pageSizeData.images}</div>
                      <div className="text-xs text-muted-foreground">Images</div>
                    </div>
                    <div className="text-center p-2 bg-card border border-border rounded">
                      <div className="font-medium text-card-foreground">{pageSizeData.links}</div>
                      <div className="text-xs text-muted-foreground">Links</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Auto-analyze status */}
          {settings.autoAnalyze && canAnalyze && (
            <div className="text-center text-xs text-muted-foreground">
              Auto-analyze is enabled
            </div>
          )}

          {/* Unsupported page message */}
          {!canAnalyze && (
            <div className="text-center text-sm text-muted-foreground py-2">
              <AlertTriangle className="w-4 h-4 mx-auto mb-1" />
              Page size analysis not available on this page type
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}