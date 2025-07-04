/**
 * Feature Discovery Build Plugin - TypeScript Version
 * Auto-discovers and generates feature exports
 * @file build-plugins/feature-discovery.ts
 */

import { readdirSync, writeFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import type { Plugin } from 'vite';

// Type definitions
interface FeatureInfo {
  name: string;
  folderName: string;
  isEnabled: boolean;
}

interface GenerationStats {
  totalFeatures: number;
  enabledFeatures: number;
  disabledFeatures: number;
  lastGenerated: string;
}

/**
 * Auto-discovery plugin for feature modules
 */
export function autoDiscoverFeatures(): Plugin {
  return {
    name: 'comet-feature-discovery',
    buildStart() {
      generateFeatureIndex();
    },
    handleHotUpdate(ctx) {
      // Regenerate on feature folder changes
      if (ctx.file.includes('/features/') && ctx.file.includes('/index.')) {
        generateFeatureIndex();
      }
    },
  };
}

/**
 * Generate the feature index file
 */
function generateFeatureIndex(): void {
  try {
    const featuresDir = resolve(process.cwd(), 'src/features');
    const features = discoverFeatures(featuresDir);
    const indexContent = generateIndexContent(features);
    
    writeFileSync(join(featuresDir, 'index.ts'), indexContent, 'utf8');
    
    console.log(`[Feature Discovery] Generated index.ts with ${features.enabled.length} active features`);
  } catch (error: unknown) {
    console.error('[Feature Discovery] Failed to generate index:', error);
  }
}

/**
 * Discover all features in the features directory
 */
function discoverFeatures(featuresDir: string): {
  enabled: FeatureInfo[];
  disabled: FeatureInfo[];
  all: FeatureInfo[];
} {
  const enabled: FeatureInfo[] = [];
  const disabled: FeatureInfo[] = [];
  const all: FeatureInfo[] = [];

  try {
    const items = readdirSync(featuresDir);
    
    for (const item of items) {
      const itemPath = join(featuresDir, item);
      
      // Skip files, only process directories
      if (!statSync(itemPath).isDirectory()) continue;
      
      // Skip special directories
      if (item.startsWith('.') || item === 'node_modules') continue;
      
      const isEnabled = !item.startsWith('_');
      const cleanName = item.replace(/^_/, '');
      const camelCaseName = toCamelCase(cleanName);
      
      const feature: FeatureInfo = {
        name: camelCaseName,
        folderName: item,
        isEnabled,
      };
      
      // Check if feature has index file
      const indexPath = join(itemPath, 'index.js');
      const indexTsPath = join(itemPath, 'index.ts');
      
      try {
        let hasIndexFile = false;
        
        // Check for TypeScript file first, then JavaScript
        try {
          if (statSync(indexTsPath).isFile()) {
            hasIndexFile = true;
          }
        } catch {
          // TypeScript file doesn't exist, try JavaScript
          try {
            if (statSync(indexPath).isFile()) {
              hasIndexFile = true;
            }
          } catch {
            // Neither file exists
            hasIndexFile = false;
          }
        }
        
        if (hasIndexFile) {
          all.push(feature);
          
          if (isEnabled) {
            enabled.push(feature);
          } else {
            disabled.push(feature);
          }
        }
      } catch {
        // Error checking files, skip this feature
        console.warn(`[Feature Discovery] Skipping ${item} - no index file found`);
      }
    }
  } catch (error: unknown) {
    console.error('[Feature Discovery] Error reading features directory:', error);
  }

  return { enabled, disabled, all };
}

/**
 * Generate the index.ts file content
 */
function generateIndexContent(features: {
  enabled: FeatureInfo[];
  disabled: FeatureInfo[];
  all: FeatureInfo[];
}): string {
  const stats: GenerationStats = {
    totalFeatures: features.enabled.length,
    enabledFeatures: features.enabled.length,
    disabledFeatures: features.disabled.length,
    lastGenerated: new Date().toISOString(),
  };

  return `/**
 * Comet Framework - Feature Module Registry (Auto-Generated)
 * DO NOT EDIT - This file is automatically generated by the build system
 * Add new features by creating folders in src/features/
 * 
 * 🎛️  SIMPLE FEATURE TOGGLE:
 * ✅ Enable:  Remove underscore from folder name (feature-name)
 * ❌ Disable: Add underscore to folder name (_feature-name)
 * 🔄 Apply:   Auto-detects folder renames in dev mode!
 * 
 * @module @voilajsx/comet
 * @file src/features/index.ts
 */

// Type definitions for feature modules
export interface HandlerFunction {
  (data?: any, sender?: chrome.runtime.MessageSender): any | Promise<any>;
}

export interface PopupTabConfig {
  label: string;
  icon: string;
  order: number;
  requiresTab?: boolean;
  description?: string;
}

export interface OptionsPanelConfig {
  label: string;
  icon: string;
  section?: string;
  order: number;
  description?: string;
}

export interface FeatureUI {
  popup?: {
    tab: PopupTabConfig;
    component: () => Promise<{ default: React.ComponentType<any> }>;
  };
  options?: {
    panel: OptionsPanelConfig;
    component: () => Promise<{ default: React.ComponentType }>;
  };
}

export interface SettingSchema {
  key: string;
  default: any;
  type: 'boolean' | 'string' | 'number' | 'select';
  label: string;
  description?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface FeatureMeta {
  name: string;
  description: string;
  version: string;
  author?: string;
  category?: string;
  tags?: string[];
  permissions?: string[];
}

export interface FeatureLifecycle {
  onEnable?: () => void | Promise<void>;
  onDisable?: () => void | Promise<void>;
  onSettingsChange?: (changes: any) => void | Promise<void>;
}

export interface ModuleConfig {
  name: string;
  ui?: FeatureUI;
  settings?: Record<string, SettingSchema>;
  meta?: FeatureMeta;
  handlers?: Record<string, HandlerFunction>;
  mainAction?: HandlerFunction;
  analyze?: HandlerFunction;
  init?: () => void | Promise<void>;
  lifecycle?: FeatureLifecycle;
}

// ============================================================================
// 🚀 AUTO-DISCOVERED ACTIVE FEATURES - Generated at build time
// ============================================================================

${features.enabled
  .map(
    (feature) =>
      `export { default as ${feature.name} } from './${feature.folderName}/index.js';`
  )
  .join('\n')}

// ============================================================================
// 💤 DISABLED FEATURES (underscore prefix)
// To enable any feature: Remove underscore from folder name
// ============================================================================
${features.disabled
  .map((feature) => `// ${feature.folderName} (disabled - remove underscore to enable)`)
  .join('\n')}

${features.disabled.length === 0 ? '// No disabled features' : ''}

// ============================================================================
// Total features: ${stats.totalFeatures}
// Disabled features: ${stats.disabledFeatures}
// Last generated: ${stats.lastGenerated}
// 
// 🚀 Quick Commands:
// Enable feature:  mv src/features/_feature-name src/features/feature-name
// Disable feature: mv src/features/feature-name src/features/_feature-name
// ✨ Changes auto-detected in dev mode!
// ============================================================================
`;
}

/**
 * Convert kebab-case to camelCase
 */
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/**
 * Convert camelCase to kebab-case
 */
function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}