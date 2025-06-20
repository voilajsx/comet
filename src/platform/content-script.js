/**
 * Comet Framework - Essential Content Script
 * Auto-discovers modules from scripts/modules/ folder
 * @module @voilajsx/comet
 * @file src/platform/content-script.js
 */

// AUTO-DISCOVERY - Modules are auto-loaded
import * as modules from '../features/index.js';
const ALL_MODULES = Object.values(modules);

/**
 * Essential Comet Content Script Manager
 * Simple and reliable module registration with message handling
 */
class CometContentScriptManager {
  constructor() {
    this.isInitialized = false;
    this.modules = new Map();
    this.messageHandlers = new Map();
    this.moduleRegistry = new Map();

    this.initialize();
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('[Comet Content] Loading on:', window.location.href);

    try {
      this.setupMessageHandling();
      this.registerCoreHandlers();
      this.loadModules();
      this.notifyReady();
      this.isInitialized = true;

      console.log(
        `[Comet Content] Initialized with ${this.modules.size} modules:`,
        Array.from(this.modules.keys())
      );
    } catch (error) {
      console.error('[Comet Content] Initialization error:', error);
      this.isInitialized = true;
    }
  }

  setupMessageHandling() {
    try {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this.handleMessage(message, sender, sendResponse);
        return true; // Keep message channel open for async responses
      });
    } catch (error) {
      console.warn('[Comet Content] Message handling setup failed:', error);
    }
  }

  registerCoreHandlers() {
    // Core framework handlers
    this.registerHandler('ping', () => ({
      success: true,
      ready: true,
      url: window.location.href,
      timestamp: Date.now(),
      modules: Array.from(this.modules.keys()),
      moduleCount: this.modules.size,
    }));

    this.registerHandler('getPageInfo', () => ({
      url: window.location.href,
      title: document.title,
      hostname: window.location.hostname,
      timestamp: Date.now(),
    }));

    this.registerHandler('getModules', () => ({
      modules: Array.from(this.modules.keys()),
      handlers: Array.from(this.messageHandlers.keys()),
      moduleCount: this.modules.size,
    }));

    this.registerHandler('performMainAction', (data) =>
      this.performCombinedAction(data)
    );
  }

  loadModules() {
    console.log('[Comet Content] Loading modules...');

    let loadedCount = 0;
    for (const moduleData of ALL_MODULES) {
      try {
        if (moduleData && this.isValidModule(moduleData)) {
          this.registerModule(moduleData);
          loadedCount++;
        }
      } catch (error) {
        console.warn('[Comet Content] Failed to register module:', error);
      }
    }

    console.log(
      `[Comet Content] Loaded ${loadedCount}/${ALL_MODULES.length} modules`
    );
  }

  registerModule(moduleConfig) {
    try {
      const name = moduleConfig.name;

      if (this.modules.has(name)) {
        console.warn(
          `[Comet Content] Module "${name}" already registered, skipping`
        );
        return;
      }

      this.modules.set(name, moduleConfig);

      // Register module handlers
      if (moduleConfig.handlers) {
        Object.entries(moduleConfig.handlers).forEach(
          ([handlerName, handlerFunc]) => {
            if (typeof handlerFunc === 'function') {
              // Check for conflicts
              if (this.messageHandlers.has(handlerName)) {
                const existingModule = this.moduleRegistry.get(handlerName);
                console.warn(
                  `[Comet Content] Handler "${handlerName}" conflict: Module "${name}" vs existing "${existingModule}", skipping`
                );
                return;
              }

              this.registerHandler(handlerName, handlerFunc);
              this.moduleRegistry.set(handlerName, name);
            }
          }
        );
      }

      // Initialize module
      if (typeof moduleConfig.init === 'function') {
        try {
          moduleConfig.init();
        } catch (error) {
          console.warn(`[Comet Content] Module "${name}" init failed:`, error);
        }
      }

      console.log(`[Comet Content] Module "${name}" registered successfully`);
    } catch (error) {
      console.error('[Comet Content] Module registration failed:', error);
    }
  }

  isValidModule(moduleConfig) {
    return !!(
      moduleConfig &&
      typeof moduleConfig === 'object' &&
      moduleConfig.name &&
      typeof moduleConfig.name === 'string' &&
      (moduleConfig.handlers || moduleConfig.mainAction)
    );
  }

  registerHandler(type, handler) {
    if (typeof handler !== 'function') {
      throw new Error(`Handler for "${type}" must be a function`);
    }

    this.messageHandlers.set(type, handler);
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      const { type, data, id } = message;

      if (!type) {
        sendResponse({ success: false, error: 'Message type required' });
        return;
      }

      console.log(`[Comet Content] Message: ${type}`, data);

      const handler = this.messageHandlers.get(type);
      if (!handler) {
        sendResponse({
          success: false,
          error: `No handler for: ${type}`,
          availableHandlers: Array.from(this.messageHandlers.keys()),
          moduleCount: this.modules.size,
        });
        return;
      }

      const result = await this.executeHandler(handler, data, sender);
      const moduleOwner = this.moduleRegistry.get(type);

      sendResponse({
        success: true,
        data: result,
        module: moduleOwner,
        id,
      });
    } catch (error) {
      console.error('[Comet Content] Message handling error:', error);
      sendResponse({
        success: false,
        error: error.message || 'Internal error',
        id: message.id,
      });
    }
  }

  async executeHandler(handler, data, sender) {
    try {
      return await handler(data, sender);
    } catch (error) {
      console.error('[Comet Content] Handler execution error:', error);
      throw error;
    }
  }

  async performCombinedAction(data) {
    const results = {};
    const errors = {};

    for (const [moduleName, moduleConfig] of this.modules) {
      try {
        if (typeof moduleConfig.mainAction === 'function') {
          results[moduleName] = await moduleConfig.mainAction(data);
        } else if (typeof moduleConfig.analyze === 'function') {
          results[moduleName] = await moduleConfig.analyze(data);
        }
      } catch (error) {
        errors[moduleName] = error.message;
        console.warn(`[Comet Content] Module "${moduleName}" failed:`, error);
      }
    }

    return {
      success: Object.keys(errors).length === 0,
      message: `Combined action completed across ${
        Object.keys(results).length
      } modules`,
      results,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      timestamp: Date.now(),
      url: window.location.href,
    };
  }

  notifyReady() {
    try {
      chrome.runtime.sendMessage({
        type: 'contentScriptReady',
        data: {
          url: window.location.href,
          modules: Array.from(this.modules.keys()),
          moduleCount: this.modules.size,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      console.warn('[Comet Content] Failed to notify service worker:', error);
    }
  }

  // Debug helper
  getInfo() {
    return {
      modules: Array.from(this.modules.keys()),
      handlers: Array.from(this.messageHandlers.keys()),
      moduleCount: this.modules.size,
      url: window.location.href,
      initialized: this.isInitialized,
    };
  }
}

// Initialize the content script manager
const contentScriptManager = new CometContentScriptManager();

// Export for debugging
if (typeof globalThis !== 'undefined') {
  globalThis.contentScriptManager = contentScriptManager;
}
