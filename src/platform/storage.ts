/**
 * Comet Framework - Essential Storage Utility with Auto-reload on Rebuild
 * @module @voilajsx/comet
 * @file src/platform/storage.ts
 */

// Type definitions
interface StorageDefaults {
  [key: string]: any;
}

interface StorageChanges {
  [key: string]: {
    oldValue?: any;
    newValue?: any;
  };
}

interface StorageChangeCallback {
  (changes: StorageChanges, namespace: string): void;
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
 * Essential Comet Storage Manager with auto-reload defaults
 */
class CometStorageManager {
  private api: typeof chrome | typeof browser;
  private defaults: StorageDefaults;
  private defaultsLoaded: boolean;
  private isInitialized: boolean;
  private debugEnabled: boolean;

  constructor() {
    this.api = browserAPI;
    this.defaults = {};
    this.defaultsLoaded = false;
    this.isInitialized = false;
    this.debugEnabled = false;

    this.initialize();
  }

  /**
   * Debug logging utility
   */
  private log(message: string, data?: any): void {
    if (this.debugEnabled) {
      if (data) {
        console.log(`[Comet Storage] ${message}`, data);
      } else {
        console.log(`[Comet Storage] ${message}`);
      }
    }
  }

  /**
   * Initialize storage with auto-loading defaults
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadDefaults();
      
      // Enable debug logging based on defaults
      this.debugEnabled = this.defaults['debug-enabled'] || false;
      
      await this.initializeDefaults();
      this.isInitialized = true;
      this.log('Initialized with defaults');
    } catch (error) {
      console.warn('[Comet Storage] No defaults found, continuing without defaults');
      this.defaults = {};
      this.defaultsLoaded = true;
      this.isInitialized = true;
    }
  }

  /**
   * Load defaults from defaults.ts
   */
  async loadDefaults(): Promise<void> {
    if (this.defaultsLoaded) return;

    try {
      // Import from TS file instead of JSON for better compatibility
      const { default: defaults } = await import('../defaults.ts');
      this.defaults = defaults || {};
      this.defaultsLoaded = true;
      this.log('Loaded defaults from defaults.ts:', Object.keys(this.defaults));
    } catch (error: unknown) {
      console.warn('[Comet Storage] Failed to load defaults.ts:', error);
      this.defaults = {};
      this.defaultsLoaded = true;
    }
  }

  /**
   * Initialize storage with defaults - always reloads on extension reload (batched writes)
   */
  async initializeDefaults(): Promise<void> {
    try {
      this.log('Reloading defaults on extension startup');

      // Batch all defaults into a single write operation
      if (Object.keys(this.defaults).length > 0) {
        // Set all defaults in one operation to avoid quota limits
        await this.api.storage.sync.set(this.defaults);
        this.log('All defaults applied in batch:', Object.keys(this.defaults));
      } else {
        this.log('No defaults to apply');
      }

      // Mark as initialized (local storage doesn't count towards quota)
      await this.api.storage.local.set({ _defaultsInitialized: true });
    } catch (error: unknown) {
      console.warn('[Comet Storage] Failed to initialize defaults:', error);
    }
  }

  /**
   * Get data from storage with auto-fallback to defaults
   */
  async get(keys: string, fallback?: any): Promise<any>;
  async get(keys: string[], fallback?: any): Promise<Record<string, any>>;
  async get(keys: null): Promise<Record<string, any>>;
  async get(keys: string | string[] | null, fallback: any = undefined): Promise<any> {
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
        const output: Record<string, any> = {};

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
    } catch (error: unknown) {
      console.error('[Comet Storage] Get operation failed:', error);
      throw new Error('Failed to read from storage: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Set data to storage
   */
  async set(data: Record<string, any>): Promise<boolean>;
  async set(key: string, value: any): Promise<boolean>;
  async set(data: Record<string, any> | string, value?: any): Promise<boolean> {
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
    } catch (error: unknown) {
      console.error('[Comet Storage] Set operation failed:', error);
      throw new Error('Failed to write to storage: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Remove data from storage
   */
  async remove(keys: string | string[]): Promise<boolean> {
    try {
      await this.api.storage.sync.remove(keys);
      return true;
    } catch (error: unknown) {
      console.error('[Comet Storage] Remove operation failed:', error);
      throw new Error('Failed to remove from storage: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Clear all data from storage
   */
  async clear(): Promise<boolean> {
    try {
      await this.api.storage.sync.clear();
      await this.api.storage.local.clear();
      return true;
    } catch (error: unknown) {
      console.error('[Comet Storage] Clear operation failed:', error);
      throw new Error('Failed to clear storage: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Check if key exists in storage (including defaults)
   */
  async has(key: string): Promise<boolean> {
    try {
      const value = await this.get(key);
      return value !== undefined;
    } catch (error: unknown) {
      return false;
    }
  }

  /**
   * Listen to storage changes
   */
  onChange(callback: StorageChangeCallback): () => void {
    const listener = (changes: StorageChanges, namespace: string) => {
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
   */
  getDefaults(): StorageDefaults {
    return JSON.parse(JSON.stringify(this.defaults));
  }

  /**
   * Force reload defaults (simplified - just reinitialize)
   */
  async reloadDefaults(): Promise<boolean> {
    try {
      // Reset state
      this.defaultsLoaded = false;
      this.isInitialized = false;
      this.defaults = {};

      // Reinitialize (will always reload)
      await this.initialize();

      this.log('Defaults reloaded manually');
      return true;
    } catch (error: unknown) {
      console.error('[Comet Storage] Failed to reload defaults:', error);
      return false;
    }
  }
}

/**
 * Storage error class
 */
class CometStorageError extends Error {
  originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'CometStorageError';
    this.originalError = originalError;
  }
}

// Create and export storage instance
export const storage = new CometStorageManager();

// Export class for advanced usage
export { CometStorageManager, CometStorageError };