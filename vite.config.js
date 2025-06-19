/**
 * Vite configuration for Comet browser extension development
 * Excludes bridge script - builds only UI components and background
 * @module @voilajsx/comet
 * @file vite.config.js
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    rollupOptions: {
      input: {
        // HTML files for popup and options pages
        popup: resolve(__dirname, 'src/pages/popup/index.html'),
        options: resolve(__dirname, 'src/pages/options/index.html'),

        // Background script only (no bridge)
        background: resolve(__dirname, 'src/platform/background.js'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          return '[name].js';
        },
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]',
        // Use ES modules - works for background and pages
        format: 'es',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    sourcemap: true,
    assetsInlineLimit: 0,
  },

  define: {
    global: 'globalThis',
    __COMET_VERSION__: JSON.stringify(
      process.env.npm_package_version || '1.0.0'
    ),
  },

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

  server: {
    port: 5174,
    open: false,
  },

  preview: {
    port: 4174,
    open: false,
  },
});
