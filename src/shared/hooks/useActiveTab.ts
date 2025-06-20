/**
 * Active Tab Hook - Manages tab state and current tab info
 * @module @voilajsx/comet
 * @file src/shared/hooks/useActiveTab.ts
 */

import { useState, useEffect } from 'react';
import { messaging } from '@voilajsx/comet/messaging';
import { storage } from '@voilajsx/comet/storage';

interface UseActiveTabOptions {
  storageKey?: string;
  defaultTab?: string;
}

interface UseActiveTabReturn {
  // Tab state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Current browser tab info
  currentTab: chrome.tabs.Tab | null;
  isTabSupported: boolean;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Utilities
  refreshTab: () => Promise<void>;
}

/**
 * Hook for managing tab state and current browser tab info
 * Automatically persists tab selection and provides current tab details
 */
export default function useActiveTab({
  storageKey = 'activeTab',
  defaultTab = ''
}: UseActiveTabOptions = {}): UseActiveTabReturn {
  const [activeTab, setActiveTabState] = useState<string>(defaultTab);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved tab on mount
  useEffect(() => {
    const loadSavedTab = async () => {
      try {
        const savedTab = await storage.get(storageKey, defaultTab);
        if (savedTab) {
          setActiveTabState(savedTab);
        }
      } catch (err) {
        console.warn('[useActiveTab] Failed to load saved tab:', err);
      }
    };

    loadSavedTab();
  }, [storageKey, defaultTab]);

  // Get current browser tab on mount
  useEffect(() => {
    getCurrentTab();
  }, []);

  /**
   * Get current browser tab information
   */
  const getCurrentTab = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tab = await messaging.getActiveTab();
      setCurrentTab(tab);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get current tab';
      setError(errorMessage);
      console.error('[useActiveTab] Failed to get current tab:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set active tab and persist to storage
   */
  const setActiveTab = async (tab: string) => {
    try {
      setActiveTabState(tab);
      await storage.set(storageKey, tab);
    } catch (err) {
      console.warn('[useActiveTab] Failed to save active tab:', err);
    }
  };

  /**
   * Refresh current browser tab info
   */
  const refreshTab = async () => {
    await getCurrentTab();
  };

  // Check if current tab supports content scripts
  const isTabSupported = currentTab ? messaging.isTabSupported(currentTab) : false;

  return {
    // Tab state
    activeTab,
    setActiveTab,
    
    // Current browser tab info
    currentTab,
    isTabSupported,
    
    // Loading states
    loading,
    error,
    
    // Utilities
    refreshTab,
  };
}