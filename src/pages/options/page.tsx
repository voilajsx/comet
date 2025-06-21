/**
 * Options Page - Minimal version using OptionsWrapper
 * @module @voilajsx/comet
 * @file src/pages/options/page.tsx
 */

import React from 'react';
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';

// Import the auto-discovery wrapper
import OptionsWrapper from '@/shared/layouts/OptionsWrapper';

/**
 * Simple options content - everything auto-discovered from app config
 */
function OptionsContent() {
  return (
    <OptionsWrapper />
  );
}

/**
 * Main options page with theme provider
 */
export default function OptionsPage() {
  return (
    <ThemeProvider theme="metro" variant="light" detectSystem={false}>
      <OptionsContent />
    </ThemeProvider>
  );
}