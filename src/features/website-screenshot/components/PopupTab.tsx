/**
 * Website Screenshot Popup Tab - Direct Chrome API (No Service Worker)
 * @module @voilajsx/comet
 * @file src/features/website-screenshot/components/PopupTab.tsx
 */

import React, { useState } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Camera, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';
import { storage } from '@voilajsx/comet/storage';

export default function WebsiteScreenshotTab({ value, currentTab }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [result, setResult] = useState(null);
  const [screenshotData, setScreenshotData] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);

  const canCapture = messaging.isTabSupported(currentTab) && isEnabled;

  // Load feature enabled state
  React.useEffect(() => {
    loadEnabledState();
  }, []);

  const loadEnabledState = async () => {
    try {
      const enabled = await storage.get('websiteScreenshot.enabled', true);
      setIsEnabled(enabled);
    } catch (error) {
      console.error('[Screenshot] Failed to load enabled state:', error);
    }
  };

  const handleTakeScreenshot = async () => {
    if (!messaging.isTabSupported(currentTab)) {
      setResult({ type: 'error', message: 'Screenshots not available on this page' });
      return;
    }

    if (!isEnabled) {
      setResult({ type: 'error', message: 'Screenshot feature is disabled' });
      return;
    }

    setIsCapturing(true);
    setResult(null);

    try {
      // Direct Chrome API call from popup
      const dataUrl = await new Promise((resolve, reject) => {
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(dataUrl);
          }
        });
      });

      // Calculate file size
      const base64Data = dataUrl.split(',')[1];
      const sizeInBytes = Math.round((base64Data.length * 3) / 4);
      
      const data = {
        dataUrl: dataUrl,
        filename: `screenshot-${Date.now()}.png`,
        size: sizeInBytes,
        timestamp: Date.now()
      };

      setScreenshotData(data);
      setResult({ type: 'success', message: 'Screenshot captured!' });

    } catch (error) {
      console.error('[Screenshot] Capture failed:', error);
      setResult({ 
        type: 'error', 
        message: error.message || 'Could not take screenshot' 
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownload = () => {
    if (!screenshotData?.dataUrl) return;
    
    try {
      // Simple download using anchor tag
      const link = document.createElement('a');
      link.href = screenshotData.dataUrl;
      link.download = screenshotData.filename || 'screenshot.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setResult({ type: 'success', message: 'Download started!' });
    } catch (error) {
      setResult({ type: 'error', message: 'Download failed' });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <TabsContent value={value} className="mt-0">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Screenshot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Take Screenshot Button */}
          <Button
            onClick={handleTakeScreenshot}
            disabled={isCapturing || !messaging.isTabSupported(currentTab) || !isEnabled}
            className="w-full"
          >
            {isCapturing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Taking Screenshot...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                {!isEnabled ? 'Feature Disabled' : 
                 !messaging.isTabSupported(currentTab) ? 'Not Available' : 
                 'Take Screenshot'}
              </>
            )}
          </Button>

          {/* Status Message */}
          {result && (
            <Alert variant={result.type === 'error' ? 'destructive' : 'default'}>
              {result.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          {/* Screenshot Info & Download */}
          {screenshotData && (
            <div className="space-y-3">
              <div className="bg-muted/50 p-3 rounded text-center">
                <Camera className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-sm font-medium">Screenshot Ready</div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(screenshotData.size)} • PNG
                </div>
              </div>

              <Button
                onClick={handleDownload}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Screenshot
              </Button>
            </div>
          )}

          {/* Not supported/disabled message */}
          {(!messaging.isTabSupported(currentTab) || !isEnabled) && (
            <div className="text-center text-sm text-muted-foreground py-2">
              <AlertCircle className="w-4 h-4 mx-auto mb-1" />
              {!isEnabled ? 'Screenshot feature disabled in settings' : 
               'Screenshots not available on extension pages'}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}