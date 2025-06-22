/**
 * Website Screenshot Feature Module - No Service Worker Required
 * @module @voilajsx/comet
 * @file src/features/website-screenshot/index.ts
 */

import type { ModuleConfig } from '@/featuretypes';

// Type definitions for this feature
interface ScreenshotResult {
  message: string;
  timestamp?: number;
  url?: string;
}

interface ScreenshotOptions {
  format?: 'jpeg' | 'png';
  quality?: number;
  fromSurface?: boolean;
}

// 📋 METADATA & CONFIGURATION
const config: ModuleConfig = {
  name: 'websiteScreenshot',

  // 🎨 UI Auto-Discovery Configuration
  ui: {
    popup: {
      tab: {
        label: 'Screenshot',
        icon: 'Camera',
        order: 3,
        requiresTab: true,
        description: 'Take a screenshot of the current page',
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        label: 'Website Screenshot',
        icon: 'Camera',
        section: 'features',
        order: 4,
        description: 'Configure screenshot settings and preferences',
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  // ⚙️ Settings Schema
  settings: {
    enabled: {
      key: 'websiteScreenshot.enabled',
      default: true,
      type: 'boolean',
      label: 'Enable Screenshot Feature',
      description: 'Allow taking screenshots of websites',
    },
    format: {
      key: 'websiteScreenshot.format',
      default: 'png',
      type: 'select',
      label: 'Screenshot Format',
      description: 'Image format for saved screenshots',
      options: [
        { value: 'png', label: 'PNG (High Quality)' },
        { value: 'jpeg', label: 'JPEG (Smaller Size)' },
      ],
    },
    quality: {
      key: 'websiteScreenshot.quality',
      default: 90,
      type: 'number',
      label: 'JPEG Quality',
      description: 'Quality setting for JPEG screenshots (1-100)',
    },
    autoDownload: {
      key: 'websiteScreenshot.autoDownload',
      default: true,
      type: 'boolean',
      label: 'Auto Download',
      description: 'Automatically download screenshots after capture',
    },
  },

  // ℹ️ Feature Metadata
  meta: {
    name: 'Website Screenshot',
    description: 'Capture screenshots of websites using Chrome\'s native API',
    version: '1.0.0',
    permissions: ['activeTab'],
    author: 'Comet Framework',
    category: 'utility',
    tags: ['screenshot', 'capture', 'image'],
  },

  // 🔧 BUSINESS LOGIC & HANDLERS
  handlers: {
    takeScreenshot: (data?: ScreenshotOptions): Promise<ScreenshotResult> => takeScreenshot(data),
    getScreenshotStatus: (): ScreenshotResult => ({ message: 'Screenshot feature ready' }),
  },

  // Main action
  mainAction: (): ScreenshotResult => ({ 
    message: 'Screenshot feature ready',
    timestamp: Date.now(),
  }),

  // Feature initialization
  init: (): void => {
    console.log('[Website Screenshot] No-background feature initialized');
  },

  // Lifecycle hooks
  lifecycle: {
    onEnable: (): void => {
      console.log('[Website Screenshot] Feature enabled');
    },
    onDisable: (): void => {
      console.log('[Website Screenshot] Feature disabled');
    },
    onSettingsChange: (changedSettings: any): void => {
      console.log('[Website Screenshot] Settings changed:', changedSettings);
    },
  },
};

// 🚀 SCREENSHOT FUNCTIONS (Chrome API Direct)

/**
 * Take screenshot using Chrome's native captureVisibleTab API
 */
export async function takeScreenshot(options: ScreenshotOptions = {}): Promise<ScreenshotResult> {
  try {
    // Check if Chrome APIs are available
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      throw new Error('Chrome extension APIs not available');
    }

    console.log('[Screenshot] 📸 Taking screenshot with options:', options);

    // Get current active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!activeTab || !activeTab.id) {
      throw new Error('No active tab found');
    }

    // Prepare capture options
    const captureOptions: chrome.tabs.CaptureVisibleTabOptions = {
      format: options.format || 'png',
      quality: options.quality || 90,
    };

    // Capture the visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(
      activeTab.windowId,
      captureOptions
    );

    console.log('[Screenshot] ✅ Screenshot captured successfully');

    return {
      message: 'Screenshot captured successfully',
      timestamp: Date.now(),
      url: activeTab.url,
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Screenshot] ❌ Failed to take screenshot:', errorMessage);
    
    throw new Error(`Screenshot failed: ${errorMessage}`);
  }
}

/**
 * Download screenshot with generated filename
 */
export function downloadScreenshot(dataUrl: string, filename?: string): void {
  try {
    // Generate filename if not provided
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const finalFilename = filename || `screenshot-${timestamp}.png`;

    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = finalFilename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('[Screenshot] ⬇️ Download triggered:', finalFilename);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Screenshot] ❌ Download failed:', errorMessage);
    throw new Error(`Download failed: ${errorMessage}`);
  }
}

/**
 * Get screenshot blob from data URL
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Copy screenshot to clipboard
 */
export async function copyToClipboard(dataUrl: string): Promise<void> {
  try {
    const blob = dataUrlToBlob(dataUrl);
    const item = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
    
    console.log('[Screenshot] 📋 Copied to clipboard');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Screenshot] ❌ Clipboard copy failed:', errorMessage);
    throw new Error(`Clipboard copy failed: ${errorMessage}`);
  }
}

// Export the feature module
export default config;