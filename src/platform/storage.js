/**
 * Comet Framework - Essential Storage Utility (Cross-Browser)
 * Simple storage with auto-loading defaults
 * @module @voilajsx/comet
 * @file src/platform/storage.js
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
 * Essential Comet Storage Manager
 * Auto-loads defaults and provides simple get/set/remove API
 */
class CometStorageManager {
  constructor() {
    this.api = browserAPI;
    this.defaults = {};
    this.defaultsLoaded = false;
    this.isInitialized = false;

    this.initialize();
  }

  /**
   * Initialize storage with auto-loading defaults
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.loadDefaults();
      await this.initializeDefaults();
      this.isInitialized = true;
      console.log('[Comet Storage] Initialized with defaults');
    } catch (error) {
      console.warn(
        '[Comet Storage] No defaults found, continuing without defaults'
      );
      this.defaults = {};
      this.defaultsLoaded = true;
      this.isInitialized = true;
    }
  }

  /**
   * Load defaults from defaults.json
   */
  async loadDefaults() {
    if (this.defaultsLoaded) return;

    try {
      const defaultsModule = await import('../defaults.json');
      this.defaults = defaultsModule.default || {};
      this.defaultsLoaded = true;
      console.log('[Comet Storage] Loaded defaults from defaults.json');
    } catch (error) {
      this.defaults = {};
      this.defaultsLoaded = true;
    }
  }

  /**
   * Initialize storage with defaults on first run
   */
  async initializeDefaults() {
    try {
      const isInitialized = await this.api.storage.local.get(
        '_defaultsInitialized'
      );

      if (isInitialized._defaultsInitialized) {
        return; // Already initialized
      }

      // Set defaults for any keys that don't exist
      if (Object.keys(this.defaults).length > 0) {
        for (const [key, value] of Object.entries(this.defaults)) {
          const existing = await this.api.storage.sync.get(key);
          if (existing[key] === undefined) {
            await this.api.storage.sync.set({ [key]: value });
          }
        }
        console.log('[Comet Storage] Initialized with defaults');
      }

      await this.api.storage.local.set({ _defaultsInitialized: true });
    } catch (error) {
      console.warn('[Comet Storage] Failed to initialize defaults:', error);
    }
  }

  /**
   * Get data from storage with auto-fallback to defaults
   * @param {string|array} keys - Keys to retrieve
   * @param {any} fallback - Fallback value if not found
   * @returns {Promise<any>} Retrieved data
   */
  async get(keys, fallback = undefined) {
    try {
      await this.initialize();

      // Handle single key
      if (typeof keys === 'string') {
        const result = await this.api.storage.sync.get(keys);

        if (result[keys] !== undefined) {
          return result[keys];
        }

        // Try defaults
        if (this.defaults[keys] !== undefined) {
          return this.defaults[keys];
        }

        return fallback;
      }

      // Handle array of keys
      if (Array.isArray(keys)) {
        const result = await this.api.storage.sync.get(keys);
        const output = {};

        for (const key of keys) {
          if (result[key] !== undefined) {
            output[key] = result[key];
          } else if (this.defaults[key] !== undefined) {
            output[key] = this.defaults[key];
          } else {
            output[key] = undefined;
          }
        }

        return output;
      }

      // Handle null (get all)
      if (keys === null) {
        const result = await this.api.storage.sync.get(null);

        // Merge with defaults
        const merged = { ...this.defaults };
        Object.assign(merged, result);
        delete merged._defaultsInitialized; // Remove internal flag

        return merged;
      }

      return fallback;
    } catch (error) {
      console.error('[Comet Storage] Get operation failed:', error);
      throw new Error('Failed to read from storage: ' + error.message);
    }
  }

  /**
   * Set data to storage
   * @param {object|string} data - Data to store (object) or key (string)
   * @param {any} [value] - Value if first param is key string
   * @returns {Promise<boolean>} Success status
   */
  async set(data, value = undefined) {
    try {
      await this.initialize();

      // Handle set(key, value) syntax
      if (typeof data === 'string') {
        await this.api.storage.sync.set({ [data]: value });
        return true;
      }

      // Handle object syntax
      if (typeof data === 'object' && data !== null) {
        await this.api.storage.sync.set(data);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Comet Storage] Set operation failed:', error);
      throw new Error('Failed to write to storage: ' + error.message);
    }
  }

  /**
   * Remove data from storage
   * @param {string|array} keys - Keys to remove
   * @returns {Promise<boolean>} Success status
   */
  async remove(keys) {
    try {
      await this.api.storage.sync.remove(keys);
      return true;
    } catch (error) {
      console.error('[Comet Storage] Remove operation failed:', error);
      throw new Error('Failed to remove from storage: ' + error.message);
    }
  }

  /**
   * Clear all data from storage
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    try {
      await this.api.storage.sync.clear();
      await this.api.storage.local.clear();
      return true;
    } catch (error) {
      console.error('[Comet Storage] Clear operation failed:', error);
      throw new Error('Failed to clear storage: ' + error.message);
    }
  }

  /**
   * Check if key exists in storage (including defaults)
   * @param {string} key - Key to check
   * @returns {Promise<boolean>} True if key exists
   */
  async has(key) {
    try {
      const value = await this.get(key);
      return value !== undefined;
    } catch (error) {
      return false;
    }
  }

  /**
   * Listen to storage changes
   * @param {function} callback - Callback function (changes, namespace) => void
   * @returns {function} Unsubscribe function
   */
  onChange(callback) {
    const listener = (changes, namespace) => {
      callback(changes, namespace);
    };

    this.api.storage.onChanged.addListener(listener);

    // Return unsubscribe function
    return () => {
      this.api.storage.onChanged.removeListener(listener);
    };
  }

  /**
   * Get all defaults
   * @returns {object} Defaults object
   */
  getDefaults() {
    return JSON.parse(JSON.stringify(this.defaults));
  }
}

/**
 * Storage error class
 */
class CometStorageError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'CometStorageError';
    this.originalError = originalError;
  }
}

// Create and export storage instance
export const storage = new CometStorageManager();

// Export class for advanced usage
export { CometStorageManager, CometStorageError };
