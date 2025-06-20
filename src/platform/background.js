/**
 * Comet Extension Background Script (Complete Fix for Tabs API)
 * @module @voilajsx/comet
 * @file src/platform/background.js
 */

import { storage } from './storage.js';
import { messaging } from './messaging.js';

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
 * Comet Background Manager with Fixed Tabs API
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

  setupEventListeners() {
    // Extension lifecycle events
    this.api.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    this.api.runtime.onStartup.addListener(() => {
      this.handleStartup();
    });

    // Message handling
    this.api.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Tab events
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

    // Action click events
    if (this.api.action && this.api.action.onClicked) {
      this.api.action.onClicked.addListener((tab) => {
        this.emitEvent('actionClicked', { tab });
      });
    }
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log(
      `[Comet Platform] Background service worker v${this.version} initialized`
    );

    try {
      await this.loadAppConfig();
      this.setupDefaultHandlers();
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

  async loadAppConfig() {
    try {
      const config = await storage.get('appConfig');
      this.appConfig = config || {};
      if (this.appConfig.messageHandlers) {
        this.registerMessageHandlers(this.appConfig.messageHandlers);
      }
    } catch (error) {
      console.warn('[Comet Platform] No app config found, using defaults');
      this.appConfig = {};
    }
  }

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

    // ✅ FIXED: Tabs operations with correct response format
    this.registerMessageHandler('tabs.create', async (data) => {
      try {
        console.log('[Comet Platform] Creating tab with data:', data);

        const createOptions = {
          url: data.url || 'about:blank',
          active: data.active !== false, // Default to true unless explicitly false
        };

        // Add optional properties if provided
        if (data.windowId) createOptions.windowId = data.windowId;
        if (data.index !== undefined) createOptions.index = data.index;
        if (data.pinned !== undefined) createOptions.pinned = data.pinned;

        const tab = await this.api.tabs.create(createOptions);

        console.log('[Comet Platform] Tab created successfully:', tab);
        return { success: true, tab };
      } catch (error) {
        console.error('[Comet Platform] Tab creation failed:', error);
        return { success: false, error: error.message };
      }
    });

    this.registerMessageHandler('tabs.query', async (data) => {
      try {
        console.log('[Comet Platform] Querying tabs with:', data);

        const queryOptions = data || {};
        const tabs = await this.api.tabs.query(queryOptions);

        console.log('[Comet Platform] Query returned', tabs.length, 'tabs');

        // ✅ CRITICAL FIX: Return tabs directly in data field, not wrapped
        return tabs; // This is what was wrong - we were returning { success: true, data: tabs }
      } catch (error) {
        console.error('[Comet Platform] Tab query failed:', error);
        throw error; // Let the framework handle the error wrapping
      }
    });

    this.registerMessageHandler('tabs.getCurrent', async () => {
      try {
        console.log('[Comet Platform] Getting current tab');

        const tabs = await this.api.tabs.query({
          active: true,
          currentWindow: true,
        });

        const currentTab = tabs[0] || null;
        console.log('[Comet Platform] Current tab:', currentTab);

        return currentTab;
      } catch (error) {
        console.error('[Comet Platform] Get current tab failed:', error);
        throw error;
      }
    });

    this.registerMessageHandler('tabs.update', async (data) => {
      try {
        console.log('[Comet Platform] Updating tab:', data);

        const updateOptions = {};
        if (data.url) updateOptions.url = data.url;
        if (data.active !== undefined) updateOptions.active = data.active;
        if (data.pinned !== undefined) updateOptions.pinned = data.pinned;
        if (data.muted !== undefined) updateOptions.muted = data.muted;

        const tab = await this.api.tabs.update(data.tabId, updateOptions);

        console.log('[Comet Platform] Tab updated:', tab);
        return { success: true, tab };
      } catch (error) {
        console.error('[Comet Platform] Tab update failed:', error);
        return { success: false, error: error.message };
      }
    });

    this.registerMessageHandler('tabs.remove', async (data) => {
      try {
        console.log('[Comet Platform] Removing tabs:', data);

        const tabIds = Array.isArray(data.tabIds) ? data.tabIds : [data.tabId];
        await this.api.tabs.remove(tabIds);

        console.log('[Comet Platform] Tabs removed successfully');
        return { success: true, removedCount: tabIds.length };
      } catch (error) {
        console.error('[Comet Platform] Tab removal failed:', error);
        return { success: false, error: error.message };
      }
    });

    this.registerMessageHandler('tabs.duplicate', async (data) => {
      try {
        console.log('[Comet Platform] Duplicating tab:', data.tabId);

        const tab = await this.api.tabs.duplicate(data.tabId);

        console.log('[Comet Platform] Tab duplicated:', tab);
        return { success: true, tab };
      } catch (error) {
        console.error('[Comet Platform] Tab duplication failed:', error);
        return { success: false, error: error.message };
      }
    });

    this.registerMessageHandler('tabs.reload', async (data) => {
      try {
        console.log('[Comet Platform] Reloading tab:', data);

        const reloadOptions = {};
        if (data.bypassCache !== undefined)
          reloadOptions.bypassCache = data.bypassCache;

        await this.api.tabs.reload(data.tabId, reloadOptions);

        console.log('[Comet Platform] Tab reloaded successfully');
        return { success: true };
      } catch (error) {
        console.error('[Comet Platform] Tab reload failed:', error);
        return { success: false, error: error.message };
      }
    });

    this.registerMessageHandler('tabs.sendMessage', async (data) => {
      try {
        console.log('[Comet Platform] Sending message to tab:', data.tabId);

        const response = await messaging.sendToTab(data.tabId, data.message);

        console.log('[Comet Platform] Message sent to tab successfully');
        return response;
      } catch (error) {
        console.error('[Comet Platform] Send message to tab failed:', error);
        throw error;
      }
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

    // Bookmarks operations
    this.registerMessageHandler('bookmarks.create', async (data) => {
      try {
        console.log('[Comet Platform] Creating bookmark:', data);

        const bookmark = await this.api.bookmarks.create({
          title: data.title,
          url: data.url,
          parentId: data.parentId,
        });

        console.log('[Comet Platform] Bookmark created:', bookmark);
        return { success: true, bookmark };
      } catch (error) {
        console.error('[Comet Platform] Bookmark creation failed:', error);
        return { success: false, error: error.message };
      }
    });

    // Context menu operations
    this.registerMessageHandler('contextMenu.create', async (data) => {
      try {
        console.log('[Comet Platform] Creating context menu:', data);

        await this.api.contextMenus.create({
          id: data.id,
          title: data.title,
          contexts: data.contexts || ['page'],
        });

        console.log('[Comet Platform] Context menu created successfully');
        return { success: true };
      } catch (error) {
        console.error('[Comet Platform] Context menu creation failed:', error);
        return { success: false, error: error.message };
      }
    });

    this.registerMessageHandler('contextMenu.remove', async (data) => {
      try {
        console.log('[Comet Platform] Removing context menu:', data.id);

        await this.api.contextMenus.remove(data.id);

        console.log('[Comet Platform] Context menu removed successfully');
        return { success: true };
      } catch (error) {
        console.error('[Comet Platform] Context menu removal failed:', error);
        return { success: false, error: error.message };
      }
    });

    // Downloads operations
    this.registerMessageHandler('downloads.downloadData', async (data) => {
      try {
        console.log('[Comet Platform] Starting download:', data.filename);

        const blob = new Blob([data.data], {
          type: data.mimeType || 'text/plain',
        });
        const url = URL.createObjectURL(blob);

        const downloadId = await this.api.downloads.download({
          url: url,
          filename: data.filename || 'download.txt',
        });

        // Clean up blob URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 10000);

        console.log('[Comet Platform] Download started:', downloadId);
        return { success: true, downloadId };
      } catch (error) {
        console.error('[Comet Platform] Download failed:', error);
        return { success: false, error: error.message };
      }
    });

    // Universal API proxy handler
    this.registerMessageHandler('api.fetch', async (data) => {
      return await this.universalApiFetch(data);
    });
  }

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

      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
      };

      return result;
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

      this.emitEvent('installed', installationData);
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

  async handleBrowserUpdate() {
    console.log('[Comet Platform] Browser updated');
  }

  async handleStartup() {
    console.log('[Comet Platform] Extension startup');
    this.emitEvent('startup', { timestamp: Date.now() });
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

      // ✅ CRITICAL FIX: Always wrap in success response format
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

  registerMessageHandlers(handlers) {
    Object.entries(handlers).forEach(([type, handler]) => {
      this.registerMessageHandler(type, handler);
    });
  }

  addEventListener(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }

  async emitEvent(event, data) {
    const listeners = this.eventListeners.get(event) || [];

    if (listeners.length === 0) {
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

// Initialize the Comet background manager
const backgroundManager = new CometBackgroundManager();

// Export for app usage
globalThis.backgroundManager = backgroundManager;
export { backgroundManager };
