/**
 * Comet Framework - Essential Messaging Utility (Cross-Browser)
 * Simple message passing between extension components
 * @module @voilajsx/comet
 * @file src/platform/messaging.ts
 */

// Type definitions
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
  timestamp?: number;
}

interface MessageSender {
  tab?: chrome.tabs.Tab;
  frameId?: number;
  id?: string;
  url?: string;
  tlsChannelId?: string;
}

interface MessageCallback {
  (message: MessageRequest, sender: MessageSender): any | Promise<any>;
}

interface TypedMessageCallback {
  (data: any, sender: MessageSender): any | Promise<any>;
}

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
  private api: typeof chrome | typeof browser;
  private messageId: number;
  private messageTimeout: number;

  constructor() {
    this.api = browserAPI;
    this.messageId = 0;
    this.messageTimeout = 10000; // 10 seconds
  }

  /**
   * Send message to service worker (background script)
   */
  async sendToBackground(message: MessageRequest): Promise<MessageResponse> {
    try {
      const messageWithId = this.createMessage(message);

      return await new Promise<MessageResponse>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Message timeout'));
        }, this.messageTimeout);

        this.api.runtime.sendMessage(messageWithId, (response: MessageResponse) => {
          clearTimeout(timeoutId);

          if (this.api.runtime.lastError) {
            reject(new Error(this.api.runtime.lastError.message || 'Unknown error'));
            return;
          }

          resolve(response || { success: false, error: 'No response' });
        });
      });
    } catch (error: unknown) {
      console.error('[Comet Messaging] Background message failed:', error);
      throw new Error(
        'Failed to communicate with service worker: ' + (error instanceof Error ? error.message : String(error))
      );
    }
  }

  /**
   * Send message to content script in active tab
   */
  async sendToContent(message: MessageRequest, tabId: number | null = null): Promise<MessageResponse> {
    try {
      const targetTabId = tabId || (await this.getActiveTabId());
      const messageWithId = this.createMessage(message);

      if (!targetTabId) {
        throw new Error('No active tab found');
      }

      return await new Promise<MessageResponse>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Message timeout'));
        }, this.messageTimeout);

        this.api.tabs.sendMessage(targetTabId, messageWithId, (response: MessageResponse) => {
          clearTimeout(timeoutId);

          if (this.api.runtime.lastError) {
            reject(new Error(this.api.runtime.lastError.message || 'Unknown error'));
            return;
          }

          resolve(response || { success: false, error: 'No response' });
        });
      });
    } catch (error: unknown) {
      console.error('[Comet Messaging] Content script message failed:', error);
      throw new Error(
        'Failed to communicate with content script: ' + (error instanceof Error ? error.message : String(error))
      );
    }
  }

  /**
   * Send message to specific tab
   */
  async sendToTab(tabId: number, message: MessageRequest): Promise<MessageResponse> {
    try {
      const messageWithId = this.createMessage(message);

      return await new Promise<MessageResponse>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Message timeout'));
        }, this.messageTimeout);

        this.api.tabs.sendMessage(tabId, messageWithId, (response: MessageResponse) => {
          clearTimeout(timeoutId);

          if (this.api.runtime.lastError) {
            reject(new Error(this.api.runtime.lastError.message || 'Unknown error'));
            return;
          }

          resolve(response || { success: false, error: 'No response' });
        });
      });
    } catch (error: unknown) {
      console.error('[Comet Messaging] Tab message failed:', error);
      throw new Error(
        `Failed to communicate with tab ${tabId}: ` + (error instanceof Error ? error.message : String(error))
      );
    }
  }

  /**
   * Listen for messages from any source
   */
  onMessage(callback: MessageCallback): () => void {
    const listener = (message: MessageRequest, sender: MessageSender, sendResponse: (response?: any) => void) => {
      try {
        const result = callback(message, sender);

        // Handle async responses
        if (result instanceof Promise) {
          result
            .then((response) => sendResponse(response))
            .catch((error: unknown) =>
              sendResponse({
                success: false,
                error: error instanceof Error ? error.message : String(error),
              })
            );
          return true; // Keep message channel open
        }

        // Handle sync responses
        if (result !== undefined) {
          sendResponse(result);
        }
      } catch (error: unknown) {
        console.error('[Comet Messaging] Message handler error:', error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : String(error),
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
   */
  onMessageType(type: string, callback: TypedMessageCallback): () => void {
    return this.onMessage((message, sender) => {
      if (message.type === type) {
        return callback(message.data, sender);
      }
    });
  }

  /**
   * Get current active tab
   */
  async getActiveTab(): Promise<chrome.tabs.Tab | null> {
    try {
      const [activeTab] = await this.api.tabs.query({
        active: true,
        currentWindow: true,
      });
      return activeTab || null;
    } catch (error: unknown) {
      console.error('[Comet Messaging] Failed to get active tab:', error);
      return null;
    }
  }

  /**
   * Get active tab ID
   */
  async getActiveTabId(): Promise<number | null> {
    const tab = await this.getActiveTab();
    return tab?.id || null;
  }

  /**
   * Check if tab supports content scripts
   */
  isTabSupported(tab: chrome.tabs.Tab | string | null): boolean {
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
   */
  setTimeout(timeout: number): void {
    this.messageTimeout = timeout;
  }

  /**
   * Create message with unique ID and timestamp
   */
  private createMessage(message: MessageRequest): MessageRequest {
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
  originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'CometMessagingError';
    this.originalError = originalError;
  }
}

// Create and export messaging instance
export const messaging = new CometMessagingManager();

// Export class for advanced usage
export { CometMessagingManager, CometMessagingError };