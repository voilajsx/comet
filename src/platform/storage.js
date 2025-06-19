/**
 * Comet Extension Storage Utility (Cross-Browser)
 * Enhanced storage with auto-loading defaults from defaults.json
 * Works with Chrome, Firefox, Edge, Opera, Brave, and other WebExtension browsers
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
 * Enhanced Comet Storage Manager
 * Auto-loads defaults and provides unified API for all data access
 */
class CometStorageManager {
  constructor() {
    this.api = browserAPI;
    this.syncQuota = this.api.storage.sync.QUOTA_BYTES || 102400; // 100KB
    this.localQuota = this.api.storage.local.QUOTA_BYTES || 10485760; // 10MB
    this.syncItemQuota = this.api.storage.sync.QUOTA_BYTES_PER_ITEM || 8192; // 8KB per item

    // Defaults management
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
        '[Comet Storage] Initialization failed, continuing without defaults:',
        error
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
      // Try to import defaults.json
      const defaultsModule = await import('../defaults.json');
      this.defaults = defaultsModule.default || {};
      this.defaultsLoaded = true;
      console.log('[Comet Storage] Loaded defaults from defaults.json');
    } catch (error) {
      console.log(
        '[Comet Storage] No defaults.json found, using empty defaults'
      );
      this.defaults = {};
      this.defaultsLoaded = true;
    }
  }

  /**
   * Initialize storage with defaults on first run
   */
  async initializeDefaults() {
    try {
      // Check if we've already initialized defaults
      const isInitialized = await this.api.storage.local.get(
        '_defaultsInitialized'
      );

      if (isInitialized._defaultsInitialized) {
        return; // Already initialized
      }

      // Load defaults into storage
      if (Object.keys(this.defaults).length > 0) {
        await this.setDefaults(this.defaults);
        console.log('[Comet Storage] Initialized storage with defaults');
      }

      // Mark as initialized
      await this.api.storage.local.set({ _defaultsInitialized: true });
    } catch (error) {
      console.warn('[Comet Storage] Failed to initialize defaults:', error);
    }
  }

  /**
   * Recursively set default values
   */
  async setDefaults(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursive for nested objects
        await this.setDefaults(value, fullKey);
      } else {
        // Check if key already exists
        const existingValue = await this.getRaw(fullKey);
        if (existingValue === undefined) {
          // Only set if not already exists
          await this.setRaw(fullKey, value);
        }
      }
    }
  }

  /**
   * Get data from browser storage with auto-fallback to defaults
   * @param {string|array|object|null} keys - Keys to retrieve
   * @param {any} fallback - Fallback value if not found
   * @param {string} [namespace='auto'] - Storage namespace (sync/local/auto)
   * @returns {Promise<any>} Retrieved data
   */
  async get(keys = null, fallback = undefined, namespace = 'auto') {
    try {
      await this.initialize();

      // Handle single key string
      if (typeof keys === 'string') {
        const value = await this.getRaw(keys, namespace);

        if (value !== undefined) {
          return value;
        }

        // Try to get from defaults
        const defaultValue = this.getDefaultByPath(keys);
        if (defaultValue !== undefined) {
          return defaultValue;
        }

        return fallback;
      }

      // Handle array of keys
      if (Array.isArray(keys)) {
        const result = {};
        for (const key of keys) {
          result[key] = await this.get(key, undefined, namespace);
        }
        return result;
      }

      // Handle null (get all)
      if (keys === null) {
        const storageArea = this.getStorageArea(namespace, 'read');
        const result = await storageArea.get(null);

        // Merge with defaults
        return this.mergeWithDefaults(result);
      }

      // Handle object (get multiple specific keys)
      const result = {};
      for (const key of Object.keys(keys)) {
        result[key] = await this.get(key, keys[key], namespace);
      }
      return result;
    } catch (error) {
      console.error('[Comet Storage] Get operation failed:', error);
      throw new CometStorageError('Failed to read from storage', error);
    }
  }

  /**
   * Set data to browser storage
   * @param {object|string} data - Data to store (object) or key (string)
   * @param {any} [value] - Value if first param is key string
   * @param {string} [namespace='auto'] - Storage namespace (sync/local/auto)
   * @returns {Promise<boolean>} Success status
   */
  async set(data, value = undefined, namespace = 'auto') {
    try {
      await this.initialize();

      // Handle set(key, value) syntax
      if (typeof data === 'string') {
        return await this.setRaw(data, value, namespace);
      }

      // Handle object syntax
      const results = [];
      for (const [key, val] of Object.entries(data)) {
        results.push(await this.setRaw(key, val, namespace));
      }

      return results.every((result) => result === true);
    } catch (error) {
      console.error('[Comet Storage] Set operation failed:', error);
      throw new CometStorageError('Failed to write to storage', error);
    }
  }

  /**
   * Remove data from browser storage
   * @param {string|array} keys - Keys to remove
   * @param {string} [namespace='auto'] - Storage namespace (sync/local/auto)
   * @returns {Promise<boolean>} Success status
   */
  async remove(keys, namespace = 'auto') {
    try {
      const storageArea = this.getStorageArea(namespace, 'write');

      if (typeof keys === 'string') {
        await storageArea.remove(keys);
      } else {
        await storageArea.remove(keys);
      }

      return true;
    } catch (error) {
      console.error('[Comet Storage] Remove operation failed:', error);
      throw new CometStorageError('Failed to remove from storage', error);
    }
  }

  /**
   * Clear all data from browser storage
   * @param {string} [namespace='both'] - Storage namespace (sync/local/both)
   * @returns {Promise<boolean>} Success status
   */
  async clear(namespace = 'both') {
    try {
      if (namespace === 'both') {
        await Promise.all([
          this.api.storage.sync.clear(),
          this.api.storage.local.clear(),
        ]);
      } else {
        const storageArea = this.getStorageArea(namespace, 'write');
        await storageArea.clear();
      }
      return true;
    } catch (error) {
      console.error('[Comet Storage] Clear operation failed:', error);
      throw new CometStorageError('Failed to clear storage', error);
    }
  }

  /**
   * Check if data exists in storage (including defaults)
   * @param {string} key - Key to check
   * @param {string} [namespace='auto'] - Storage namespace
   * @returns {Promise<boolean>} True if key exists
   */
  async has(key, namespace = 'auto') {
    try {
      const value = await this.get(key, undefined, namespace);
      return value !== undefined;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get storage usage information
   * @param {string} [namespace='both'] - Storage namespace (sync/local/both)
   * @returns {Promise<object>} Usage information
   */
  async getUsage(namespace = 'both') {
    try {
      const usage = {};

      if (namespace === 'both' || namespace === 'sync') {
        const syncUsed = await this.api.storage.sync.getBytesInUse();
        usage.sync = {
          used: syncUsed,
          total: this.syncQuota,
          percentage: Math.round((syncUsed / this.syncQuota) * 100),
          available: this.syncQuota - syncUsed,
        };
      }

      if (namespace === 'both' || namespace === 'local') {
        const localUsed = await this.api.storage.local.getBytesInUse();
        usage.local = {
          used: localUsed,
          total: this.localQuota,
          percentage: Math.round((localUsed / this.localQuota) * 100),
          available: this.localQuota - localUsed,
        };
      }

      return usage;
    } catch (error) {
      console.error('[Comet Storage] Usage check failed:', error);
      return { sync: { used: 0, total: 0, percentage: 0, available: 0 } };
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
   * Reset storage to defaults
   * @returns {Promise<boolean>} Success status
   */
  async resetToDefaults() {
    try {
      await this.clear();
      await this.api.storage.local.remove('_defaultsInitialized');
      await this.initializeDefaults();
      console.log('[Comet Storage] Reset to defaults');
      return true;
    } catch (error) {
      console.error('[Comet Storage] Reset failed:', error);
      return false;
    }
  }

  /**
   * Get all defaults
   * @returns {object} Defaults object
   */
  getDefaults() {
    return JSON.parse(JSON.stringify(this.defaults));
  }

  // ===== INTERNAL HELPER METHODS =====

  /**
   * Raw get without defaults fallback
   */
  async getRaw(key, namespace = 'auto') {
    const storageArea = this.getStorageArea(namespace, 'read');
    const result = await storageArea.get(key);
    return result[key];
  }

  /**
   * Raw set without validation
   */
  async setRaw(key, value, namespace = 'auto') {
    const items = { [key]: value };
    const storageArea = this.getStorageArea(namespace, 'write', items);

    // Validate data size
    this.validateDataSize(items, storageArea);

    await storageArea.set(items);
    return true;
  }

  /**
   * Get default value by path
   */
  getDefaultByPath(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.defaults);
  }

  /**
   * Merge storage result with defaults
   */
  mergeWithDefaults(storageData) {
    const result = JSON.parse(JSON.stringify(this.defaults));

    // Overlay storage data on defaults
    for (const [key, value] of Object.entries(storageData)) {
      if (key !== '_defaultsInitialized') {
        this.setByPath(result, key, value);
      }
    }

    return result;
  }

  /**
   * Set value by path in object
   */
  setByPath(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((o, key) => {
      if (!(key in o)) o[key] = {};
      return o[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Determine appropriate storage area
   */
  getStorageArea(namespace, operation, data = null) {
    if (namespace === 'sync') return this.api.storage.sync;
    if (namespace === 'local') return this.api.storage.local;

    // Auto mode: decide based on data size and operation
    if (namespace === 'auto') {
      if (operation === 'read') {
        return this.api.storage.sync;
      }

      if (data) {
        const dataSize = this.calculateDataSize(data);
        return dataSize > this.syncItemQuota
          ? this.api.storage.local
          : this.api.storage.sync;
      }
    }

    return this.api.storage.sync;
  }

  /**
   * Calculate data size in bytes
   */
  calculateDataSize(data) {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch (error) {
      return JSON.stringify(data).length;
    }
  }

  /**
   * Validate data size against storage limits
   */
  validateDataSize(data, storageArea) {
    const dataSize = this.calculateDataSize(data);
    const isSync = storageArea === this.api.storage.sync;

    if (isSync) {
      for (const [key, value] of Object.entries(data)) {
        const itemSize = this.calculateDataSize({ [key]: value });
        if (itemSize > this.syncItemQuota) {
          throw new CometStorageError(
            `Item "${key}" exceeds sync storage item limit (${itemSize} > ${this.syncItemQuota} bytes)`
          );
        }
      }

      if (dataSize > this.syncQuota) {
        throw new CometStorageError(
          `Data exceeds sync storage quota (${dataSize} > ${this.syncQuota} bytes)`
        );
      }
    } else {
      if (dataSize > this.localQuota) {
        throw new CometStorageError(
          `Data exceeds local storage quota (${dataSize} > ${this.localQuota} bytes)`
        );
      }
    }
  }
}

/**
 * Comet storage error class
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
