/**
 * Updated Popup Page - Auto-Discovery Version with App Config
 * @module @voilajsx/comet
 * @file src/pages/popup/page.tsx
 */

import React from 'react';
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';

// Import the auto-discovery wrapper
import PopupWrapper from '@/shared/layouts/PopupWrapper';

/**
 * Simple popup content - everything auto-discovered from app config
 */
function PopupContent() {
  return (
    <PopupWrapper />
  );
}

/**
 * Main popup page with theme provider
 */
export default function PopupPage() {
  return (
    <ThemeProvider theme="metro" variant="light" detectSystem={false}>
      <PopupContent />
    </ThemeProvider>
  );
}