/**
 * Comet Framework - Background TypeScript Definitions
 * Essential types for background manager
 * @module @voilajsx/comet
 * @file src/platform/background.d.ts
 */

export interface MessageHandler {
  (data: any, sender?: chrome.runtime.MessageSender): any | Promise<any>;
}

export interface EventListener {
  (data: any): any | Promise<any>;
}

export interface AppConfig {
  messageHandlers?: Record<string, MessageHandler>;
  [key: string]: any;
}

export interface UniversalApiFetchRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface UniversalApiFetchResponse {
  success: boolean;
  status: number;
  statusText?: string;
  data: any;
  headers: Record<string, string>;
  error?: string;
  isTimeout?: boolean;
}

export interface ExtensionInfo {
  id: string;
  version: string;
  manifest: chrome.runtime.Manifest;
  initialized: boolean;
  browser: {
    type: 'firefox' | 'chromium' | 'unknown';
    api: 'browser' | 'chrome' | 'unknown';
  };
}

export interface CometBackgroundManager {
  // Properties
  readonly extensionId: string;
  readonly version: string;
  readonly isInitialized: boolean;

  // Message handling
  registerMessageHandler(type: string, handler: MessageHandler): void;
  registerMessageHandlers(handlers: Record<string, MessageHandler>): void;

  // Event system
  addEventListener(event: string, listener: EventListener): void;
  emitEvent(event: string, data: any): Promise<any>;

  // Badge operations
  setBadgeText(text: string, tabId?: number): Promise<boolean>;
  setBadgeColor(color: string | chrome.action.ColorArray, tabId?: number): Promise<boolean>;

  // Universal API
  universalApiFetch(request: UniversalApiFetchRequest): Promise<UniversalApiFetchResponse>;

  // Utilities
  getExtensionInfo(): ExtensionInfo;
}

export declare const backgroundManager: CometBackgroundManager;