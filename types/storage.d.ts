/**
 * Comet Framework - Storage TypeScript Definitions
 * Essential types for storage utility
 * @module @voilajsx/comet
 * @file types/storage.d.ts
 */

declare module '@voilajsx/comet/storage' {
  export type StorageNamespace = 'sync' | 'local' | 'auto' | 'both';

  export interface StorageUsageInfo {
    used: number;
    total: number;
    percentage: number;
    available: number;
  }

  export interface StorageUsage {
    sync?: StorageUsageInfo;
    local?: StorageUsageInfo;
  }

  export class CometStorageError extends Error {
    name: 'CometStorageError';
    originalError?: Error;
    constructor(message: string, originalError?: Error);
  }

  export interface CometStorageManager {
    // Core operations
    get<T = any>(
      keys?: string | string[] | Record<string, any> | null, 
      fallback?: T, 
      namespace?: StorageNamespace
    ): Promise<T>;
    
    set(
      data: Record<string, any> | string, 
      value?: any, 
      namespace?: StorageNamespace
    ): Promise<boolean>;
    
    remove(keys: string | string[], namespace?: StorageNamespace): Promise<boolean>;
    clear(namespace?: StorageNamespace): Promise<boolean>;
    
    // Utilities
    has(key: string, namespace?: StorageNamespace): Promise<boolean>;
    getUsage(namespace?: StorageNamespace): Promise<StorageUsage>;
    onChange(callback: (changes: Record<string, chrome.storage.StorageChange>, namespace: string) => void): () => void;
    resetToDefaults(): Promise<boolean>;
    getDefaults(): Record<string, any>;
  }

  export const storage: CometStorageManager;
}