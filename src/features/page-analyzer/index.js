/**
 * Page Analyzer Feature Module (Simplified - Page Size Only)
 * Analyzes basic page size information
 * @module @voilajsx/comet
 * @file src/features/page-analyzer/index.js
 */

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

/**
 * Page Analyzer Feature Module Configuration (Simplified)
 */
const pageAnalyzerModule = {
  name: 'pageAnalyzer',

  // Message handlers this feature provides
  handlers: {
    getPageSize: () => getPageSize(),
  },

  // Main action for combined operations
  mainAction: () => getPageSize(),

  // Feature initialization
  init: () => {
    console.log('[Page Analyzer] Simple feature initialized - page size only');
  },

  // Feature metadata
  meta: {
    name: 'Page Analyzer',
    description: 'Analyzes basic page size information',
    version: '1.0.0',
    permissions: [], // No special permissions needed
  },
};

// Export the feature module
export default pageAnalyzerModule;
