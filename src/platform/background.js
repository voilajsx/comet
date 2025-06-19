/**
 * Comet Extension Background Script (Cross-Browser Service Worker)
 * Handles extension lifecycle, message routing, and coordination
 * Works with Chrome, Firefox, Edge, Opera, Brave, and other WebExtension browsers
 * @module @voilajsx/comet
 * @file src/platform/background.js
 */

import { storage } from './storage.js';
import { messaging } from './messaging.js';

// Cross-browser API detection
const browserAPI = (() => {
  if (typeof browser !== 'undefined') {
    return browser; // Firefox, newer browsers
  } else if (typeof chrome !== 'undefined') {
    return chrome; // Chrome, Edge, Opera, Brave
  } else {
    throw new Error('No browser extension API available');
  }
})();

/**
 * Comet Background Manager
 * Handles all extension background functionality without app-specific logic
 */
class CometBackgroundManager {
  constructor() {
    this.api = browserAPI;
    this.extensionId = this.api.runtime.id;
    this.version = this.api.runtime.getManifest().version;
    this.messageHandlers = new Map();
    this.eventListeners = new Map();
    this.isInitialized = false;

    this.setupEventListeners();
    this.initialize();
  }

  /**
   * Setup all browser extension event listeners
   */
  setupEventListeners() {
    // Extension lifecycle events
    this.api.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    this.api.runtime.onStartup.addListener(() => {
      this.handleStartup();
    });

    // Message handling (universal routing)
    this.api.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Tab events (if app needs them)
    this.api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.emitEvent('tabUpdated', { tabId, changeInfo, tab });
    });

    this.api.tabs.onActivated.addListener((activeInfo) => {
      this.emitEvent('tabActivated', activeInfo);
    });

    // Storage change events
    this.api.storage.onChanged.addListener((changes, namespace) => {
      this.emitEvent('storageChanged', { changes, namespace });
    });

    // Action (icon) click events
    if (this.api.action && this.api.action.onClicked) {
      this.api.action.onClicked.addListener((tab) => {
        this.emitEvent('actionClicked', { tab });
      });
    }
  }

  /**
   * Initialize background service worker
   */
  async initialize() {
    if (this.isInitialized) return;

    console.log(
      `[Comet Platform] Background service worker v${this.version} initialized`
    );

    try {
      // Load app configuration
      await this.loadAppConfig();

      // Setup default message handlers
      this.setupDefaultHandlers();

      // Emit initialization event for app
      this.emitEvent('backgroundReady', {
        version: this.version,
        extensionId: this.extensionId,
      });

      this.isInitialized = true;
    } catch (error) {
      console.error(
        '[Comet Platform] Background initialization failed:',
        error
      );
    }
  }

  /**
   * Load app-specific configuration
   */
  async loadAppConfig() {
    try {
      // Try to load app config from storage or import
      const config = await storage.get('appConfig');
      this.appConfig = config || {};

      // Setup app-specific handlers if config exists
      if (this.appConfig.messageHandlers) {
        this.registerMessageHandlers(this.appConfig.messageHandlers);
      }
    } catch (error) {
      console.warn('[Comet Platform] No app config found, using defaults');
      this.appConfig = {};
    }
  }

  /**
   * Setup default universal message handlers
   */
  setupDefaultHandlers() {
    // Storage operations
    this.registerMessageHandler('storage.get', async (data) => {
      return await storage.get(data.keys);
    });

    this.registerMessageHandler('storage.set', async (data) => {
      return await storage.set(data.items);
    });

    this.registerMessageHandler('storage.remove', async (data) => {
      return await storage.remove(data.keys);
    });

    this.registerMessageHandler('storage.clear', async () => {
      return await storage.clear();
    });

    // Tab operations
    this.registerMessageHandler('tabs.getCurrent', async () => {
      const [tab] = await this.api.tabs.query({
        active: true,
        currentWindow: true,
      });
      return tab;
    });

    this.registerMessageHandler('tabs.sendMessage', async (data) => {
      return await messaging.sendToTab(data.tabId, data.message);
    });

    // Extension info
    this.registerMessageHandler('extension.getInfo', async () => {
      return {
        id: this.extensionId,
        version: this.version,
        manifest: this.api.runtime.getManifest(),
      };
    });

    // Badge operations
    this.registerMessageHandler('badge.setText', async (data) => {
      return await this.setBadgeText(data.text, data.tabId);
    });

    this.registerMessageHandler('badge.setColor', async (data) => {
      return await this.setBadgeColor(data.color, data.tabId);
    });

    // Universal API proxy handler
    this.registerMessageHandler('api.fetch', async (data) => {
      return await this.universalApiFetch(data);
    });
  }

  /**
   * Universal API fetch method - handles all external API calls
   * @param {object} data - Request configuration
   * @returns {object} Response data
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
          // Only add Content-Type for requests with body
          ...(body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
            ? { 'Content-Type': 'application/json' }
            : {}),
          ...headers, // Custom headers override defaults
        },
        signal: controller.signal,
      };

      // Only add body for methods that support it
      if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        fetchOptions.body = JSON.stringify(body);
      }

      console.log(`[Comet API] ${method.toUpperCase()} ${url}`, {
        headers: fetchOptions.headers,
        body: fetchOptions.body ? JSON.parse(fetchOptions.body) : null,
      });

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get('content-type');

      try {
        // Handle JSON responses
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Handle text responses
          data = await response.text();
          // Try to parse as JSON if it looks like JSON
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

      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
      };

      console.log(`[Comet API] Response:`, {
        status: result.status,
        success: result.success,
        dataType: typeof result.data,
        hasData: !!result.data,
      });

      return result;
    } catch (error) {
      console.error(`[Comet API] Request failed:`, {
        url,
        method,
        error: error.message,
        isTimeout: error.name === 'AbortError',
      });

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

  /**
   * Handle extension installation/update
   */
  async handleInstallation(details) {
    console.log(`[Comet Platform] Installation event: ${details.reason}`);

    const installationData = {
      reason: details.reason,
      previousVersion: details.previousVersion,
      timestamp: Date.now(),
      version: this.version,
    };

    try {
      switch (details.reason) {
        case 'install':
          await this.handleFirstInstall();
          break;
        case 'update':
          await this.handleUpdate(details.previousVersion);
          break;
        case 'chrome_update':
        case 'browser_update':
          await this.handleBrowserUpdate();
          break;
      }

      // Emit event for app to handle
      this.emitEvent('installed', installationData);
    } catch (error) {
      console.error('[Comet Platform] Installation handling failed:', error);
    }
  }

  /**
   * Handle first installation
   */
  async handleFirstInstall() {
    console.log('[Comet Platform] First installation');

    // Store installation info
    await storage.set({
      installDate: Date.now(),
      version: this.version,
      firstInstall: true,
    });
  }

  /**
   * Handle extension update
   */
  async handleUpdate(previousVersion) {
    console.log(
      `[Comet Platform] Updated from ${previousVersion} to ${this.version}`
    );

    // Store update info
    await storage.set({
      lastUpdate: Date.now(),
      version: this.version,
      previousVersion,
    });
  }

  /**
   * Handle browser update
   */
  async handleBrowserUpdate() {
    console.log('[Comet Platform] Browser updated');
    // No special handling needed, just log
  }

  /**
   * Handle extension startup
   */
  async handleStartup() {
    console.log('[Comet Platform] Extension startup');
    this.emitEvent('startup', { timestamp: Date.now() });
  }

  /**
   * Universal message handler - routes messages to registered handlers
   */
  async handleMessage(message, sender, sendResponse) {
    try {
      const { type, data, id } = message;

      if (!type) {
        sendResponse({ success: false, error: 'Message type required' });
        return;
      }

      console.log(`[Comet Platform] Message received: ${type}`, data);

      // Check if handler exists
      const handler = this.messageHandlers.get(type);
      if (!handler) {
        // Emit event for app to handle unknown messages
        const result = await this.emitEvent('message', { type, data, sender });
        sendResponse(
          result || {
            success: false,
            error: `No handler for message type: ${type}`,
            availableHandlers: Array.from(this.messageHandlers.keys()),
          }
        );
        return;
      }

      // Execute handler
      const result = await handler(data, sender);
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

  /**
   * Register a message handler
   */
  registerMessageHandler(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Register multiple message handlers
   */
  registerMessageHandlers(handlers) {
    Object.entries(handlers).forEach(([type, handler]) => {
      this.registerMessageHandler(type, handler);
    });
  }

  /**
   * Register event listener
   */
  addEventListener(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }

  /**
   * Emit event to registered listeners
   */
  async emitEvent(event, data) {
    const listeners = this.eventListeners.get(event) || [];

    if (listeners.length === 0) {
      // No listeners, but log for debugging
      console.log(`[Comet Platform] Event emitted: ${event}`, data);
      return null;
    }

    let lastResult = null;
    for (const listener of listeners) {
      try {
        lastResult = await listener(data);
      } catch (error) {
        console.error(
          `[Comet Platform] Event listener error for ${event}:`,
          error
        );
      }
    }

    return lastResult;
  }

  /**
   * Set badge text (cross-browser compatible)
   */
  async setBadgeText(text, tabId = null) {
    try {
      if (!this.api.action) {
        console.warn('[Comet Platform] Badge API not available');
        return false;
      }

      const options = { text: String(text) };
      if (tabId) options.tabId = tabId;

      await this.api.action.setBadgeText(options);
      return true;
    } catch (error) {
      console.error('[Comet Platform] Badge text update failed:', error);
      return false;
    }
  }

  /**
   * Set badge background color (cross-browser compatible)
   */
  async setBadgeColor(color, tabId = null) {
    try {
      if (!this.api.action) {
        console.warn('[Comet Platform] Badge API not available');
        return false;
      }

      const options = { color };
      if (tabId) options.tabId = tabId;

      await this.api.action.setBadgeBackgroundColor(options);
      return true;
    } catch (error) {
      console.error('[Comet Platform] Badge color update failed:', error);
      return false;
    }
  }

  /**
   * Get extension info
   */
  getExtensionInfo() {
    return {
      id: this.extensionId,
      version: this.version,
      manifest: this.api.runtime.getManifest(),
      initialized: this.isInitialized,
      browser: this.getBrowserInfo(),
    };
  }

  /**
   * Get browser information
   */
  getBrowserInfo() {
    if (typeof browser !== 'undefined') {
      return { type: 'firefox', api: 'browser' };
    } else if (typeof chrome !== 'undefined') {
      return { type: 'chromium', api: 'chrome' };
    }
    return { type: 'unknown', api: 'unknown' };
  }
}

// Initialize the Comet background manager
const backgroundManager = new CometBackgroundManager();

// Export for app usage (if needed)
globalThis.backgroundManager = backgroundManager;

// Export background manager
export { backgroundManager };
