/**
 * Page Analyzer Feature Module - Metadata First Architecture (Updated)
 * Analyzes basic page size information with simplified settings
 * @module @voilajsx/comet
 * @file src/features/page-analyzer/index.js
 */

// 📋 METADATA & CONFIGURATION (Easy Access at Top)
const config = {
  name: 'pageAnalyzer',

  // 🎨 UI Auto-Discovery Configuration
  ui: {
    popup: {
      tab: {
        label: 'Analyzer',
        icon: 'FileText',
        order: 1,
        requiresTab: true,
        description: 'Analyze current page size and structure',
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        label: 'Page Analyzer',
        icon: 'FileText',
        section: 'features',
        order: 2,
        description: 'Configure page analysis settings and display options',
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  // ⚙️ Settings Schema (Simplified)
  settings: {
    showDetailedView: {
      key: 'pageAnalyzer.showDetailedView',
      default: true,
      type: 'boolean',
      label: 'Show Detailed View',
      description: 'Display breakdown of HTML, text, images, and links',
    },
    autoAnalyze: {
      key: 'pageAnalyzer.autoAnalyze',
      default: false,
      type: 'boolean',
      label: 'Auto Analyze',
      description: 'Automatically analyze pages when visiting',
    },
  },

  // ℹ️ Feature Metadata
  meta: {
    name: 'Page Analyzer',
    description: 'Analyzes basic page size information and structure',
    version: '1.2.0',
    permissions: [],
    author: 'Comet Framework',
    category: 'analysis',
    tags: ['page', 'size', 'analysis', 'performance'],
  },

  // 🔧 BUSINESS LOGIC & HANDLERS
  handlers: {
    getPageSize: () => getPageSize(),
    analyzeCurrentPage: () => getPageSize(),
    getPageMetrics: () => {
      const sizeData = getPageSize();
      return {
        ...sizeData,
        metrics: {
          totalElements: document.querySelectorAll('*').length,
          scripts: document.scripts.length,
          stylesheets: document.styleSheets.length,
          iframes: document.querySelectorAll('iframe').length,
        },
      };
    },
  },

  // Main action for combined operations
  mainAction: () => getPageSize(),

  // Feature initialization
  init: () => {
    console.log('[Page Analyzer] Feature initialized with simplified settings');
  },

  // Lifecycle hooks
  lifecycle: {
    onEnable: () => {
      console.log('[Page Analyzer] Feature enabled');
    },
    onDisable: () => {
      console.log('[Page Analyzer] Feature disabled');
    },
    onSettingsChange: (changedSettings) => {
      console.log('[Page Analyzer] Settings changed:', changedSettings);
    },
  },
};

// 💼 HELPER FUNCTIONS (Business Logic Implementation)

/**
 * Get page size information
 * @returns {object} Page size data with multiple metrics
 */
function getPageSize() {
  const html = document.documentElement.outerHTML;
  const text = document.body.innerText || '';
  const images = document.images.length;
  const links = document.links.length;

  return {
    htmlBytes: new Blob([html]).size,
    textBytes: new Blob([text]).size,
    formatted: formatBytes(new Blob([html]).size),
    images,
    links,
    timestamp: Date.now(),
  };
}

/**
 * Format bytes to readable string
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Export the feature module
export default config;
