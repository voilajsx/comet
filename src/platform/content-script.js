/**
 * Comet Framework - Essential Content Script with DEBUG LOGGING
 * Auto-discovers modules from scripts/modules/ folder
 * @module @voilajsx/comet
 * @file src/platform/content-script.js
 */

// ============================================================================
// 🐛 DEBUG: Enhanced logging for troubleshooting
// ============================================================================
function debugLog(level, message, data = null) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  const prefix = `[Comet Debug ${timestamp}]`;

  if (data) {
    console[level](`${prefix} ${message}`, data);
  } else {
    console[level](`${prefix} ${message}`);
  }
}

// ============================================================================
// 🚨 CRITICAL: Prevent duplicate execution using IIFE for ES module compatibility
// ============================================================================
(async function initContentScript() {
  debugLog('info', '🚀 Content script starting initialization');
  debugLog('info', `URL: ${window.location.href}`);
  debugLog('info', `User Agent: ${navigator.userAgent.substring(0, 100)}...`);

  // Check if already loaded
  if (window.cometContentScriptLoaded) {
    debugLog('warn', '⚠️ Script already loaded, exiting to prevent duplicates');
    debugLog(
      'info',
      `Previous load time: ${window.cometContentScriptLoadTime}`
    );
    return;
  }

  // Mark as loaded immediately to prevent race conditions
  window.cometContentScriptLoaded = true;
  window.cometContentScriptLoadTime = Date.now();
  debugLog('info', '✅ Marking script as loaded');

  // Additional safety check for manager instance
  if (
    window.contentScriptManager &&
    window.contentScriptManager.isInitialized
  ) {
    debugLog('warn', '⚠️ Manager already initialized, exiting');
    debugLog(
      'info',
      'Existing manager info:',
      window.contentScriptManager.getInfo()
    );
    return;
  }

  // Check if Chrome extension APIs are available
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    debugLog('error', '❌ Chrome extension APIs not available');
    return;
  }

  debugLog('info', '✅ Chrome extension APIs available');
  debugLog('info', `Extension ID: ${chrome.runtime.id}`);

  // AUTO-DISCOVERY - Modules are auto-loaded
  let ALL_MODULES = [];
  debugLog('info', '📦 Starting module discovery...');

  try {
    const modules = await import('../features/index.js');
    ALL_MODULES = Object.values(modules);
    debugLog(
      'info',
      `✅ Modules loaded successfully: ${ALL_MODULES.length} modules found`
    );
    debugLog(
      'info',
      'Module names:',
      ALL_MODULES.map((m) => m?.name || 'unnamed')
    );

    // Validate each module
    ALL_MODULES.forEach((module, index) => {
      if (!module) {
        debugLog('warn', `Module at index ${index} is null/undefined`);
      } else if (!module.name) {
        debugLog(
          'warn',
          `Module at index ${index} missing name property`,
          module
        );
      } else {
        debugLog(
          'info',
          `Module "${module.name}" has handlers:`,
          Object.keys(module.handlers || {})
        );
      }
    });
  } catch (error) {
    debugLog('error', '❌ Failed to load modules:', error);
    debugLog('error', 'Error stack:', error.stack);
    ALL_MODULES = [];
  }

  /**
   * Essential Comet Content Script Manager with Enhanced Debug Logging
   */
  class CometContentScriptManager {
    constructor() {
      debugLog('info', '🏗️ Creating CometContentScriptManager instance');

      this.isInitialized = false;
      this.modules = new Map();
      this.messageHandlers = new Map();
      this.moduleRegistry = new Map();
      this.initializationTimestamp = Date.now();
      this.debugMode = true; // Enable debug mode

      // Prevent multiple initialization
      if (window.contentScriptManager) {
        debugLog(
          'warn',
          '⚠️ Manager instance already exists, returning existing'
        );
        return window.contentScriptManager;
      }

      debugLog('info', '✅ Starting manager initialization');
      this.initialize();
    }

    async initialize() {
      if (this.isInitialized) {
        debugLog('warn', '⚠️ Manager already initialized, skipping');
        return;
      }

      debugLog(
        'info',
        `🚀 Starting initialization on: ${window.location.href}`
      );

      try {
        debugLog('info', '📡 Setting up message handling...');
        this.setupMessageHandling();

        debugLog('info', '🔧 Registering core handlers...');
        this.registerCoreHandlers();

        debugLog('info', '📦 Loading modules...');
        this.loadModules();

        debugLog('info', '📢 Notifying service worker...');
        this.notifyReady();

        this.isInitialized = true;

        debugLog('info', `✅ Initialization complete!`);
        debugLog(
          'info',
          `📊 Stats: ${this.modules.size} modules, ${this.messageHandlers.size} handlers`
        );
        debugLog(
          'info',
          'Registered modules:',
          Array.from(this.modules.keys())
        );
        debugLog(
          'info',
          'Available handlers:',
          Array.from(this.messageHandlers.keys())
        );
      } catch (error) {
        debugLog('error', '❌ Initialization error:', error);
        debugLog('error', 'Error stack:', error.stack);
        this.isInitialized = true; // Mark as initialized even on error to prevent retries
      }
    }

    setupMessageHandling() {
      try {
        chrome.runtime.onMessage.addListener(
          (message, sender, sendResponse) => {
            debugLog('info', `📨 Received message: ${message.type}`);
            debugLog('info', 'Message data:', message);
            debugLog('info', 'Sender info:', sender);

            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
          }
        );

        debugLog('info', '✅ Message handling setup complete');
      } catch (error) {
        debugLog('error', '❌ Message handling setup failed:', error);
      }
    }

    registerCoreHandlers() {
      debugLog('info', '🔧 Registering core framework handlers...');

      // Core framework handlers
      this.registerHandler('ping', () => {
        debugLog('info', '🏓 Ping handler called');
        return {
          success: true,
          ready: true,
          url: window.location.href,
          timestamp: Date.now(),
          modules: Array.from(this.modules.keys()),
          moduleCount: this.modules.size,
          initTime: this.initializationTimestamp,
        };
      });

      this.registerHandler('getPageInfo', () => {
        debugLog('info', '📄 Page info handler called');
        return {
          url: window.location.href,
          title: document.title,
          hostname: window.location.hostname,
          timestamp: Date.now(),
        };
      });

      this.registerHandler('getModules', () => {
        debugLog('info', '📦 Get modules handler called');
        const result = {
          modules: Array.from(this.modules.keys()),
          handlers: Array.from(this.messageHandlers.keys()),
          moduleCount: this.modules.size,
          initTime: this.initializationTimestamp,
        };
        debugLog('info', 'Returning module info:', result);
        return result;
      });

      this.registerHandler('performMainAction', (data) => {
        debugLog('info', '🎯 Main action handler called with data:', data);
        return this.performCombinedAction(data);
      });

      debugLog('info', '✅ Core handlers registered');
    }

    loadModules() {
      debugLog('info', `📦 Loading ${ALL_MODULES.length} modules...`);

      let loadedCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < ALL_MODULES.length; i++) {
        const moduleData = ALL_MODULES[i];
        debugLog(
          'info',
          `Processing module ${i + 1}/${ALL_MODULES.length}:`,
          moduleData?.name || 'unnamed'
        );

        try {
          if (moduleData && this.isValidModule(moduleData)) {
            debugLog(
              'info',
              `✅ Module "${moduleData.name}" is valid, registering...`
            );
            const registerResult = this.registerModule(moduleData);
            if (registerResult) {
              loadedCount++;
              debugLog(
                'info',
                `✅ Module "${moduleData.name}" registered successfully`
              );
            } else {
              skippedCount++;
              debugLog('warn', `⚠️ Module "${moduleData.name}" was skipped`);
            }
          } else {
            debugLog('warn', `❌ Module ${i + 1} is invalid:`, moduleData);
            skippedCount++;
          }
        } catch (error) {
          debugLog('error', `❌ Failed to register module ${i + 1}:`, error);
          skippedCount++;
        }
      }

      debugLog(
        'info',
        `📊 Module loading complete: ${loadedCount} loaded, ${skippedCount} skipped, ${ALL_MODULES.length} total`
      );
    }

    registerModule(moduleConfig) {
      try {
        const name = moduleConfig.name;
        debugLog('info', `🔄 Registering module: ${name}`);

        // Enhanced duplicate detection
        if (this.modules.has(name)) {
          debugLog('warn', `⚠️ Module "${name}" already registered, skipping`);
          debugLog('info', 'Existing module:', this.modules.get(name));
          return false;
        }

        // Check for handler conflicts before registering module
        if (moduleConfig.handlers) {
          const conflictingHandlers = [];
          Object.keys(moduleConfig.handlers).forEach((handlerName) => {
            if (this.messageHandlers.has(handlerName)) {
              const existingModule = this.moduleRegistry.get(handlerName);
              conflictingHandlers.push(
                `${handlerName} (existing: ${existingModule})`
              );
            }
          });

          if (conflictingHandlers.length > 0) {
            debugLog(
              'warn',
              `⚠️ Module "${name}" has conflicting handlers: ${conflictingHandlers.join(
                ', '
              )}, skipping entire module`
            );
            return false;
          }
        }

        // Register the module
        this.modules.set(name, moduleConfig);
        debugLog('info', `✅ Module "${name}" added to registry`);

        // Register module handlers
        if (moduleConfig.handlers) {
          debugLog(
            'info',
            `🔧 Registering handlers for module "${name}":`,
            Object.keys(moduleConfig.handlers)
          );
          Object.entries(moduleConfig.handlers).forEach(
            ([handlerName, handlerFunc]) => {
              if (typeof handlerFunc === 'function') {
                this.registerHandler(handlerName, handlerFunc);
                this.moduleRegistry.set(handlerName, name);
                debugLog(
                  'info',
                  `✅ Handler "${handlerName}" registered for module "${name}"`
                );
              } else {
                debugLog(
                  'warn',
                  `⚠️ Handler "${handlerName}" is not a function in module "${name}"`
                );
              }
            }
          );
        }

        // Initialize module
        if (typeof moduleConfig.init === 'function') {
          try {
            debugLog('info', `🚀 Initializing module "${name}"`);
            moduleConfig.init();
            debugLog('info', `✅ Module "${name}" initialized successfully`);
          } catch (error) {
            debugLog('warn', `⚠️ Module "${name}" init failed:`, error);
          }
        }

        return true;
      } catch (error) {
        debugLog('error', '❌ Module registration failed:', error);
        return false;
      }
    }

    isValidModule(moduleConfig) {
      const isValid = !!(
        moduleConfig &&
        typeof moduleConfig === 'object' &&
        moduleConfig.name &&
        typeof moduleConfig.name === 'string' &&
        (moduleConfig.handlers || moduleConfig.mainAction)
      );

      if (!isValid) {
        debugLog('warn', '❌ Invalid module detected:', {
          hasConfig: !!moduleConfig,
          isObject: typeof moduleConfig === 'object',
          hasName: !!(moduleConfig && moduleConfig.name),
          nameIsString: !!(
            moduleConfig && typeof moduleConfig.name === 'string'
          ),
          hasHandlers: !!(moduleConfig && moduleConfig.handlers),
          hasMainAction: !!(moduleConfig && moduleConfig.mainAction),
        });
      }

      return isValid;
    }

    registerHandler(type, handler) {
      if (typeof handler !== 'function') {
        debugLog(
          'error',
          `❌ Handler for "${type}" must be a function, got: ${typeof handler}`
        );
        throw new Error(`Handler for "${type}" must be a function`);
      }

      // Check for duplicate handlers
      if (this.messageHandlers.has(type)) {
        const existingModule = this.moduleRegistry.get(type);
        debugLog(
          'warn',
          `⚠️ Handler "${type}" already exists (module: ${existingModule}), skipping`
        );
        return false;
      }

      this.messageHandlers.set(type, handler);
      debugLog('info', `✅ Handler "${type}" registered`);
      return true;
    }

    async handleMessage(message, sender, sendResponse) {
      try {
        const { type, data, id } = message;

        if (!type) {
          debugLog('error', '❌ Message missing type field');
          sendResponse({ success: false, error: 'Message type required' });
          return;
        }

        debugLog('info', `🔍 Looking for handler: ${type}`);

        const handler = this.messageHandlers.get(type);
        if (!handler) {
          debugLog('warn', `⚠️ No handler found for: ${type}`);
          debugLog(
            'info',
            'Available handlers:',
            Array.from(this.messageHandlers.keys())
          );

          sendResponse({
            success: false,
            error: `No handler for: ${type}`,
            availableHandlers: Array.from(this.messageHandlers.keys()),
            moduleCount: this.modules.size,
            initTime: this.initializationTimestamp,
          });
          return;
        }

        debugLog('info', `✅ Handler found for: ${type}, executing...`);

        const result = await this.executeHandler(handler, data, sender);
        const moduleOwner = this.moduleRegistry.get(type);

        debugLog('info', `✅ Handler execution complete for: ${type}`);
        debugLog('info', 'Handler result:', result);

        sendResponse({
          success: true,
          data: result,
          module: moduleOwner,
          id,
          timestamp: Date.now(),
        });
      } catch (error) {
        debugLog('error', '❌ Message handling error:', error);
        debugLog('error', 'Error stack:', error.stack);

        sendResponse({
          success: false,
          error: error.message || 'Internal error',
          id: message.id,
          timestamp: Date.now(),
        });
      }
    }

    async executeHandler(handler, data, sender) {
      try {
        debugLog('info', '🔄 Executing handler with data:', data);
        const result = await handler(data, sender);
        debugLog('info', '✅ Handler execution successful');
        return result;
      } catch (error) {
        debugLog('error', '❌ Handler execution error:', error);
        throw error;
      }
    }

    async performCombinedAction(data) {
      debugLog('info', '🎯 Performing combined action across all modules');

      const results = {};
      const errors = {};

      for (const [moduleName, moduleConfig] of this.modules) {
        try {
          debugLog('info', `🔄 Running action for module: ${moduleName}`);

          if (typeof moduleConfig.mainAction === 'function') {
            results[moduleName] = await moduleConfig.mainAction(data);
            debugLog('info', `✅ Main action complete for: ${moduleName}`);
          } else if (typeof moduleConfig.analyze === 'function') {
            results[moduleName] = await moduleConfig.analyze(data);
            debugLog('info', `✅ Analyze complete for: ${moduleName}`);
          } else {
            debugLog('info', `⚠️ No action available for: ${moduleName}`);
          }
        } catch (error) {
          errors[moduleName] = error.message;
          debugLog('warn', `⚠️ Module "${moduleName}" failed:`, error);
        }
      }

      const finalResult = {
        success: Object.keys(errors).length === 0,
        message: `Combined action completed across ${
          Object.keys(results).length
        } modules`,
        results,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
        timestamp: Date.now(),
        url: window.location.href,
      };

      debugLog('info', '✅ Combined action complete:', finalResult);
      return finalResult;
    }

    notifyReady() {
      try {
        debugLog(
          'info',
          '📢 Notifying service worker that content script is ready'
        );

        chrome.runtime.sendMessage(
          {
            type: 'contentScriptReady',
            data: {
              url: window.location.href,
              modules: Array.from(this.modules.keys()),
              moduleCount: this.modules.size,
              timestamp: Date.now(),
              initTime: this.initializationTimestamp,
            },
          },
          (response) => {
            if (chrome.runtime.lastError) {
              debugLog(
                'warn',
                '⚠️ Service worker notification failed:',
                chrome.runtime.lastError
              );
            } else {
              debugLog('info', '✅ Service worker notified successfully');
              if (response) {
                debugLog('info', 'Service worker response:', response);
              }
            }
          }
        );
      } catch (error) {
        debugLog('warn', '⚠️ Failed to notify service worker:', error);
      }
    }

    // Debug helper
    getInfo() {
      const info = {
        modules: Array.from(this.modules.keys()),
        handlers: Array.from(this.messageHandlers.keys()),
        moduleCount: this.modules.size,
        url: window.location.href,
        initialized: this.isInitialized,
        initTime: this.initializationTimestamp,
        loadTimestamp: window.cometContentScriptLoadTime,
        debugMode: this.debugMode,
      };

      debugLog('info', '📊 Manager info requested:', info);
      return info;
    }

    // Cleanup method (useful for testing)
    cleanup() {
      debugLog('info', '🧹 Cleaning up content script manager');

      this.modules.clear();
      this.messageHandlers.clear();
      this.moduleRegistry.clear();
      this.isInitialized = false;
      window.cometContentScriptLoaded = false;
      delete window.contentScriptManager;

      debugLog('info', '✅ Cleanup complete');
    }
  }

  // Initialize the content script manager with singleton pattern
  let contentScriptManager;

  try {
    // Check if already exists
    if (window.contentScriptManager) {
      debugLog('info', '🔄 Using existing manager instance');
      contentScriptManager = window.contentScriptManager;
    } else {
      debugLog('info', '🆕 Creating new manager instance');
      contentScriptManager = new CometContentScriptManager();
      window.contentScriptManager = contentScriptManager;
    }
  } catch (error) {
    debugLog('error', '❌ Failed to initialize manager:', error);
    debugLog('error', 'Error stack:', error.stack);
  }

  // Export for debugging
  if (typeof globalThis !== 'undefined' && !globalThis.contentScriptManager) {
    globalThis.contentScriptManager = contentScriptManager;
    debugLog('info', '🌐 Manager exported to globalThis for debugging');
  }

  debugLog('info', '🎉 Content script initialization complete!');
})(); // End of IIFE
