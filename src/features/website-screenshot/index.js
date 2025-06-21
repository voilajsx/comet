/**
 * Website Screenshot Feature Module - No Service Worker Required
 * @module @voilajsx/comet
 * @file src/features/website-screenshot/index.js
 */

// 📋 METADATA & CONFIGURATION
const config = {
  name: 'websiteScreenshot',

  // 🎨 UI Auto-Discovery Configuration
  ui: {
    popup: {
      tab: {
        label: 'Screenshot',
        icon: 'Camera',
        order: 3,
        requiresTab: true,
        description: 'Take a screenshot',
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        label: 'Website Screenshot',
        icon: 'Camera',
        section: 'features',
        order: 4,
        description: 'Configure screenshot feature',
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  // ⚙️ Settings Schema
  settings: {
    enabled: {
      key: 'websiteScreenshot.enabled',
      default: true,
      type: 'boolean',
      label: 'Enable Screenshot Feature',
      description: 'Allow taking screenshots of websites',
    },
  },

  // ℹ️ Feature Metadata
  meta: {
    name: 'Website Screenshot',
    description: 'Take screenshots of websites',
    version: '1.0.0',
    permissions: ['activeTab'],
    author: 'Comet Framework',
    category: 'utility',
    tags: ['screenshot'],
  },

  // 🔧 BUSINESS LOGIC & HANDLERS (Not needed - everything in popup)
  handlers: {},

  // Main action
  mainAction: () => ({ message: 'Screenshot feature ready' }),

  // Feature initialization
  init: () => {
    console.log('[Website Screenshot] No-background feature initialized');
  },
};

// Export the feature module
export default config;
