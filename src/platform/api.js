/**
 * Comet Framework - Universal API utilities
 * Clean API proxy that works from any extension context
 * @module @voilajsx/comet
 * @file src/platform/api.js
 */

/**
 * Universal API utilities that work from any extension context
 * Routes through service worker to avoid CORS issues
 */
export const comet = {
  // Base fetch method
  async fetch(url, options = {}) {
    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'api.fetch',
            data: {
              url,
              method: options.method || 'GET',
              headers: options.headers || {},
              body: options.body || null,
              timeout: options.timeout || 30000,
            },
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          }
        );
      });

      return {
        ok: response.success,
        status: response.status,
        json: () => Promise.resolve(response.data),
        data: response.data,
        error: response.error,
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error.message,
        json: () => Promise.reject(error),
      };
    }
  },

  // REST convenience methods
  async get(url, headers = {}) {
    return this.fetch(url, { method: 'GET', headers });
  },

  async post(url, data = null, headers = {}) {
    return this.fetch(url, {
      method: 'POST',
      body: data,
      headers,
    });
  },

  async put(url, data = null, headers = {}) {
    return this.fetch(url, {
      method: 'PUT',
      body: data,
      headers,
    });
  },

  async patch(url, data = null, headers = {}) {
    return this.fetch(url, {
      method: 'PATCH',
      body: data,
      headers,
    });
  },

  async delete(url, headers = {}) {
    return this.fetch(url, { method: 'DELETE', headers });
  },
};
