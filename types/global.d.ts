/**
 * Global type definitions for Comet Framework - FIXED
 * @file types/global.d.ts
 */

/// <reference types="chrome" />
/// <reference types="vite/client" />

// ============================================================================
// Vite Environment Variables
// ============================================================================
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_URL: string;
  readonly __COMET_VERSION__: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ============================================================================
// Chrome Extension Globals
// ============================================================================
declare global {
  var chrome: typeof chrome;
  var browser: typeof chrome;
  var serviceWorkerManager: any;
  var contentScriptManager: any;
}

// ============================================================================
// Storage Module Declaration - FIXED
// ============================================================================
declare module '@voilajsx/comet/storage' {
  interface CometStorageManager {
    get(keys?: string | string[] | null, fallback?: any): Promise<any>;
    set(data: any, value?: any): Promise<boolean>;
    remove(keys: string | string[]): Promise<boolean>;
    clear(): Promise<boolean>;
    has(key: string): Promise<boolean>;
    onChange(callback: (changes: any, namespace: string) => void): () => void;
    getDefaults(): object;
  }

  export const storage: CometStorageManager;
  export { CometStorageManager };
}

// ============================================================================
// Messaging Module Declaration - FIXED
// ============================================================================
declare module '@voilajsx/comet/messaging' {
  interface CometMessage {
    type: string;
    data?: any;
    id?: number;
    timestamp?: number;
  }

  interface CometMessageResponse {
    success: boolean;
    data?: any;
    error?: string;
    module?: string;
    id?: number;
  }

  interface CometMessagingManager {
    sendToBackground(message: CometMessage): Promise<CometMessageResponse>;
    sendToContent(message: CometMessage, tabId?: number): Promise<CometMessageResponse>;
    sendToTab(tabId: number, message: CometMessage): Promise<CometMessageResponse>;
    onMessage(callback: (message: CometMessage, sender: any) => any): () => void;
    onMessageType(type: string, callback: (data: any, sender: any) => any): () => void;
    getActiveTab(): Promise<chrome.tabs.Tab | null>;
    getActiveTabId(): Promise<number | null>;
    isTabSupported(tab: chrome.tabs.Tab | string): boolean;
    setTimeout(timeout: number): void;
  }

  export const messaging: CometMessagingManager;
  export { CometMessagingManager, CometMessage, CometMessageResponse };
}

// ============================================================================
// API Module Declaration - FIXED
// ============================================================================
declare module '@voilajsx/comet/api' {
  interface CometApiOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
  }

  interface CometApiResponse {
    ok: boolean;
    status: number;
    statusText?: string;
    data: any;
    headers?: Record<string, string>;
    error?: string;
    json(): Promise<any>;
  }

  interface CometApiManager {
    fetch(url: string, options?: CometApiOptions): Promise<CometApiResponse>;
    get(url: string, headers?: Record<string, string>): Promise<CometApiResponse>;
    post(url: string, data?: any, headers?: Record<string, string>): Promise<CometApiResponse>;
    put(url: string, data?: any, headers?: Record<string, string>): Promise<CometApiResponse>;
    patch(url: string, data?: any, headers?: Record<string, string>): Promise<CometApiResponse>;
    delete(url: string, headers?: Record<string, string>): Promise<CometApiResponse>;
  }

  export const comet: CometApiManager;
  export { CometApiManager, CometApiOptions, CometApiResponse };
}

// ============================================================================
// Common Extension Types
// ============================================================================
export interface User {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  token?: string;
  loginTime?: number;
  id?: string | number;
}

export interface ExtensionSettings {
  pageAnalyzerEnabled: boolean;
  quoteGeneratorEnabled: boolean;
  authenticationEnabled: boolean;
  testingEnabled: boolean;
  extensionEnabled: boolean;
  notificationsEnabled: boolean;
  theme: 'default' | 'aurora' | 'metro' | 'neon' | 'ruby' | 'studio';
  themeVariant: 'light' | 'dark';
}

export interface ActionResult {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  timestamp?: number;
}

// Make this file a module
export {};