/**
 * Comet Extension Messaging Utility (Cross-Browser)
 * Provides clean interface for browser messaging between extension components
 * Works with Chrome, Firefox, Edge, Opera, Brave, and other WebExtension browsers
 * @module @voilajsx/comet
 * @file src/platform/messaging.js
 */

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
 * Comet Messaging Manager
 * Handles all browser extension messaging with error handling and retry logic
 */
class CometMessagingManager {
  constructor() {
    this.api = browserAPI;
    this.messageId = 0;
    this.pendingMessages = new Map();
    this.messageTimeout = 30000; // 30 seconds default timeout
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Send message to background script
   * @param {object} message - Message object
   * @param {object} [options={}] - Options (timeout, retries)
   * @returns {Promise<object>} Response from background
   */
  async sendToBackground(message, options = {}) {
    try {
      const messageWithId = this.createMessage(message);
      const timeout = options.timeout || this.messageTimeout;
      const retries = options.retries || this.retryAttempts;

      return await this.retryOperation(
        () => this.sendRuntimeMessage(messageWithId, timeout),
        retries,
        'background script'
      );
    } catch (error) {
      console.error('[Comet Messaging] Background message failed:', error);
      throw new CometMessagingError(
        'Failed to communicate with background script',
        error
      );
    }
  }

  /**
   * Send message to content script in active tab
   * @param {object} message - Message object
   * @param {number} [tabId] - Specific tab ID (defaults to active tab)
   * @param {object} [options={}] - Options (timeout, retries)
   * @returns {Promise<object>} Response from content script
   */
  async sendToContent(message, tabId = null, options = {}) {
    try {
      const targetTabId = tabId || (await this.getActiveTabId());
      const messageWithId = this.createMessage(message);
      const timeout = options.timeout || this.messageTimeout;
      const retries = options.retries || this.retryAttempts;

      if (!targetTabId) {
        throw new Error('No active tab found');
      }

      return await this.retryOperation(
        () => this.sendTabMessage(targetTabId, messageWithId, timeout),
        retries,
        `content script (tab ${targetTabId})`
      );
    } catch (error) {
      console.error('[Comet Messaging] Content script message failed:', error);
      throw new CometMessagingError(
        'Failed to communicate with content script',
        error
      );
    }
  }

  /**
   * Send message to specific tab
   * @param {number} tabId - Tab ID
   * @param {object} message - Message object
   * @param {object} [options={}] - Options (timeout, retries)
   * @returns {Promise<object>} Response from tab
   */
  async sendToTab(tabId, message, options = {}) {
    try {
      const messageWithId = this.createMessage(message);
      const timeout = options.timeout || this.messageTimeout;
      const retries = options.retries || this.retryAttempts;

      return await this.retryOperation(
        () => this.sendTabMessage(tabId, messageWithId, timeout),
        retries,
        `tab ${tabId}`
      );
    } catch (error) {
      console.error('[Comet Messaging] Tab message failed:', error);
      throw new CometMessagingError(
        `Failed to communicate with tab ${tabId}`,
        error
      );
    }
  }

  /**
   * Broadcast message to all tabs with content scripts
   * @param {object} message - Message object
   * @param {object} [options={}] - Options (timeout, retries)
   * @returns {Promise<array>} Array of responses from all tabs
   */
  async broadcast(message, options = {}) {
    try {
      const tabs = await this.api.tabs.query({});
      const messageWithId = this.createMessage(message);
      const responses = [];

      for (const tab of tabs) {
        try {
          const response = await this.sendToTab(tab.id, messageWithId, {
            ...options,
            retries: 1, // Lower retries for broadcast
          });
          responses.push({
            tabId: tab.id,
            url: tab.url,
            success: true,
            response,
          });
        } catch (error) {
          responses.push({
            tabId: tab.id,
            url: tab.url,
            success: false,
            error: error.message,
          });
        }
      }

      return responses;
    } catch (error) {
      console.error('[Comet Messaging] Broadcast failed:', error);
      throw new CometMessagingError('Failed to broadcast message', error);
    }
  }

  /**
   * Listen for messages from any source
   * @param {function} callback - Message handler (message, sender) => response
   * @returns {function} Unsubscribe function
   */
  onMessage(callback) {
    const listener = (message, sender, sendResponse) => {
      try {
        const result = callback(message, sender);

        // Handle async responses
        if (result instanceof Promise) {
          result
            .then((response) => sendResponse(response))
            .catch((error) =>
              sendResponse({
                success: false,
                error: error.message,
              })
            );
          return true; // Keep message channel open
        }

        // Handle sync responses
        if (result !== undefined) {
          sendResponse(result);
        }
      } catch (error) {
        console.error('[Comet Messaging] Message handler error:', error);
        sendResponse({
          success: false,
          error: error.message,
        });
      }
    };

    this.api.runtime.onMessage.addListener(listener);

    // Return unsubscribe function
    return () => {
      this.api.runtime.onMessage.removeListener(listener);
    };
  }

  /**
   * Listen for messages of specific type
   * @param {string} type - Message type to listen for
   * @param {function} callback - Message handler (data, sender) => response
   * @returns {function} Unsubscribe function
   */
  onMessageType(type, callback) {
    return this.onMessage((message, sender) => {
      if (message.type === type) {
        return callback(message.data, sender);
      }
    });
  }

  /**
   * Get current active tab
   * @returns {Promise<object|null>} Active tab or null
   */
  async getActiveTab() {
    try {
      const [activeTab] = await this.api.tabs.query({
        active: true,
        currentWindow: true,
      });
      return activeTab || null;
    } catch (error) {
      console.error('[Comet Messaging] Failed to get active tab:', error);
      return null;
    }
  }

  /**
   * Get active tab ID
   * @returns {Promise<number|null>} Active tab ID or null
   */
  async getActiveTabId() {
    const tab = await this.getActiveTab();
    return tab?.id || null;
  }

  /**
   * Check if tab supports content scripts
   * @param {object|string} tab - Tab object or URL string
   * @returns {boolean} True if tab supports content scripts
   */
  isTabSupported(tab) {
    const url = typeof tab === 'string' ? tab : tab?.url;
    if (!url) return false;

    const unsupportedPrefixes = [
      'chrome://',
      'chrome-extension://',
      'moz-extension://',
      'about:',
      'file://',
      'ftp://',
      'data:',
      'blob:',
    ];

    return !unsupportedPrefixes.some((prefix) => url.startsWith(prefix));
  }

  /**
   * Create message with unique ID and timestamp
   * @private
   */
  createMessage(message) {
    return {
      id: ++this.messageId,
      timestamp: Date.now(),
      ...message,
    };
  }

  /**
   * Send runtime message with timeout
   * @private
   */
  async sendRuntimeMessage(message, timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Message timeout'));
      }, timeout);

      this.api.runtime.sendMessage(message, (response) => {
        clearTimeout(timeoutId);

        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
          return;
        }

        resolve(response || { success: false, error: 'No response' });
      });
    });
  }

  /**
   * Send tab message with timeout
   * @private
   */
  async sendTabMessage(tabId, message, timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Message timeout'));
      }, timeout);

      this.api.tabs.sendMessage(tabId, message, (response) => {
        clearTimeout(timeoutId);

        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
          return;
        }

        resolve(response || { success: false, error: 'No response' });
      });
    });
  }

  /**
   * Retry operation with exponential backoff
   * @private
   */
  async retryOperation(operation, maxRetries, target) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) break;

        const delay = this.retryDelay * Math.pow(2, attempt);
        console.warn(
          `[Comet Messaging] Retry ${
            attempt + 1
          }/${maxRetries} for ${target} after ${delay}ms:`,
          error.message
        );
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Sleep utility
   * @private
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Set global message timeout
   * @param {number} timeout - Timeout in milliseconds
   */
  setTimeout(timeout) {
    this.messageTimeout = timeout;
  }

  /**
   * Set global retry configuration
   * @param {number} attempts - Number of retry attempts
   * @param {number} delay - Base delay in milliseconds
   */
  setRetryConfig(attempts, delay) {
    this.retryAttempts = attempts;
    this.retryDelay = delay;
  }
}

/**
 * Comet messaging error class
 */
class CometMessagingError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'CometMessagingError';
    this.originalError = originalError;
  }
}

// Create and export messaging instance
export const messaging = new CometMessagingManager();

// Export class for advanced usage
export { CometMessagingManager, CometMessagingError };
