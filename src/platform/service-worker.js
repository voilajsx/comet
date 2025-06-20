/**
 * Comet Framework - Essential Service Worker (Background Script)
 * @module @voilajsx/comet
 * @file src/platform/service-worker.js
 */

import { storage } from './storage.js';

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
  constructor() {
    this.api = browserAPI;
    this.extensionId = this.api.runtime.id;
    this.version = this.api.runtime.getManifest().version;
    this.messageHandlers = new Map();
    this.isInitialized = false;

    this.setupEventListeners();
    this.initialize();
  }

  setupEventListeners() {
    // Extension lifecycle
    this.api.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Message handling
    this.api.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log(`[Comet Platform] Service worker v${this.version} initialized`);

    try {
      this.setupDefaultHandlers();
      this.isInitialized = true;
    } catch (error) {
      console.error(
        '[Comet Platform] Service worker initialization failed:',
        error
      );
    }
  }

  setupDefaultHandlers() {
    // Storage operations - proxy to storage utility
    this.registerMessageHandler('storage.get', async (data) => {
      return await storage.get(data.keys, data.fallback);
    });

    this.registerMessageHandler('storage.set', async (data) => {
      return await storage.set(data.items || data);
    });

    this.registerMessageHandler('storage.remove', async (data) => {
      return await storage.remove(data.keys);
    });

    this.registerMessageHandler('storage.clear', async () => {
      return await storage.clear();
    });

    // Basic tabs operations - most common needs
    this.registerMessageHandler('tabs.query', async (data) => {
      try {
        const tabs = await this.api.tabs.query(data || {});
        return tabs; // Return tabs directly
      } catch (error) {
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
      } catch (error) {
        throw error;
      }
    });

    // Badge operations - very common for status display
    this.registerMessageHandler('badge.setText', async (data) => {
      try {
        if (!this.api.action) return false;

        const options = { text: String(data.text || '') };
        if (data.tabId) options.tabId = data.tabId;

        await this.api.action.setBadgeText(options);
        return true;
      } catch (error) {
        console.error('[Comet Platform] Badge setText failed:', error);
        return false;
      }
    });

    this.registerMessageHandler('badge.setColor', async (data) => {
      try {
        if (!this.api.action) return false;

        const options = { color: data.color };
        if (data.tabId) options.tabId = data.tabId;

        await this.api.action.setBadgeBackgroundColor(options);
        return true;
      } catch (error) {
        console.error('[Comet Platform] Badge setColor failed:', error);
        return false;
      }
    });

    // Universal API proxy - solves CORS issues
    this.registerMessageHandler('api.fetch', async (data) => {
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
   * Universal API fetch handler - solves CORS issues
   */
  async universalApiFetch({
    url,
    method = 'GET',
    headers = {},
    body = null,
    timeout = 30000,
  }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const fetchOptions = {
        method: method.toUpperCase(),
        headers: {
          ...(body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
            ? { 'Content-Type': 'application/json' }
            : {}),
          ...headers,
        },
        signal: controller.signal,
      };

      if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        fetchOptions.body = JSON.stringify(body);
      }

      console.log(`[Comet API] ${method.toUpperCase()} ${url}`);

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get('content-type');

      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
          if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
            try {
              data = JSON.parse(data);
            } catch (e) {
              // Keep as text if JSON parsing fails
            }
          }
        }
      } catch (error) {
        console.warn(`[Comet API] Failed to parse response body:`, error);
        data = null;
      }

      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      console.error(`[Comet API] Request failed:`, error);

      return {
        success: false,
        error: error.message,
        isTimeout: error.name === 'AbortError',
        status: 0,
        data: null,
        headers: {},
      };
    }
  }

  async handleInstallation(details) {
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
    } catch (error) {
      console.error('[Comet Platform] Installation handling failed:', error);
    }
  }

  async handleFirstInstall() {
    console.log('[Comet Platform] First installation');
    await storage.set({
      installDate: Date.now(),
      version: this.version,
      firstInstall: true,
    });
  }

  async handleUpdate(previousVersion) {
    console.log(
      `[Comet Platform] Updated from ${previousVersion} to ${this.version}`
    );
    await storage.set({
      lastUpdate: Date.now(),
      version: this.version,
      previousVersion,
    });
  }

  async handleMessage(message, sender, sendResponse) {
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
    } catch (error) {
      console.error('[Comet Platform] Message handling error:', error);
      sendResponse({
        success: false,
        error: error.message || 'Internal error',
        id: message.id,
      });
    }
  }

  registerMessageHandler(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  getExtensionInfo() {
    return {
      id: this.extensionId,
      version: this.version,
      manifest: this.api.runtime.getManifest(),
      initialized: this.isInitialized,
      browser: this.getBrowserInfo(),
    };
  }

  getBrowserInfo() {
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
