/**
 * Comet Framework - Messaging TypeScript Definitions
 * Essential types for messaging utility
 * @module @voilajsx/comet
 * @file types/messaging.d.ts
 */

declare module '@voilajsx/comet/messaging' {
  export interface MessageOptions {
    timeout?: number;
    retries?: number;
  }

  export interface BroadcastResponse {
    tabId: number;
    url: string;
    success: boolean;
    response?: any;
    error?: string;
  }

  export class CometMessagingError extends Error {
    name: 'CometMessagingError';
    originalError?: Error;
    constructor(message: string, originalError?: Error);
  }

  export interface CometMessagingManager {
    // Core messaging
    sendToBackground(message: Record<string, any>, options?: MessageOptions): Promise<any>;
    sendToContent(message: Record<string, any>, tabId?: number | null, options?: MessageOptions): Promise<any>;
    sendToTab(tabId: number, message: Record<string, any>, options?: MessageOptions): Promise<any>;
    broadcast(message: Record<string, any>, options?: MessageOptions): Promise<BroadcastResponse[]>;

    // Message listening
    onMessage(callback: (message: any, sender: chrome.runtime.MessageSender) => any): () => void;
    onMessageType(type: string, callback: (data: any, sender: chrome.runtime.MessageSender) => any): () => void;

    // Tab utilities
    getActiveTab(): Promise<chrome.tabs.Tab | null>;
    getActiveTabId(): Promise<number | null>;
    isTabSupported(tab: chrome.tabs.Tab | string): boolean;

    // Configuration
    setTimeout(timeout: number): void;
    setRetryConfig(attempts: number, delay: number): void;
  }

  export const messaging: CometMessagingManager;
}