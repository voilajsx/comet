/**
 * Comet Framework - Universal API utilities
 * Clean API proxy that works from any extension context
 * @module @voilajsx/comet
 * @file src/platform/api.ts
 */

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

interface RuntimeResponse {
  success: boolean;
  status: number;
  data?: any;
  error?: string;
}

/**
 * Universal API utilities that work from any extension context
 * Routes through service worker to avoid CORS issues
 */
export const comet = {
  /**
   * Base fetch method
   */
  async fetch(url: string, options: FetchOptions = {}): Promise<ApiResponse> {
    try {
      const response = await new Promise<RuntimeResponse>((resolve, reject) => {
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

        chrome.runtime.sendMessage(message, (response: RuntimeResponse) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message || 'Unknown runtime error'));
          } else {
            resolve(response);
          }
        });
      });

      return {
        ok: response.success,
        status: response.status,
        json: () => Promise.resolve(response.data),
        data: response.data,
        error: response.error,
      };
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