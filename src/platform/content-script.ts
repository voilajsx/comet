/**
 * Comet Framework - Essential Content Script with DEBUG LOGGING
 * Auto-discovers modules from src/features/ folder
 * @module @voilajsx/comet
 * @file src/platform/content-script.ts
 */

// Type definitions
interface ModuleConfig {
  name: string;
  handlers?: Record<string, HandlerFunction>;
  mainAction?: HandlerFunction;
  analyze?: HandlerFunction;
  init?: () => void | Promise<void>;
}

interface HandlerFunction {
  (data?: any, sender?: chrome.runtime.MessageSender): any | Promise<any>;
}

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
  module?: string;
  id?: number;
  timestamp?: number;
  availableHandlers?: string[];
  moduleCount?: number;
  initTime?: number;
}

interface ManagerInfo {
  modules: string[];
  handlers: string[];
  moduleCount: number;
  url: string;
  initialized: boolean;
  initTime: number;
  loadTimestamp?: number;
  debugMode: boolean;
}

interface CombinedActionResult {
  success: boolean;
  message: string;
  results: Record<string, any>;
  errors?: Record<string, string>;
  timestamp: number;
  url: string;
}

// ============================================================================
// 🐛 DEBUG: Optimized logging for dev experience
// ============================================================================
function debugLog(level: 'info' | 'warn' | 'error', message: string, data: any = null): void {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  const prefix = `[Comet ${timestamp}]`;

  if (data) {
    console[level](`${prefix} ${message}`, data);
  } else {
    console[level](`${prefix} ${message}`);
  }
}

// ============================================================================
// 🚨 CRITICAL: Prevent duplicate execution using IIFE for ES module compatibility
// ============================================================================
(async function initContentScript(): Promise<void> {
  debugLog('info', '🚀 Content script initializing');

  // Check if already loaded
  if ((window as any).cometContentScriptLoaded) {
    debugLog('warn', '⚠️ Script already loaded, exiting');
    return;
  }

  // Mark as loaded immediately to prevent race conditions
  (window as any).cometContentScriptLoaded = true;
  (window as any).cometContentScriptLoadTime = Date.now();

  // Additional safety check for manager instance
  if (
    (window as any).contentScriptManager &&
    (window as any).contentScriptManager.isInitialized
  ) {
    debugLog('warn', '⚠️ Manager already initialized, exiting');
    return;
  }

  // Check if Chrome extension APIs are available
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    debugLog('error', '❌ Chrome extension APIs not available');
    return;
  }

  // AUTO-DISCOVERY - Modules are auto-loaded
  let ALL_MODULES: ModuleConfig[] = [];
  debugLog('info', '📦 Loading modules...');

  try {
    // Import modules with type assertion
    const modules: any = await import('../features/index.ts');
    ALL_MODULES = Object.values(modules) as ModuleConfig[];
    debugLog('info', `✅ ${ALL_MODULES.length} modules loaded`);

    // Quick validation
    const invalidModules = ALL_MODULES.filter(m => !m || !m.name);
    if (invalidModules.length > 0) {
      debugLog('warn', `⚠️ ${invalidModules.length} invalid modules found`);
    }
  } catch (error: unknown) {
    debugLog('error', '❌ Failed to load modules:', error);
    ALL_MODULES = [];
  }

  /**
   * Essential Comet Content Script Manager with Enhanced Debug Logging
   */
  class CometContentScriptManager {
    public isInitialized: boolean;
    private modules: Map<string, ModuleConfig>;
    private messageHandlers: Map<string, HandlerFunction>;
    private moduleRegistry: Map<string, string>;
    private initializationTimestamp: number;
    private debugMode: boolean;

    constructor() {
      debugLog('info', '🏗️ Creating manager instance');

      this.isInitialized = false;
      this.modules = new Map();
      this.messageHandlers = new Map();
      this.moduleRegistry = new Map();
      this.initializationTimestamp = Date.now();
      this.debugMode = true;

      // Prevent multiple initialization
      if ((window as any).contentScriptManager) {
        debugLog('warn', '⚠️ Manager instance already exists, returning existing');
        return (window as any).contentScriptManager;
      }

      this.initialize();
    }

    async initialize(): Promise<void> {
      if (this.isInitialized) {
        debugLog('warn', '⚠️ Manager already initialized, skipping');
        return;
      }

      debugLog('info', `🚀 Initializing on: ${window.location.hostname}`);

      try {
        this.setupMessageHandling();
        this.registerCoreHandlers();
        this.loadModules();
        this.notifyReady();

        this.isInitialized = true;
        debugLog('info', `✅ Initialization complete! ${this.modules.size} modules, ${this.messageHandlers.size} handlers`);
      } catch (error: unknown) {
        debugLog('error', '❌ Initialization failed:', error);
        this.isInitialized = true; // Mark as initialized even on error to prevent retries
      }
    }

    setupMessageHandling(): void {
      try {
        chrome.runtime.onMessage.addListener(
          (message: MessageRequest, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
          }
        );
      } catch (error: unknown) {
        debugLog('error', '❌ Message handling setup failed:', error);
      }
    }

    registerCoreHandlers(): void {
      // Core framework handlers
      this.registerHandler('ping', () => {
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
        return {
          url: window.location.href,
          title: document.title,
          hostname: window.location.hostname,
          timestamp: Date.now(),
        };
      });

      this.registerHandler('getModules', () => {
        return {
          modules: Array.from(this.modules.keys()),
          handlers: Array.from(this.messageHandlers.keys()),
          moduleCount: this.modules.size,
          initTime: this.initializationTimestamp,
        };
      });

      this.registerHandler('performMainAction', (data: any) => {
        return this.performCombinedAction(data);
      });
    }

    loadModules(): void {
      debugLog('info', `📦 Loading ${ALL_MODULES.length} modules...`);

      let loadedCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < ALL_MODULES.length; i++) {
        const moduleData = ALL_MODULES[i];

        try {
          if (moduleData && this.isValidModule(moduleData)) {
            const registerResult = this.registerModule(moduleData);
            if (registerResult) {
              loadedCount++;
            } else {
              skippedCount++;
            }
          } else {
            debugLog('warn', `❌ Module ${i + 1} is invalid`);
            skippedCount++;
          }
        } catch (error: unknown) {
          debugLog('error', `❌ Failed to register module ${i + 1}:`, error);
          skippedCount++;
        }
      }

      debugLog('info', `📊 Module loading complete: ${loadedCount} loaded, ${skippedCount} skipped`);
    }

    registerModule(moduleConfig: ModuleConfig): boolean {
      try {
        const name = moduleConfig.name;

        // Enhanced duplicate detection
        if (this.modules.has(name)) {
          debugLog('warn', `⚠️ Module "${name}" already registered, skipping`);
          return false;
        }

        // Check for handler conflicts before registering module
        if (moduleConfig.handlers) {
          const conflictingHandlers: string[] = [];
          Object.keys(moduleConfig.handlers).forEach((handlerName) => {
            if (this.messageHandlers.has(handlerName)) {
              const existingModule = this.moduleRegistry.get(handlerName);
              conflictingHandlers.push(`${handlerName} (existing: ${existingModule})`);
            }
          });

          if (conflictingHandlers.length > 0) {
            debugLog('warn', `⚠️ Module "${name}" has conflicting handlers: ${conflictingHandlers.join(', ')}, skipping`);
            return false;
          }
        }

        // Register the module
        this.modules.set(name, moduleConfig);

        // Register module handlers
        if (moduleConfig.handlers) {
          Object.entries(moduleConfig.handlers).forEach(
            ([handlerName, handlerFunc]) => {
              if (typeof handlerFunc === 'function') {
                this.registerHandler(handlerName, handlerFunc);
                this.moduleRegistry.set(handlerName, name);
              } else {
                debugLog('warn', `⚠️ Handler "${handlerName}" is not a function in module "${name}"`);
              }
            }
          );
        }

        // Initialize module
        if (typeof moduleConfig.init === 'function') {
          try {
            moduleConfig.init();
          } catch (error: unknown) {
            debugLog('warn', `⚠️ Module "${name}" init failed:`, error);
          }
        }

        return true;
      } catch (error: unknown) {
        debugLog('error', '❌ Module registration failed:', error);
        return false;
      }
    }

    isValidModule(moduleConfig: ModuleConfig): boolean {
      return !!(
        moduleConfig &&
        typeof moduleConfig === 'object' &&
        moduleConfig.name &&
        typeof moduleConfig.name === 'string' &&
        (moduleConfig.handlers || moduleConfig.mainAction)
      );
    }

    registerHandler(type: string, handler: HandlerFunction): boolean {
      if (typeof handler !== 'function') {
        debugLog('error', `❌ Handler for "${type}" must be a function`);
        throw new Error(`Handler for "${type}" must be a function`);
      }

      // Check for duplicate handlers
      if (this.messageHandlers.has(type)) {
        const existingModule = this.moduleRegistry.get(type);
        debugLog('warn', `⚠️ Handler "${type}" already exists (module: ${existingModule}), skipping`);
        return false;
      }

      this.messageHandlers.set(type, handler);
      return true;
    }

    async handleMessage(message: MessageRequest, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): Promise<void> {
      try {
        const { type, data, id } = message;

        if (!type) {
          debugLog('error', '❌ Message missing type field');
          sendResponse({ success: false, error: 'Message type required' });
          return;
        }

        const handler = this.messageHandlers.get(type);
        if (!handler) {
          debugLog('warn', `⚠️ No handler found for: ${type}`);
          sendResponse({
            success: false,
            error: `No handler for: ${type}`,
            availableHandlers: Array.from(this.messageHandlers.keys()),
            moduleCount: this.modules.size,
            initTime: this.initializationTimestamp,
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
          timestamp: Date.now(),
        });
      } catch (error: unknown) {
        debugLog('error', '❌ Message handling error:', error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Internal error',
          id: message.id,
          timestamp: Date.now(),
        });
      }
    }

    async executeHandler(handler: HandlerFunction, data: any, sender: chrome.runtime.MessageSender): Promise<any> {
      try {
        const result = await handler(data, sender);
        return result;
      } catch (error: unknown) {
        debugLog('error', '❌ Handler execution error:', error);
        throw error;
      }
    }

    async performCombinedAction(data: any): Promise<CombinedActionResult> {
      const results: Record<string, any> = {};
      const errors: Record<string, string> = {};

      for (const [moduleName, moduleConfig] of this.modules) {
        try {
          if (typeof moduleConfig.mainAction === 'function') {
            results[moduleName] = await moduleConfig.mainAction(data);
          } else if (typeof moduleConfig.analyze === 'function') {
            results[moduleName] = await moduleConfig.analyze(data);
          }
        } catch (error: unknown) {
          errors[moduleName] = error instanceof Error ? error.message : String(error);
          debugLog('warn', `⚠️ Module "${moduleName}" failed:`, error);
        }
      }

      const finalResult: CombinedActionResult = {
        success: Object.keys(errors).length === 0,
        message: `Combined action completed across ${Object.keys(results).length} modules`,
        results,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
        timestamp: Date.now(),
        url: window.location.href,
      };

      return finalResult;
    }

    notifyReady(): void {
      try {
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
          (response: any) => {
            if (chrome.runtime.lastError) {
              debugLog('warn', '⚠️ Service worker notification failed:', chrome.runtime.lastError);
            }
          }
        );
      } catch (error: unknown) {
        debugLog('warn', '⚠️ Failed to notify service worker:', error);
      }
    }

    // Debug helper
    getInfo(): ManagerInfo {
      return {
        modules: Array.from(this.modules.keys()),
        handlers: Array.from(this.messageHandlers.keys()),
        moduleCount: this.modules.size,
        url: window.location.href,
        initialized: this.isInitialized,
        initTime: this.initializationTimestamp,
        loadTimestamp: (window as any).cometContentScriptLoadTime,
        debugMode: this.debugMode,
      };
    }

    // Cleanup method (useful for testing)
    cleanup(): void {
      debugLog('info', '🧹 Cleaning up content script manager');

      this.modules.clear();
      this.messageHandlers.clear();
      this.moduleRegistry.clear();
      this.isInitialized = false;
      (window as any).cometContentScriptLoaded = false;
      delete (window as any).contentScriptManager;
    }
  }

  // Initialize the content script manager with singleton pattern
  let contentScriptManager: CometContentScriptManager | undefined;

  try {
    // Check if already exists
    if ((window as any).contentScriptManager) {
      debugLog('info', '🔄 Using existing manager instance');
      contentScriptManager = (window as any).contentScriptManager;
    } else {
      debugLog('info', '🆕 Creating new manager instance');
      contentScriptManager = new CometContentScriptManager();
      (window as any).contentScriptManager = contentScriptManager;
    }
  } catch (error: unknown) {
    debugLog('error', '❌ Failed to initialize manager:', error);
  }

  // Export for debugging
  if (typeof globalThis !== 'undefined' && contentScriptManager && !globalThis.contentScriptManager) {
    globalThis.contentScriptManager = contentScriptManager;
  }

  debugLog('info', '🎉 Content script initialization complete!');
})(); // End of IIFE