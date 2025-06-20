/**
 * Comet Framework - Essential Messaging Utility (Cross-Browser)
 * Simple message passing between extension components
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
 * Essential Comet Messaging Manager
 * Simple and reliable message passing
 */
class CometMessagingManager {
  constructor() {
    this.api = browserAPI;
    this.messageId = 0;
    this.messageTimeout = 10000; // 10 seconds
  }

  /**
   * Send message to service worker (background script)
   * @param {object} message - Message object
   * @returns {Promise<object>} Response from service worker
   */
  async sendToBackground(message) {
    try {
      const messageWithId = this.createMessage(message);

      return await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Message timeout'));
        }, this.messageTimeout);

        this.api.runtime.sendMessage(messageWithId, (response) => {
          clearTimeout(timeoutId);

          if (this.api.runtime.lastError) {
            reject(new Error(this.api.runtime.lastError.message));
            return;
          }

          resolve(response || { success: false, error: 'No response' });
        });
      });
    } catch (error) {
      console.error('[Comet Messaging] Background message failed:', error);
      throw new Error(
        'Failed to communicate with service worker: ' + error.message
      );
    }
  }

  /**
   * Send message to content script in active tab
   * @param {object} message - Message object
   * @param {number} [tabId] - Specific tab ID (defaults to active tab)
   * @returns {Promise<object>} Response from content script
   */
  async sendToContent(message, tabId = null) {
    try {
      const targetTabId = tabId || (await this.getActiveTabId());
      const messageWithId = this.createMessage(message);

      if (!targetTabId) {
        throw new Error('No active tab found');
      }

      return await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Message timeout'));
        }, this.messageTimeout);

        this.api.tabs.sendMessage(targetTabId, messageWithId, (response) => {
          clearTimeout(timeoutId);

          if (this.api.runtime.lastError) {
            reject(new Error(this.api.runtime.lastError.message));
            return;
          }

          resolve(response || { success: false, error: 'No response' });
        });
      });
    } catch (error) {
      console.error('[Comet Messaging] Content script message failed:', error);
      throw new Error(
        'Failed to communicate with content script: ' + error.message
      );
    }
  }

  /**
   * Send message to specific tab
   * @param {number} tabId - Tab ID
   * @param {object} message - Message object
   * @returns {Promise<object>} Response from tab
   */
  async sendToTab(tabId, message) {
    try {
      const messageWithId = this.createMessage(message);

      return await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Message timeout'));
        }, this.messageTimeout);

        this.api.tabs.sendMessage(tabId, messageWithId, (response) => {
          clearTimeout(timeoutId);

          if (this.api.runtime.lastError) {
            reject(new Error(this.api.runtime.lastError.message));
            return;
          }

          resolve(response || { success: false, error: 'No response' });
        });
      });
    } catch (error) {
      console.error('[Comet Messaging] Tab message failed:', error);
      throw new Error(
        `Failed to communicate with tab ${tabId}: ` + error.message
      );
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
   * Set global message timeout
   * @param {number} timeout - Timeout in milliseconds
   */
  setTimeout(timeout) {
    this.messageTimeout = timeout;
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
}

/**
 * Messaging error class
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
