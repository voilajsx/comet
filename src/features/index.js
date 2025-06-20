/**
 * Comet Framework - Feature Module Registry
 * Add your feature modules here for auto-discovery
 * @module @voilajsx/comet
 * @file src/features/index.js
 */

// ============================================================================
// 🚀 ADD NEW FEATURES HERE - Just add export line for new features
// ============================================================================

export { default as pageAnalyzer } from './page-analyzer/index.js';
export { default as quoteGenerator } from './quote-generator/index.js';
//export { default as userAuth } from './user-auth/index.js';

// Add new features here:
// export { default as newFeature } from './new-feature/index.js';
// export { default as anotherFeature } from './another-feature/index.js';

// ============================================================================
// That's it! Content script will auto-discover all exported features
// ============================================================================
