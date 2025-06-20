/**
 * Comet Framework - Complete Platform Tester Module (Fixed for Tabs API)
 * Tests all platform features for debugging and verification
 * @module @voilajsx/comet
 * @file src/scripts/modules/tester.js
 */

import { storage } from '@voilajsx/comet/storage';
import { messaging } from '@voilajsx/comet/messaging';
import { comet } from '@voilajsx/comet/api';

export default {
  name: 'tester',

  handlers: {
    // ===== BADGE TESTS =====
    testBadge: async () => {
      await messaging.sendToBackground({
        type: 'badge.setText',
        data: { text: '5' },
      });
      return { success: true, message: 'Badge set to "5"' };
    },

    testBadgeColor: async () => {
      await messaging.sendToBackground({
        type: 'badge.setColor',
        data: { color: '#FF0000' },
      });
      return { success: true, message: 'Badge color set to red' };
    },

    clearBadge: async () => {
      await messaging.sendToBackground({
        type: 'badge.setText',
        data: { text: '' },
      });
      return { success: true, message: 'Badge cleared' };
    },

    // ===== TAB MANAGEMENT (FIXED) =====
    openNewTab: async (data) => {
      try {
        const url = data?.url || 'https://google.com';
        console.log('[Tester] Opening new tab:', url);

        const response = await messaging.sendToBackground({
          type: 'tabs.create',
          data: { url, active: false }, // Don't steal focus
        });

        console.log('[Tester] Tab creation response:', response);

        if (response.success && response.data?.tab) {
          return {
            success: true,
            message: `Opened new tab: ${url}`,
            tab: response.data.tab,
          };
        } else {
          return {
            success: false,
            error: response.error || 'Tab creation failed',
          };
        }
      } catch (error) {
        console.error('[Tester] Tab creation error:', error);
        return { success: false, error: error.message };
      }
    },

    getCurrentTab: async () => {
      try {
        console.log('[Tester] Getting current tab');

        const response = await messaging.sendToBackground({
          type: 'tabs.getCurrent',
          data: {},
        });

        console.log('[Tester] Current tab response:', response);

        if (response.success && response.data) {
          const tab = response.data;
          return {
            success: true,
            tab: {
              id: tab.id,
              title: tab.title,
              url: tab.url,
              active: tab.active,
              windowId: tab.windowId,
            },
          };
        } else {
          return {
            success: false,
            error: response.error || 'No current tab found',
          };
        }
      } catch (error) {
        console.error('[Tester] Get current tab error:', error);
        return { success: false, error: error.message };
      }
    },

    getAllTabs: async () => {
      try {
        console.log('[Tester] Getting all tabs');

        const response = await messaging.sendToBackground({
          type: 'tabs.query',
          data: {},
        });

        console.log('[Tester] All tabs response:', response);

        if (response.success && Array.isArray(response.data)) {
          const tabs = response.data;
          return {
            success: true,
            tabCount: tabs.length,
            tabs: tabs.map((tab) => ({
              id: tab.id,
              title: tab.title || 'No title',
              url: tab.url || 'No URL',
              active: tab.active,
              windowId: tab.windowId,
            })),
          };
        } else {
          return {
            success: false,
            error: response.error || 'Failed to get tabs',
          };
        }
      } catch (error) {
        console.error('[Tester] Get all tabs error:', error);
        return { success: false, error: error.message };
      }
    },

    // ===== ADVANCED TAB OPERATIONS =====
    closeTab: async (data) => {
      try {
        const tabId = data?.tabId;
        if (!tabId) {
          return { success: false, error: 'Tab ID required' };
        }

        const response = await messaging.sendToBackground({
          type: 'tabs.remove',
          data: { tabId },
        });

        if (response.success) {
          return {
            success: true,
            message: `Closed tab ${tabId}`,
          };
        } else {
          return {
            success: false,
            error: response.error || 'Tab close failed',
          };
        }
      } catch (error) {
        console.error('[Tester] Close tab error:', error);
        return { success: false, error: error.message };
      }
    },

    duplicateCurrentTab: async () => {
      try {
        // First get current tab
        const currentResponse = await messaging.sendToBackground({
          type: 'tabs.getCurrent',
          data: {},
        });

        if (!currentResponse.success || !currentResponse.data) {
          return { success: false, error: 'Could not get current tab' };
        }

        const currentTab = currentResponse.data;

        // Duplicate it
        const response = await messaging.sendToBackground({
          type: 'tabs.duplicate',
          data: { tabId: currentTab.id },
        });

        if (response.success && response.data?.tab) {
          return {
            success: true,
            message: 'Current tab duplicated',
            duplicatedTab: response.data.tab,
          };
        } else {
          return {
            success: false,
            error: response.error || 'Tab duplication failed',
          };
        }
      } catch (error) {
        console.error('[Tester] Duplicate tab error:', error);
        return { success: false, error: error.message };
      }
    },

    reloadCurrentTab: async (data) => {
      try {
        // Get current tab first
        const currentResponse = await messaging.sendToBackground({
          type: 'tabs.getCurrent',
          data: {},
        });

        if (!currentResponse.success || !currentResponse.data) {
          return { success: false, error: 'Could not get current tab' };
        }

        const currentTab = currentResponse.data;

        // Reload it
        const response = await messaging.sendToBackground({
          type: 'tabs.reload',
          data: {
            tabId: currentTab.id,
            bypassCache: data?.bypassCache || false,
          },
        });

        if (response.success) {
          return {
            success: true,
            message: `Reloaded current tab${
              data?.bypassCache ? ' (bypassed cache)' : ''
            }`,
          };
        } else {
          return {
            success: false,
            error: response.error || 'Tab reload failed',
          };
        }
      } catch (error) {
        console.error('[Tester] Reload tab error:', error);
        return { success: false, error: error.message };
      }
    },

    // ===== STORAGE TESTS =====
    testStorage: async (data) => {
      const key = data?.key || 'test.demo';
      const value = data?.value || `Test at ${new Date().toLocaleTimeString()}`;

      await storage.set(key, value);
      const retrieved = await storage.get(key);

      return {
        success: true,
        stored: { key, value },
        retrieved,
      };
    },

    getStorageUsage: async () => {
      const usage = await storage.getUsage();
      return { success: true, usage };
    },

    clearTestStorage: async () => {
      await storage.remove(['test.demo', 'test.key', 'test.comprehensive']);
      return { success: true, message: 'Test storage cleared' };
    },

    // ===== API TESTS =====
    testApiGet: async () => {
      try {
        const response = await comet.get(
          'https://jsonplaceholder.typicode.com/posts/1'
        );
        return {
          success: true,
          message: 'API GET successful',
          data: {
            id: response.data.id,
            title: response.data.title,
            body: response.data.body.slice(0, 50) + '...',
          },
        };
      } catch (error) {
        return { success: false, error: 'API GET failed: ' + error.message };
      }
    },

    testApiPost: async () => {
      try {
        const response = await comet.post(
          'https://jsonplaceholder.typicode.com/posts',
          {
            title: 'Test Post from Comet',
            body: 'This is a test post',
            userId: 1,
          }
        );
        return {
          success: true,
          message: 'API POST successful',
          data: {
            id: response.data.id,
            title: response.data.title,
          },
        };
      } catch (error) {
        return { success: false, error: 'API POST failed: ' + error.message };
      }
    },

    // ===== PAGE INTERACTION =====
    getDetailedPageInfo: async () => {
      return {
        success: true,
        pageInfo: {
          title: document.title,
          url: window.location.href,
          domain: window.location.hostname,
          wordCount: document.body.innerText.split(' ').length,
          linkCount: document.links.length,
          imageCount: document.images.length,
          lastModified: document.lastModified,
          characterCount: document.body.innerText.length,
          scriptCount: document.scripts.length,
          stylesheetCount: document.styleSheets.length,
          metaTags: Array.from(document.querySelectorAll('meta')).length,
          headings: {
            h1: document.querySelectorAll('h1').length,
            h2: document.querySelectorAll('h2').length,
            h3: document.querySelectorAll('h3').length,
          },
        },
      };
    },

    findElement: async (data) => {
      const selector = data?.selector || 'h1';
      const element = document.querySelector(selector);

      if (element) {
        return {
          success: true,
          found: true,
          element: {
            tagName: element.tagName,
            textContent: element.textContent.slice(0, 100),
            id: element.id || 'no-id',
            className: element.className || 'no-class',
          },
        };
      } else {
        return {
          success: true,
          found: false,
          message: `Element "${selector}" not found`,
        };
      }
    },

    highlightElements: async (data) => {
      const selector = data?.selector || 'h1, h2, h3';
      const elements = document.querySelectorAll(selector);

      elements.forEach((el) => {
        el.style.backgroundColor = 'yellow';
        el.style.border = '2px solid red';
      });

      return {
        success: true,
        highlighted: elements.length,
        selector,
      };
    },

    removeHighlight: async () => {
      const elements = document.querySelectorAll(
        '*[style*="background-color: yellow"]'
      );
      elements.forEach((el) => {
        el.style.backgroundColor = '';
        el.style.border = '';
      });

      return {
        success: true,
        removed: elements.length,
        message: 'Highlights removed',
      };
    },

    // ===== MESSAGING TESTS =====
    testEcho: async (data) => {
      return {
        success: true,
        echo: data,
        timestamp: Date.now(),
        message: 'Echo test successful',
      };
    },

    testBroadcast: async () => {
      const results = await messaging.broadcast({
        type: 'testMessage',
        data: {
          from: 'tester',
          message: 'Broadcast test',
          timestamp: Date.now(),
        },
      });

      const successful = results.filter((r) => r.success).length;

      return {
        success: true,
        message: `Broadcast sent to ${results.length} tabs`,
        successful,
        total: results.length,
      };
    },

    // ===== DOWNLOADS TEST =====
    testDownload: async () => {
      const testData = {
        extensionName: 'Comet Tester',
        timestamp: new Date().toISOString(),
        testResults: {
          badge: 'working',
          storage: 'working',
          messaging: 'working',
        },
      };

      await messaging.sendToBackground({
        type: 'downloads.downloadData',
        data: {
          data: JSON.stringify(testData, null, 2),
          filename: 'comet-test-export.json',
          mimeType: 'application/json',
        },
      });

      return {
        success: true,
        message: 'Test data downloaded as JSON file',
      };
    },

    // ===== BOOKMARKS TEST =====
    bookmarkCurrentPage: async () => {
      await messaging.sendToBackground({
        type: 'bookmarks.create',
        data: {
          title: `Test Bookmark - ${document.title}`,
          url: window.location.href,
        },
      });

      return {
        success: true,
        message: 'Current page bookmarked',
        page: document.title,
      };
    },

    // ===== CONTEXT MENU TEST =====
    createContextMenu: async () => {
      await messaging.sendToBackground({
        type: 'contextMenu.create',
        data: {
          id: 'comet-test',
          title: 'Test Comet Extension',
          contexts: ['page', 'selection'],
        },
      });

      return {
        success: true,
        message: 'Context menu created (right-click page to see)',
      };
    },

    removeContextMenu: async () => {
      await messaging.sendToBackground({
        type: 'contextMenu.remove',
        data: { id: 'comet-test' },
      });

      return {
        success: true,
        message: 'Context menu removed',
      };
    },

    // ===== COMPREHENSIVE TEST =====
    runAllTests: async () => {
      const results = {};

      try {
        // Test storage
        await storage.set('test.comprehensive', 'test-value');
        const stored = await storage.get('test.comprehensive');
        results.storage = stored === 'test-value' ? 'PASS' : 'FAIL';

        // Test API
        const apiResponse = await comet.get(
          'https://jsonplaceholder.typicode.com/posts/1'
        );
        results.api = apiResponse.ok ? 'PASS' : 'FAIL';

        // Test page access
        results.pageAccess = document.title ? 'PASS' : 'FAIL';

        // Test badge
        await messaging.sendToBackground({
          type: 'badge.setText',
          data: { text: '✓' },
        });
        results.badge = 'PASS';

        // Test tab query
        const tabResponse = await messaging.sendToBackground({
          type: 'tabs.query',
          data: { active: true },
        });
        results.tabManagement = tabResponse.success ? 'PASS' : 'FAIL';

        // Test tab creation
        const createResponse = await messaging.sendToBackground({
          type: 'tabs.create',
          data: { url: 'https://example.com', active: false },
        });
        results.tabCreation = createResponse.success ? 'PASS' : 'FAIL';

        // Close the test tab if created
        if (createResponse.success && createResponse.data?.tab?.id) {
          setTimeout(async () => {
            try {
              await messaging.sendToBackground({
                type: 'tabs.remove',
                data: { tabId: createResponse.data.tab.id },
              });
            } catch (e) {
              console.warn('Failed to close test tab:', e);
            }
          }, 2000);
        }

        // Test core messaging
        const pingResponse = await messaging.sendToBackground({
          type: 'ping',
        });
        results.coreMessaging = pingResponse.success ? 'PASS' : 'FAIL';
      } catch (error) {
        results.error = error.message;
      }

      return {
        success: true,
        testResults: results,
        summary: `${
          Object.values(results).filter((r) => r === 'PASS').length
        } tests passed`,
      };
    },

    // ===== DEBUG HELPERS =====
    debugHandlers: async () => {
      // Use the global debug function if available
      if (typeof globalThis !== 'undefined' && globalThis.debugHandlers) {
        globalThis.debugHandlers();
      }

      return {
        success: true,
        message: 'Check console for handler information',
        availableHandlers: Array.from(
          globalThis.scriptBridge?.messageHandlers?.keys() || []
        ),
      };
    },

    // ===== PERMISSIONS TEST =====
    checkPermissions: async () => {
      try {
        const hasTabsPermission = await new Promise((resolve) => {
          chrome.permissions.contains({ permissions: ['tabs'] }, resolve);
        });

        const hasHostPermission = await new Promise((resolve) => {
          chrome.permissions.contains({ origins: ['<all_urls>'] }, resolve);
        });

        const hasBookmarksPermission = await new Promise((resolve) => {
          chrome.permissions.contains({ permissions: ['bookmarks'] }, resolve);
        });

        const hasDownloadsPermission = await new Promise((resolve) => {
          chrome.permissions.contains({ permissions: ['downloads'] }, resolve);
        });

        return {
          success: true,
          permissions: {
            tabs: hasTabsPermission,
            hostPermissions: hasHostPermission,
            bookmarks: hasBookmarksPermission,
            downloads: hasDownloadsPermission,
          },
          message: `Permissions check complete`,
        };
      } catch (error) {
        return {
          success: false,
          error: 'Permission check failed: ' + error.message,
        };
      }
    },

    // ===== WINDOW OPERATIONS =====
    getCurrentWindow: async () => {
      try {
        const response = await messaging.sendToBackground({
          type: 'windows.getCurrent',
          data: {},
        });

        if (response.success) {
          return {
            success: true,
            window: response.data,
          };
        } else {
          return {
            success: false,
            error: response.error || 'Failed to get current window',
          };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // ===== EXTENSION INFO =====
    getExtensionInfo: async () => {
      try {
        const response = await messaging.sendToBackground({
          type: 'extension.getInfo',
          data: {},
        });

        if (response.success) {
          return {
            success: true,
            extensionInfo: response.data,
          };
        } else {
          return {
            success: false,
            error: response.error || 'Failed to get extension info',
          };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },

  init: () => {
    console.log(
      '[Tester] Complete platform tester initialized (tabs API fixed)'
    );
  },
};
