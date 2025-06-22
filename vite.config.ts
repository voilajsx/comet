/**
 * Main Vite Configuration - With Auto-Discovery Plugin
 * @file vite.config.ts
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { autoDiscoverFeatures } from './build-plugins/feature-discovery.js';

export default defineConfig({
  plugins: [
    autoDiscoverFeatures(), // 🆕 Auto-discover features
    react(),
  ],

  build: {
    rollupOptions: {
      input: {
        // Main extension pages
        popup: resolve(__dirname, 'src/pages/popup/index.html'),
        options: resolve(__dirname, 'src/pages/options/index.html'),

        // Service worker (background script)
        'service-worker': resolve(__dirname, 'src/platform/service-worker.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]',
        format: 'es', // ES modules
      },
    },
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    assetsInlineLimit: 0,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/shared/components'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types'),
      '@voilajsx/comet/storage': resolve(__dirname, 'src/platform/storage.ts'),
      '@voilajsx/comet/messaging': resolve(
        __dirname,
        'src/platform/messaging.ts'
      ),
      '@voilajsx/comet/api': resolve(__dirname, 'src/platform/api.ts'),
      '@voilajsx/comet/platform': resolve(__dirname, 'src/platform'),
    },
  },

  define: {
    global: 'globalThis',
    __COMET_VERSION__: JSON.stringify(
      process.env.npm_package_version || '1.0.0'
    ),
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@voilajsx/uikit'],
  },
});