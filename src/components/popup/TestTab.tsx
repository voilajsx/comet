/**
 * Comet Framework - Complete Test tab component for popup
 * @module @voilajsx/comet
 * @file src/components/popup/TestTab.tsx
 */

import { useState } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Badge } from '@voilajsx/uikit/badge';
import { Separator } from '@voilajsx/uikit/separator';
import { Switch } from '@voilajsx/uikit/switch';
import { Label } from '@voilajsx/uikit/label';
import { 
  TestTube, 
  Bug, 
  Loader2, 
  ExternalLink, 
  Copy, 
  RefreshCw,
  X,
  Settings,
  Shield,
  Download,
  Bookmark
} from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';

interface TestTabProps {
  value: string;
}

export default function TestTab({ value }: TestTabProps) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testUrl, setTestUrl] = useState('https://github.com');
  const [bypassCache, setBypassCache] = useState(false);
  
  const runTest = async (testType: string, data = {}) => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await messaging.sendToContent({
        type: testType,
        data
      });
      
      setResult({ type: 'success', data: response.data });
    } catch (error: any) {
      setResult({ type: 'error', message: error.message });
    }
    
    setLoading(false);
  };
  
  return (
    <TabsContent value={value} className="mt-0">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-card-foreground flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Platform Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Debug Section */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Debug Tools
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('debugHandlers')}
                disabled={loading}
              >
                Show Handlers
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('testEcho', { test: 'echo message' })}
                disabled={loading}
              >
                Test Echo
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('checkPermissions')}
                disabled={loading}
              >
                <Shield className="w-3 h-3 mr-1" />
                Permissions
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('getExtensionInfo')}
                disabled={loading}
              >
                <Settings className="w-3 h-3 mr-1" />
                Ext Info
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Badge Tests */}
          <div>
            <h4 className="font-medium mb-2">Badge Management</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                size="sm" 
                onClick={() => runTest('testBadge')}
                disabled={loading}
              >
                Set Badge
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('testBadgeColor')}
                disabled={loading}
              >
                Red Color
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('clearBadge')}
                disabled={loading}
              >
                Clear
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Tab Management - Enhanced */}
          <div>
            <h4 className="font-medium mb-2">Tab Management</h4>
            
            {/* URL Input and Open Tab */}
            <div className="space-y-2 mb-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="URL to open" 
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  className="text-xs"
                />
                <Button 
                  size="sm" 
                  onClick={() => runTest('openNewTab', { url: testUrl })}
                  disabled={loading}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open
                </Button>
              </div>
            </div>

            {/* Basic Tab Operations */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('getCurrentTab')}
                disabled={loading}
              >
                Current Tab
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('getAllTabs')}
                disabled={loading}
              >
                All Tabs
              </Button>
            </div>

            {/* Advanced Tab Operations */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('duplicateCurrentTab')}
                disabled={loading}
              >
                <Copy className="w-3 h-3 mr-1" />
                Duplicate
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('reloadCurrentTab', { bypassCache })}
                disabled={loading}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reload
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => {
                  setResult({ 
                    type: 'warning', 
                    message: 'closeTab requires a specific tab ID. Use getCurrentTab first to get the ID.' 
                  });
                }}
                disabled={loading}
              >
                <X className="w-3 h-3 mr-1" />
                Close*
              </Button>
            </div>

            {/* Reload Options */}
            <div className="flex items-center space-x-2 text-xs">
              <Switch
                id="bypass-cache"
                checked={bypassCache}
                onCheckedChange={setBypassCache}
              />
              <Label htmlFor="bypass-cache" className="text-xs">
                Bypass cache on reload
              </Label>
            </div>
          </div>
          
          <Separator />
          
          {/* Storage Tests */}
          <div>
            <h4 className="font-medium mb-2">Storage Operations</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                size="sm" 
                onClick={() => runTest('testStorage')}
                disabled={loading}
              >
                Store Data
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('getStorageUsage')}
                disabled={loading}
              >
                Usage Info
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('clearTestStorage')}
                disabled={loading}
              >
                Clear Test
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* API Tests */}
          <div>
            <h4 className="font-medium mb-2">External APIs</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                onClick={() => runTest('testApiGet')}
                disabled={loading}
              >
                Test GET
              </Button>
              <Button 
                size="sm" 
                onClick={() => runTest('testApiPost')}
                disabled={loading}
              >
                Test POST
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Page Interaction */}
          <div>
            <h4 className="font-medium mb-2">Page Interaction</h4>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button 
                size="sm" 
                onClick={() => runTest('getDetailedPageInfo')}
                disabled={loading}
              >
                Detailed Info
              </Button>
              <Button 
                size="sm" 
                onClick={() => runTest('findElement', { selector: 'h1' })}
                disabled={loading}
              >
                Find H1
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('highlightElements')}
                disabled={loading}
              >
                Highlight
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('removeHighlight')}
                disabled={loading}
              >
                Remove
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* System Features */}
          <div>
            <h4 className="font-medium mb-2">System Features</h4>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button 
                size="sm" 
                onClick={() => runTest('testDownload')}
                disabled={loading}
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
              <Button 
                size="sm" 
                onClick={() => runTest('bookmarkCurrentPage')}
                disabled={loading}
              >
                <Bookmark className="w-3 h-3 mr-1" />
                Bookmark
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('createContextMenu')}
                disabled={loading}
              >
                Context Menu
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('testBroadcast')}
                disabled={loading}
              >
                Broadcast
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Comprehensive Test */}
          <Button 
            onClick={() => runTest('runAllTests')}
            disabled={loading}
            className="w-full"
            variant="default"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
          
          {/* Results Display */}
          {result && (
            <div className="border rounded p-3 bg-muted/50">
              {result.type === 'success' ? (
                <div>
                  <Badge variant="default" className="mb-2">Success</Badge>
                  <div 
                    className="text-xs overflow-auto max-h-32 whitespace-pre-wrap bg-background p-2 rounded border"
                    style={{ fontFamily: 'monospace' }}
                  >
                    {JSON.stringify(result.data, null, 2)}
                  </div>
                </div>
              ) : result.type === 'warning' ? (
                <div>
                  <Badge variant="secondary" className="mb-2">Warning</Badge>
                  <div className="text-yellow-600 text-xs bg-background p-2 rounded border">
                    {result.message}
                  </div>
                </div>
              ) : (
                <div>
                  <Badge variant="destructive" className="mb-2">Error</Badge>
                  <div className="text-destructive text-xs bg-background p-2 rounded border">
                    {result.message}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Helper Text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Tests verify platform functionality. Check console for detailed logs.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              * Close Tab requires a specific tab ID from getCurrentTab or getAllTabs.
            </p>
          </div>
          
        </CardContent>
      </Card>
    </TabsContent>
  );
}