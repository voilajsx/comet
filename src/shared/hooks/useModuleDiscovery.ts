/**
 * Module Discovery Hook - Fixed duplicate processing
 * @module @voilajsx/comet
 * @file src/shared/hooks/useModuleDiscovery.ts
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { storage } from '@voilajsx/comet/storage';
import { messaging } from '@voilajsx/comet/messaging';
import * as modules from '../../features/index.js';

// Simple icon mapping - Top 10 most useful icons
import { FileText, Quote, Home, Camera, Sun, Smile, Heart, Star, Settings, Zap } from 'lucide-react';

const ICON_MAP = {
  FileText,
  Quote, 
  Home,
  Camera,
  Sun,
  Smile,
  Heart,
  Star,
  Settings,
  Zap
};

interface PopupTab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  requiresTab?: boolean;
  order?: number;
}

interface OptionsNavItem {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

/**
 * Fixed auto-discovery hook with duplicate prevention
 */
export default function useModuleDiscovery() {
  const [loading, setLoading] = useState(true);
  const [extensionEnabled, setExtensionEnabled] = useState(true);
  const [currentTab, setCurrentTab] = useState(null);
  
  // Get unique modules by name to prevent duplicates
  const allModules = useMemo(() => {
    const moduleValues = Object.values(modules);
    const uniqueModules = new Map();
    
    console.log('[Module Discovery] Raw modules loaded:', moduleValues.length, moduleValues.map(m => m.name));
    
    moduleValues.forEach((module, index) => {
      if (module && module.name) {
        if (uniqueModules.has(module.name)) {
          console.warn(`[Module Discovery] Duplicate module detected: ${module.name} at index ${index}, skipping`);
        } else {
          uniqueModules.set(module.name, module);
          console.log(`[Module Discovery] Added unique module: ${module.name}`);
        }
      } else {
        console.warn(`[Module Discovery] Invalid module at index ${index}:`, module);
      }
    });
    
    const result = Array.from(uniqueModules.values());
    console.log('[Module Discovery] Final unique modules:', result.map(m => m.name));
    return result;
  }, []);
  
  useEffect(() => {
    initializeDiscovery();
  }, []);

  const initializeDiscovery = async () => {
    try {
      setLoading(true);
      
      // Get current tab and extension state
      const tab = await messaging.getActiveTab();
      const enabled = await storage.get('extensionEnabled', true);
      
      setCurrentTab(tab);
      setExtensionEnabled(enabled);
      
      console.log('[Module Discovery] Initialization complete:', {
        tabSupported: tab ? messaging.isTabSupported(tab) : false,
        extensionEnabled: enabled,
        totalModules: allModules.length
      });
    } catch (error) {
      console.error('[Module Discovery] Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions with useCallback for stable references
  const getIcon = useCallback((iconName: string) => ICON_MAP[iconName] || undefined, []);

  const getModuleFolderName = useCallback((module: any) => {
    // Map known modules to their folder names
    if (module.name === 'pageAnalyzer') return 'page-analyzer';
    if (module.name === 'quoteGenerator') return 'quote-generator';
    if (module.name === 'websiteScreenshot') return 'website-screenshot';
    if (module.name === 'helloWorld') return 'hello-world';
    
    // Default: convert camelCase to kebab-case
    return module.name.replace(/([A-Z])/g, '-$1').toLowerCase();
  }, []);

  const createLoadingFallback = useCallback(() => {
    return React.createElement('div', {
      className: 'p-4 text-center'
    }, 'Loading...');
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Generate popup tabs
  const popupTabs = useMemo(() => {
    if (!extensionEnabled) {
      console.log('[Module Discovery] Extension disabled, no tabs');
      return [];
    }

    const tabs: PopupTab[] = [];
    const tabsById = new Map(); // Track tabs by ID to prevent duplicates

    console.log('[Module Discovery] Processing modules for popup tabs:', allModules.length);
    console.log('[Module Discovery] Current tab supported:', currentTab ? messaging.isTabSupported(currentTab) : 'no tab');
    console.log('[Module Discovery] Current tab URL:', currentTab?.url || 'no URL');

    for (const module of allModules) {
      console.log('[Module Discovery] Checking module:', module.name, 'has popup UI:', !!module.ui?.popup);
      
      if (!module.ui?.popup) {
        console.log('[Module Discovery] Module', module.name, 'has no popup UI');
        continue;
      }

      const { tab, component } = module.ui.popup;
      
      // Debug tab requirements
      console.log('[Module Discovery] Module', module.name, 'requiresTab:', tab.requiresTab);
      console.log('[Module Discovery] Tab supported:', messaging.isTabSupported(currentTab));
      
      // Skip if requires tab but current tab not supported
      if (tab.requiresTab && !messaging.isTabSupported(currentTab)) {
        console.log('[Module Discovery] Skipping', module.name, '- tab not supported');
        continue;
      }

      const moduleKey = getModuleFolderName(module);
      
      // Check for duplicate tab IDs
      if (tabsById.has(moduleKey)) {
        console.warn('[Module Discovery] Duplicate tab ID detected:', moduleKey, 'skipping');
        continue;
      }

      // Create tab content with error boundary
      const LazyComponent = React.lazy(component);
      
      console.log('[Module Discovery] ✅ Adding tab:', moduleKey, 'label:', tab.label, 'order:', tab.order);
      
      const tabContent = React.createElement(
        React.Suspense,
        { fallback: createLoadingFallback() },
        React.createElement(LazyComponent, {
          value: moduleKey,
          currentTab: currentTab
        })
      );
      
      const tabEntry = {
        id: moduleKey,
        label: tab.label,
        icon: getIcon(tab.icon),
        requiresTab: tab.requiresTab,
        order: tab.order || 999,
        content: tabContent
      };
      
      tabs.push(tabEntry);
      tabsById.set(moduleKey, tabEntry);
    }

    // Sort by order and return immediately - all tabs should be visible
    const sortedTabs = tabs.sort((a, b) => a.order - b.order);
    console.log('[Module Discovery] Final tabs:', sortedTabs.map(t => ({ id: t.id, label: t.label, order: t.order, requiresTab: t.requiresTab })));
    
    return sortedTabs;
  }, [allModules, extensionEnabled, currentTab, getModuleFolderName, createLoadingFallback, getIcon]);

  // Generate options navigation
  const optionsNavigation = useMemo(() => {
    const navItems: OptionsNavItem[] = [
      {
        key: 'general',
        label: 'General',
        icon: getIcon('Home'),
        onClick: () => scrollToSection('general')
      }
    ];

    const addedKeys = new Set(['general']); // Track added keys to prevent duplicates

    for (const module of allModules) {
      if (!module.ui?.options) continue;

      const { panel } = module.ui.options;
      const moduleKey = getModuleFolderName(module);
      
      // Check for duplicate keys
      if (addedKeys.has(moduleKey)) {
        console.warn('[Module Discovery] Duplicate options key detected:', moduleKey, 'skipping');
        continue;
      }
      
      navItems.push({
        key: moduleKey,
        label: panel.label,
        icon: getIcon(panel.icon),
        onClick: () => scrollToSection(moduleKey)
      });
      
      addedKeys.add(moduleKey);
    }

    console.log('[Module Discovery] Options navigation items:', navItems.map(item => item.key));
    return navItems;
  }, [allModules, getModuleFolderName, scrollToSection, getIcon]);

  return {
    popupTabs,
    optionsNavigation,
    loading,
    currentTab,
    extensionEnabled
  };
}