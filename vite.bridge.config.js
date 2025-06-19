/**
 * Vite configuration for Comet bridge script (content script)
 * Builds only the bridge in IIFE format for content script compatibility
 * @module @voilajsx/comet
 * @file vite.bridge.config.js
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // Only bridge script
        bridge: resolve(__dirname, 'src/scripts/bridge.js'),
      },
      output: {
        entryFileNames: 'bridge.js',
        chunkFileNames: 'bridge-[hash].js',
        assetFileNames: '[name].[ext]',
        // IIFE format for content script
        format: 'iife',
        // Bundle everything together since it's just one file
        inlineDynamicImports: true,
        // Make sure chrome API is available
        globals: {
          chrome: 'chrome',
        },
      },
      // Don't treat chrome as external since it's global
      external: [],
    },
    outDir: 'dist',
    emptyOutDir: false, // Don't empty - main build already created dist/
    target: 'esnext',
    sourcemap: true,
    assetsInlineLimit: 0,
  },

  // Add same aliases as main config for consistency
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types'),
      '@voilajsx/comet/storage': resolve(__dirname, 'src/platform/storage.js'),
      '@voilajsx/comet/messaging': resolve(
        __dirname,
        'src/platform/messaging.js'
      ),
      '@voilajsx/comet/background': resolve(
        __dirname,
        'src/platform/background.js'
      ),
      '@voilajsx/comet/api': resolve(__dirname, 'src/platform/api.js'),
      '@voilajsx/comet/platform': resolve(__dirname, 'src/platform'),
    },
  },

  define: {
    global: 'globalThis',
    __COMET_VERSION__: JSON.stringify(
      process.env.npm_package_version || '1.0.0'
    ),
  },
});
