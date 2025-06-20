/**
 * Content Script Vite Configuration - IIFE Bundle for Chrome Extension
 * @file vite.content-script.config.js
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // Content script - single entry
        'content-script': resolve(__dirname, 'src/platform/content-script.js'),
      },
      output: {
        entryFileNames: 'content-script.js',
        chunkFileNames: 'content-script-[hash].js',
        assetFileNames: '[name].[ext]',
        // IIFE format for content script compatibility
        format: 'iife',
        // Bundle everything together since it's just one file
        inlineDynamicImports: true,
        // Make sure chrome API is available globally
        globals: {
          chrome: 'chrome',
        },
      },
      // Don't treat chrome as external since it's available globally
      external: [],
    },
    outDir: 'dist',
    emptyOutDir: false, // Don't empty - main build already created dist/
    target: 'esnext',
    sourcemap: true,
    assetsInlineLimit: 0,
    // Ensure single bundle output
    cssCodeSplit: false,
  },

  // Same aliases as main config for consistency
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

  // No dependency optimization for content script
  optimizeDeps: {
    disabled: true,
  },

  // Ensure clean build for content script
  esbuild: {
    target: 'esnext',
    platform: 'browser',
  },
});
