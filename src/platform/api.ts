/**
 * Comet Framework - Universal API utilities (CROSS-BROWSER FIXED)
 * Clean API proxy that works from any extension context
 * @module @voilajsx/comet
 * @file src/platform/api.ts
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

// Type definitions
interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string | object | null;
  timeout?: number;
}

interface ApiResponse {
  ok: boolean;
  status: number;
  data?: any;
  error?: string;
  json(): Promise<any>;
}

interface RuntimeMessage {
  type: string;
  data: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string | null;
    timeout: number;
  };
}

// 🔧 FIXED: Update to match service worker's actual response
interface ServiceWorkerResponse {
  success: boolean;
  data: {
    success: boolean;
    status: number;
    statusText: string;
    data: any;
    headers: Record<string, string>;
    error?: string;
    isTimeout?: boolean;
    isNetworkError?: boolean;
    isCorsError?: boolean;
  };
  id?: number;
  error?: string;
}

/**
 * Universal API utilities that work from any extension context
 * Routes through service worker to avoid CORS issues - CROSS-BROWSER COMPATIBLE
 */
export const comet = {
  /**
   * Base fetch method - CROSS-BROWSER with Promise-based messaging
   */
  async fetch(url: string, options: FetchOptions = {}): Promise<ApiResponse> {
    try {
      const response = await new Promise<ServiceWorkerResponse>((resolve, reject) => {
        const message: RuntimeMessage = {
          type: 'api.fetch',
          data: {
            url,
            method: options.method || 'GET',
            headers: options.headers || {},
            body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : null,
            timeout: options.timeout || 30000,
          },
        };

        // Cross-browser message sending
        if (browserAPI.runtime.sendMessage.length > 1) {
          // Chrome-style callback API
          browserAPI.runtime.sendMessage(message, (response: ServiceWorkerResponse) => {
            if (browserAPI.runtime.lastError) {
              reject(new Error(browserAPI.runtime.lastError.message || 'Unknown runtime error'));
            } else {
              resolve(response);
            }
          });
        } else {
          // Firefox-style Promise API
          (browserAPI.runtime.sendMessage(message) as Promise<ServiceWorkerResponse>)
            .then(resolve)
            .catch((error: unknown) => {
              reject(new Error(error instanceof Error ? error.message : 'Unknown runtime error'));
            });
        }
      });

      // 🔧 FIXED: Handle the service worker's wrapped response correctly
      if (response.success && response.data) {
        // Extract the actual fetch response from service worker wrapper
        const fetchResult = response.data;
        
        return {
          ok: fetchResult.success,
          status: fetchResult.status,
          json: () => Promise.resolve(fetchResult.data),
          data: fetchResult.data, // ← Direct access to actual API data
          error: fetchResult.error,
        };
      } else {
        // Service worker level error
        return {
          ok: false,
          status: 0,
          error: response.error || 'Service worker error',
          json: () => Promise.reject(new Error(response.error || 'Service worker error')),
        };
      }
    } catch (error: unknown) {
      return {
        ok: false,
        status: 0,
        error: error instanceof Error ? error.message : String(error),
        json: () => Promise.reject(error),
      };
    }
  },

  /**
   * REST convenience methods
   */
  async get(url: string, headers: Record<string, string> = {}): Promise<ApiResponse> {
    return this.fetch(url, { method: 'GET', headers });
  },

  async post(url: string, data: string | object | null = null, headers: Record<string, string> = {}): Promise<ApiResponse> {
    return this.fetch(url, {
      method: 'POST',
      body: data,
      headers,
    });
  },

  async put(url: string, data: string | object | null = null, headers: Record<string, string> = {}): Promise<ApiResponse> {
    return this.fetch(url, {
      method: 'PUT',
      body: data,
      headers,
    });
  },

  async patch(url: string, data: string | object | null = null, headers: Record<string, string> = {}): Promise<ApiResponse> {
    return this.fetch(url, {
      method: 'PATCH',
      body: data,
      headers,
    });
  },

  async delete(url: string, headers: Record<string, string> = {}): Promise<ApiResponse> {
    return this.fetch(url, { method: 'DELETE', headers });
  },
};