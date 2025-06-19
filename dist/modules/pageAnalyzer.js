/**
 * Comet Framework - Page Analyzer Module
 * Simple page size and word count analysis
 * @module @voilajsx/comet
 * @file src/scripts/modules/pageAnalyzer.js
 */

/**
 * Get basic page data
 * @returns {object} Simple page metrics
 */
function getPageData() {
  const text = document.body.innerText || '';
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  return {
    wordCount: words.length,
    pageSize: getPageSize(),
    title: document.title,
    url: window.location.href,
  };
}

/**
 * Get page size information
 * @returns {object} Page size data
 */
function getPageSize() {
  const html = document.documentElement.outerHTML;
  const text = document.body.innerText || '';

  return {
    htmlBytes: new Blob([html]).size,
    textBytes: new Blob([text]).size,
    formatted: formatBytes(new Blob([html]).size),
  };
}

/**
 * Format bytes to readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Page Analyzer Module Configuration
 */
const pageAnalyzerModule = {
  name: 'pageAnalyzer',

  // Message handlers this module provides
  handlers: {
    getPageData: () => getPageData(),
    getPageSize: () => getPageSize(),
  },

  // Main action for combined operations
  mainAction: () => getPageData(),

  // Module initialization (optional)
  init: () => {
    console.log('[Page Analyzer] Module initialized');
  },
};

// ✅ Export module (instead of registerModule call)
export default pageAnalyzerModule;
