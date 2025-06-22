/**
 * Comet Framework - Essential Service Worker (Fixed API Version)
 * @module @voilajsx/comet
 * @file src/platform/service-worker.ts
 */

import { storage } from './storage.ts';

// Type definitions
interface MessageHandler {
  (data: any, sender?: chrome.runtime.MessageSender): Promise<any> | any;
}

interface InstallDetails {
  reason: chrome.runtime.OnInstalledReason;
  previousVersion?: string;
  id?: string;
}

interface MessageRequest {
  type: string;
  data?: any;
  id?: number;
  timestamp?: number;
}

interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
  id?: number;
  availableHandlers?: string[];
}

interface FetchRequestData {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timeout: number;
}

interface FetchResponse {
  success: boolean;
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  error?: string;
  isTimeout?: boolean;
  isNetworkError?: boolean;
  isCorsError?: boolean;
}

interface ExtensionInfo {
  id: string;
  version: string;
  manifest: chrome.runtime.Manifest;
  initialized: boolean;
  browser: BrowserInfo;
}

interface BrowserInfo {
  type: string;
  api: string;
}

// Cross-browser API detection
const browserAPI = (() => {
  if (typeof browser !== 'undefined') {
    return browser;
  } else if (typeof chrome !== 'undefined') {
    return chrome;
  } else {
    throw new Error('No browser extension API available');
  }
})();

/**
 * Essential Comet Service Worker Manager
 * Only the core features most extensions actually need
 */
class CometServiceWorkerManager {
  private api: typeof chrome | typeof browser;
  private extensionId: string;
  private version: string;
  private messageHandlers: Map<string, MessageHandler>;
  private isInitialized: boolean;

  constructor() {
    this.api = browserAPI;
    this.extensionId = this.api.runtime.id;
    this.version = this.api.runtime.getManifest().version;
    this.messageHandlers = new Map();
    this.isInitialized = false;

    this.setupEventListeners();
    this.initialize();
  }

  setupEventListeners(): void {
    // Extension lifecycle
    this.api.runtime.onInstalled.addListener((details: InstallDetails) => {
      this.handleInstallation(details);
    });

    // Message handling
    this.api.runtime.onMessage.addListener((message: MessageRequest, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log(`[Comet Platform] Service worker v${this.version} initialized`);

    try {
      this.setupDefaultHandlers();
      this.isInitialized = true;
    } catch (error: unknown) {
      console.error(
        '[Comet Platform] Service worker initialization failed:',
        error
      );
    }
  }

  setupDefaultHandlers(): void {
    // Storage operations - proxy to storage utility
    this.registerMessageHandler('storage.get', async (data: any) => {
      return await storage.get(data.keys, data.fallback);
    });

    this.registerMessageHandler('storage.set', async (data: any) => {
      return await storage.set(data.items || data);
    });

    this.registerMessageHandler('storage.remove', async (data: any) => {
      return await storage.remove(data.keys);
    });

    this.registerMessageHandler('storage.clear', async () => {
      return await storage.clear();
    });

    // Basic tabs operations - most common needs
    this.registerMessageHandler('tabs.query', async (data: any) => {
      try {
        const tabs = await this.api.tabs.query(data || {});
        return tabs; // Return tabs directly
      } catch (error: unknown) {
        throw error;
      }
    });

    this.registerMessageHandler('tabs.getCurrent', async () => {
      try {
        const tabs = await this.api.tabs.query({
          active: true,
          currentWindow: true,
        });
        return tabs[0] || null;
      } catch (error: unknown) {
        throw error;
      }
    });

    // Badge operations - very common for status display
    this.registerMessageHandler('badge.setText', async (data: any) => {
      try {
        if (!this.api.action) return false;

        const options: chrome.action.BadgeTextDetails = { text: String(data.text || '') };
        if (data.tabId) options.tabId = data.tabId;

        await this.api.action.setBadgeText(options);
        return true;
      } catch (error: unknown) {
        console.error('[Comet Platform] Badge setText failed:', error);
        return false;
      }
    });

    this.registerMessageHandler('badge.setColor', async (data: any) => {
      try {
        if (!this.api.action) return false;

        const options: chrome.action.BadgeBackgroundColorDetails = { color: data.color };
        if (data.tabId) options.tabId = data.tabId;

        await this.api.action.setBadgeBackgroundColor(options);
        return true;
      } catch (error: unknown) {
        console.error('[Comet Platform] Badge setColor failed:', error);
        return false;
      }
    });

    // Universal API proxy - solves CORS issues (SIMPLE VERSION)
    this.registerMessageHandler('api.fetch', async (data: FetchRequestData) => {
      return await this.universalApiFetch(data);
    });

    // Extension info
    this.registerMessageHandler('extension.getInfo', async () => {
      return {
        id: this.extensionId,
        version: this.version,
        manifest: this.api.runtime.getManifest(),
      };
    });
  }

  /**
   * Proper Universal API fetch handler with CORS and detailed logging
   */
  async universalApiFetch({
    url,
    method = 'GET',
    headers = {},
    body = null,
    timeout = 15000,
  }: FetchRequestData): Promise<FetchResponse> {
    console.log(`[API] 🚀 Starting ${method} ${url}`);
    console.log(`[API] 📋 Headers:`, headers);
    console.log(`[API] 📦 Body:`, body);

    let controller: AbortController | null = null;
    let timeoutId: number | null = null;

    try {
      // Create abort controller for timeout
      controller = new AbortController();

      // Set up timeout
      timeoutId = setTimeout(() => {
        console.log(`[API] ⏰ Request timeout after ${timeout}ms`);
        controller!.abort();
      }, timeout);

      // CORS-friendly headers
      const fetchOptions: RequestInit = {
        method: method.toUpperCase(),
        headers: {
          // Essential headers for CORS
          Accept: 'application/json, text/plain, */*',
          'Cache-Control': 'no-cache',

          // Only add Content-Type for body requests to avoid preflight
          ...(body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
            ? { 'Content-Type': 'application/json' }
            : {}),

          // User provided headers (can override defaults)
          ...headers,
        },
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit', // No credentials to avoid preflight
        redirect: 'follow',
      };

      // Add body for POST/PUT/PATCH
      if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      console.log(`[API] 🔧 Fetch options:`, fetchOptions);

      // Make the request
      const response = await fetch(url, fetchOptions);

      // Clear timeout on success
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      console.log(`[API] 📡 Response received:`);
      console.log(`[API] 📊 Status: ${response.status} ${response.statusText}`);
      console.log(
        `[API] 📋 Response Headers:`,
        Object.fromEntries(response.headers.entries())
      );
      console.log(`[API] ✅ OK: ${response.ok}`);

      // Read response
      const text = await response.text();
      console.log(`[API] 📖 Response body length: ${text.length} characters`);
      console.log(
        `[API] 📄 Response preview (first 200 chars):`,
        text.substring(0, 200)
      );

      // Try to parse as JSON
      let data: any = text;
      try {
        data = JSON.parse(text);
        console.log(`[API] 🎯 Successfully parsed as JSON`);
        console.log(
          `[API] 📊 JSON structure:`,
          typeof data,
          Array.isArray(data) ? `Array[${data.length}]` : 'Object'
        );

        // Log first level keys if it's an object
        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
          console.log(`[API] 🔑 Object keys:`, Object.keys(data));
        }
      } catch (parseError: unknown) {
        console.log(
          `[API] 📝 Keeping as text (not valid JSON):`,
          parseError instanceof Error ? parseError.message : String(parseError)
        );
      }

      const result: FetchResponse = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
      };

      console.log(`[API] ✅ Final result:`, {
        success: result.success,
        status: result.status,
        dataType: typeof result.data,
        hasData: !!result.data,
      });

      return result;
    } catch (error: unknown) {
      // Clean up timeout
      if (timeoutId) clearTimeout(timeoutId);

      console.error(`[API] ❌ Error occurred:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : 'Unknown';
      console.error(`[API] 📛 Error name: ${errorName}`);
      console.error(`[API] 📛 Error message: ${errorMessage}`);

      // Determine error type
      const isTimeout = errorName === 'AbortError';
      const isNetworkError =
        errorMessage.includes('fetch') ||
        errorMessage.includes('Failed to fetch');
      const isCorsError =
        errorMessage.includes('CORS') ||
        errorMessage.includes('cross-origin');

      console.log(`[API] 🔍 Error analysis:`);
      console.log(`[API] ⏰ Is timeout: ${isTimeout}`);
      console.log(`[API] 🌐 Is network error: ${isNetworkError}`);
      console.log(`[API] 🚫 Is CORS error: ${isCorsError}`);

      const result: FetchResponse = {
        success: false,
        error: errorMessage,
        isTimeout,
        isNetworkError,
        isCorsError,
        status: 0,
        statusText: '',
        data: null,
        headers: {},
      };

      console.log(`[API] ❌ Error result:`, result);
      return result;
    }
  }

  async handleInstallation(details: InstallDetails): Promise<void> {
    console.log(`[Comet Platform] Installation event: ${details.reason}`);

    try {
      switch (details.reason) {
        case 'install':
          await this.handleFirstInstall();
          break;
        case 'update':
          await this.handleUpdate(details.previousVersion);
          break;
      }
    } catch (error: unknown) {
      console.error('[Comet Platform] Installation handling failed:', error);
    }
  }

  async handleFirstInstall(): Promise<void> {
    console.log('[Comet Platform] First installation');
    await storage.set({
      installDate: Date.now(),
      version: this.version,
      firstInstall: true,
    });
  }

  async handleUpdate(previousVersion?: string): Promise<void> {
    console.log(
      `[Comet Platform] Updated from ${previousVersion} to ${this.version}`
    );
    await storage.set({
      lastUpdate: Date.now(),
      version: this.version,
      previousVersion,
    });
  }

  async handleMessage(message: MessageRequest, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): Promise<void> {
    try {
      const { type, data, id } = message;

      if (!type) {
        sendResponse({ success: false, error: 'Message type required' });
        return;
      }

      console.log(`[Comet Platform] Message received: ${type}`, data);

      const handler = this.messageHandlers.get(type);
      if (!handler) {
        sendResponse({
          success: false,
          error: `No handler for message type: ${type}`,
          availableHandlers: Array.from(this.messageHandlers.keys()),
        });
        return;
      }

      // Execute handler
      const result = await handler(data, sender);

      // Always wrap in success response format
      sendResponse({
        success: true,
        data: result,
        id,
      });
    } catch (error: unknown) {
      console.error('[Comet Platform] Message handling error:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Internal error',
        id: message.id,
      });
    }
  }

  registerMessageHandler(type: string, handler: MessageHandler): void {
    this.messageHandlers.set(type, handler);
  }

  getExtensionInfo(): ExtensionInfo {
    return {
      id: this.extensionId,
      version: this.version,
      manifest: this.api.runtime.getManifest(),
      initialized: this.isInitialized,
      browser: this.getBrowserInfo(),
    };
  }

  getBrowserInfo(): BrowserInfo {
    if (typeof browser !== 'undefined') {
      return { type: 'firefox', api: 'browser' };
    } else if (typeof chrome !== 'undefined') {
      return { type: 'chromium', api: 'chrome' };
    }
    return { type: 'unknown', api: 'unknown' };
  }
}

// Initialize the Comet service worker manager
const serviceWorkerManager = new CometServiceWorkerManager();

// Export for app usage
globalThis.serviceWorkerManager = serviceWorkerManager;
export { serviceWorkerManager };