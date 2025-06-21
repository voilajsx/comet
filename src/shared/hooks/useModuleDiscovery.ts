/**
 * Module Discovery Hook - Simple auto-generation from module metadata
 * @module @voilajsx/comet
 * @file src/shared/hooks/useModuleDiscovery.ts
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { storage } from '@voilajsx/comet/storage';
import { messaging } from '@voilajsx/comet/messaging';
import * as modules from '../../features/index.js';

// Simple icon mapping
import { FileText, Quote, Home } from 'lucide-react';

const ICON_MAP = {
  FileText,
  Quote, 
  Home
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
 * Simple auto-discovery hook
 */
export default function useModuleDiscovery() {
  const [loading, setLoading] = useState(true);
  const [extensionEnabled, setExtensionEnabled] = useState(true);
  const [currentTab, setCurrentTab] = useState(null);
  
  const allModules = useMemo(() => Object.values(modules), []);
  
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
    if (!extensionEnabled) return [];

    const tabs: PopupTab[] = [];

    console.log('[Module Discovery] Processing modules for popup tabs:', allModules.length);

    for (const module of allModules) {
      console.log('[Module Discovery] Checking module:', module.name, 'has popup UI:', !!module.ui?.popup);
      
      if (!module.ui?.popup) continue;

      const { tab, component } = module.ui.popup;
      
      // Skip if requires tab but current tab not supported
      if (tab.requiresTab && !messaging.isTabSupported(currentTab)) {
        console.log('[Module Discovery] Skipping', module.name, '- tab not supported');
        continue;
      }

      // Always create the tab entry - don't wait for lazy loading
      const LazyComponent = React.lazy(component);
      const moduleKey = getModuleFolderName(module);
      
      console.log('[Module Discovery] Adding tab:', moduleKey, 'label:', tab.label, 'order:', tab.order);
      
      tabs.push({
        id: moduleKey,
        label: tab.label,
        icon: getIcon(tab.icon),
        requiresTab: tab.requiresTab,
        order: tab.order || 999,
        content: React.createElement(
          React.Suspense,
          { fallback: createLoadingFallback() },
          React.createElement(LazyComponent, {
            value: moduleKey,
            currentTab: currentTab
          })
        )
      });
    }

    // Sort by order and return immediately - all tabs should be visible
    const sortedTabs = tabs.sort((a, b) => a.order - b.order);
    console.log('[Module Discovery] Final tabs:', sortedTabs.map(t => ({ id: t.id, label: t.label, order: t.order })));
    
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

    for (const module of allModules) {
      if (!module.ui?.options) continue;

      const { panel } = module.ui.options;
      const moduleKey = getModuleFolderName(module);
      
      navItems.push({
        key: moduleKey,
        label: panel.label,
        icon: getIcon(panel.icon),
        onClick: () => scrollToSection(moduleKey)
      });
    }

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