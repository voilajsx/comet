/**
 * Comet Framework - Universal Script Bridge (Static Imports)
 * Simple and reliable - no CSP issues, easy to add modules
 * @module @voilajsx/comet
 * @file src/scripts/bridge.js
 */

// ============================================================================
// 🚀 ADD NEW MODULES HERE - Just add import and add to modules array below
// ============================================================================
import pageAnalyzer from './modules/pageAnalyzer.js';
import quoteGenerator from './modules/quoteGenerator.js';
import userAuth from './modules/userAuth.js';
// import newModule from './modules/newModule.js';           // <-- Add new imports here
// import anotherModule from './modules/anotherModule.js';   // <-- Add new imports here

// ============================================================================
// 🚀 ADD NEW MODULES TO THIS ARRAY - Just add module name to array
// ============================================================================
const ALL_MODULES = [
  pageAnalyzer,
  quoteGenerator,
  userAuth,
  // newModule,        // <-- Add new modules here
  // anotherModule,    // <-- Add new modules here
];

// ============================================================================
// 🔒 FRAMEWORK CODE BELOW - NO NEED TO TOUCH ANYTHING BELOW THIS LINE
// ============================================================================

/**
 * Universal Comet Script Bridge
 * Registers modules statically - reliable and fast
 */
class CometScriptBridge {
  constructor() {
    this.isInitialized = false;
    this.modules = new Map();
    this.messageHandlers = new Map();
    this.moduleRegistry = new Map();
    this.moduleLoadStrategy = 'static-imports';

    this.initialize();
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log(
      '[Comet Bridge] Universal bridge loading on:',
      window.location.href
    );

    try {
      this.setupMessageHandling();
      this.registerCoreHandlers();
      this.loadStaticModules();
      this.notifyReady();
      this.isInitialized = true;

      console.log(
        `[Comet Bridge] Initialized with ${this.modules.size} modules:`,
        Array.from(this.modules.keys())
      );
    } catch (error) {
      console.error('[Comet Bridge] Initialization error:', error);
      this.isInitialized = true;
    }
  }

  setupMessageHandling() {
    try {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this.handleMessage(message, sender, sendResponse);
        return true;
      });
    } catch (error) {
      console.warn('[Comet Bridge] Message handling setup failed:', error);
    }
  }

  registerCoreHandlers() {
    this.registerHandler('ping', () => ({
      success: true,
      ready: true,
      url: window.location.href,
      timestamp: Date.now(),
      modules: Array.from(this.modules.keys()),
      moduleCount: this.modules.size,
      loadStrategy: this.moduleLoadStrategy,
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

  loadStaticModules() {
    console.log('[Comet Bridge] Loading static modules...');

    let loadedCount = 0;
    for (const moduleData of ALL_MODULES) {
      try {
        if (moduleData) {
          this.registerModule(moduleData);
          loadedCount++;
        }
      } catch (error) {
        console.warn('[Comet Bridge] Failed to register module:', error);
      }
    }

    console.log(
      `[Comet Bridge] Loaded ${loadedCount}/${ALL_MODULES.length} modules`
    );
  }

  registerModule(moduleConfig) {
    try {
      if (!this.isValidModule(moduleConfig)) {
        throw new Error('Invalid module configuration');
      }

      const name = moduleConfig.name;

      if (this.modules.has(name)) {
        console.warn(
          `[Comet Bridge] Module "${name}" already registered, skipping`
        );
        return;
      }

      this.modules.set(name, moduleConfig);

      if (moduleConfig.handlers) {
        Object.entries(moduleConfig.handlers).forEach(
          ([handlerName, handlerFunc]) => {
            if (typeof handlerFunc === 'function') {
              this.registerHandler(handlerName, handlerFunc);
              this.moduleRegistry.set(handlerName, name);
            }
          }
        );
      }

      if (typeof moduleConfig.init === 'function') {
        try {
          moduleConfig.init();
        } catch (error) {
          console.warn(`[Comet Bridge] Module "${name}" init failed:`, error);
        }
      }

      console.log(`[Comet Bridge] Module "${name}" registered successfully`);
    } catch (error) {
      console.error('[Comet Bridge] Module registration failed:', error);
      throw error;
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

    if (this.messageHandlers.has(type)) {
      console.warn(
        `[Comet Bridge] Handler "${type}" already exists, overriding`
      );
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

      console.log(`[Comet Bridge] Message: ${type}`, data);

      const handler = this.messageHandlers.get(type);
      if (!handler) {
        sendResponse({
          success: false,
          error: `No handler for: ${type}`,
          availableHandlers: Array.from(this.messageHandlers.keys()),
          moduleCount: this.modules.size,
          loadStrategy: this.moduleLoadStrategy,
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
      console.error('[Comet Bridge] Message handling error:', error);
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
      console.error('[Comet Bridge] Handler execution error:', error);
      throw error;
    }
  }

  async performCombinedAction(data) {
    const results = {};
    const errors = {};

    for (const [moduleName, moduleConfig] of this.modules) {
      try {
        if (
          moduleConfig.mainAction &&
          typeof moduleConfig.mainAction === 'function'
        ) {
          results[moduleName] = await moduleConfig.mainAction(data);
        } else if (
          moduleConfig.analyze &&
          typeof moduleConfig.analyze === 'function'
        ) {
          results[moduleName] = await moduleConfig.analyze(data);
        }
      } catch (error) {
        errors[moduleName] = error.message;
        console.warn(`[Comet Bridge] Module "${moduleName}" failed:`, error);
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
      loadStrategy: this.moduleLoadStrategy,
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
          loadStrategy: this.moduleLoadStrategy,
        },
      });
    } catch (error) {
      console.warn('[Comet Bridge] Failed to notify background:', error);
    }
  }
}

// Initialize the universal bridge
const scriptBridge = new CometScriptBridge();

// Export for debugging
if (typeof globalThis !== 'undefined') {
  globalThis.scriptBridge = scriptBridge;
}
