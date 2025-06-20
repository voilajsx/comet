# 🚀 Comet Framework

**The most developer-friendly browser extension framework**

Comet is a modern, batteries-included framework for building beautiful cross-browser extensions. While other frameworks make you assemble pieces, Comet gives you everything working together from day one.

## Why Comet?

**Built for Extension Reality**

- Real popup sizing (320px, not desktop widths)
- Extension-specific UI components (PopupLayout, StatusBadge)
- Cross-browser APIs that actually work
- Built-in auth, storage, and messaging

**Developer Experience First**

- 5-minute setup to working extension
- Hot reload that works
- TypeScript out of the box
- Zero configuration needed

**Production Ready**

- Used by 50K+ users across multiple extensions
- Cross-browser: Chrome, Firefox, Edge, Opera, Brave
- Robust error handling and retry logic
- Professional UI themes included

## Features at a Glance

| Feature                      | Description                          | Why It Matters                              |
| ---------------------------- | ------------------------------------ | ------------------------------------------- |
| **🎨 43 UI Components**      | Complete design system with 6 themes | No more building buttons from scratch       |
| **📦 Simple Modules**        | Explicit module registration         | Add features without breaking existing code |
| **🌐 True Cross-Browser**    | One codebase, all browsers           | Ship everywhere without rewrites            |
| **🔐 Built-in Auth**         | 7-day persistent sessions            | User login that actually works              |
| **💾 Smart Storage**         | Auto-loading defaults, dot notation  | Storage that doesn't make you cry           |
| **📡 Bulletproof Messaging** | Retry logic, error handling          | Communication that never fails              |

## Quick Start (5 Minutes)

### 1. Clone & Install

```bash
git clone https://github.com/voilajsx/comet.git my-extension
cd my-extension
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Load in Browser

1. Open Chrome → Extensions → Developer mode ON
2. Click "Load unpacked" → Select `dist` folder
3. Done! Your extension is running

### 4. Make Your First Change

Edit `src/pages/popup/page.tsx`:

```jsx
// Change the title
<PopupLayout
  title="My Awesome Extension" // ← Change this
  subtitle="Built with Comet"
>
```

Always rebuild after changes

## Your First Module (2 Minutes)

### Create the Module

Create `src/scripts/modules/hello.js`:

```javascript
export default {
  name: 'hello',

  handlers: {
    sayHello: (data) => ({
      message: `Hello ${data.name}!`,
      timestamp: Date.now(),
    }),
  },
};
```

### Register the Module

Edit `src/scripts/bridge.js` - add your import:

```javascript
import hello from './modules/hello.js'; // ← Add this

const ALL_MODULES = [
  pageAnalyzer,
  quoteGenerator,
  userAuth,
  hello, // ← Add this
];
```

### Use the Module

In your popup (`src/pages/popup/page.tsx`):

```jsx
import { messaging } from '@voilajsx/comet/messaging';

const handleSayHello = async () => {
  const response = await messaging.sendToContent({
    type: 'sayHello',
    data: { name: 'World' },
  });

  console.log(response.data.message); // "Hello World!"
};
```

That's it! No complex configuration, no build system changes. Just create, register, use.

## What You Get Out of the Box

### Professional Extension UI

```jsx
<PopupLayout variant="default" size="md" title="Extension">
  <Tabs defaultValue="main">
    <TabsList>
      <TabsTrigger value="main">Main</TabsTrigger>
      <TabsTrigger value="settings">Settings</TabsTrigger>
    </TabsList>
    <TabsContent value="main">
      <Button onClick={handleAction}>Do Something Cool</Button>
    </TabsContent>
  </Tabs>
</PopupLayout>
```

### Working Authentication

```jsx
import { useAuth } from '@/hooks/useAuth';

function AccountTab() {
  const { isAuthenticated, user, login } = useAuth();

  return isAuthenticated ? (
    <UserCard user={user} />
  ) : (
    <LoginForm onLogin={login} />
  );
}
```

### Reliable Data Storage

```javascript
import { storage } from '@voilajsx/comet/storage';

// Auto-loads from defaults.json
const theme = await storage.get('app.theme', 'metro');

// Saves across browser restarts
await storage.set('user.preferences', { theme: 'dark' });
```

## Build & Deploy

### Development Build

```bash
npm run dev  # Builds + watches for changes
```

### Production Build

```bash
npm run build  # Optimized build in dist/
```

### Package for Store

```bash
npm run package  # Creates comet-extension.zip ready for upload
```

## File Structure Overview

```
my-extension/
├── src/
│   ├── platform/          # 🔒 Framework core - don't touch
│   ├── scripts/modules/   # 👨‍💻 Your page interaction logic
│   ├── pages/             # 👨‍💻 Your extension UI (popup, options)
│   ├── components/        # 👨‍💻 Your reusable UI components
│   └── hooks/             # 👨‍💻 Your custom React hooks
├── dist/                  # 📦 Built extension (load this in browser)
├── manifest.json          # 📋 Extension configuration
└── defaults.json          # ⚙️ Default settings
```

**Key Principle**: Framework code lives in `platform/`, your code lives everywhere else. This separation means you can update Comet without breaking your extension.

# 🚀 Platform APIs & Core Concepts

**Understanding the foundation that makes everything work**

The platform layer is Comet's secret sauce - it handles all the complex browser extension APIs so you can focus on building features. Let's explore each platform component and learn when and how to use them.

## Platform Architecture Overview

```
src/platform/
├── storage.js     # 💾 Cross-browser storage with defaults
├── messaging.js   # 📡 Reliable message passing
├── background.js  # 🔄 Extension lifecycle manager
└── api.js         # 🌐 Universal API proxy (CORS-free)
```

**Key Insight**: These aren't just wrappers - they're enhanced APIs that solve real extension development problems.

## Storage API: Never Lose Data Again

### The Problem Comet Solves

```javascript
// Without Comet: Manual default handling
const theme = (await chrome.storage.sync.get('theme')).theme || 'light';
const size = (await chrome.storage.sync.get('size')).size || 'medium';
// Repeat for every setting... 😩

// With Comet: Automatic defaults
const theme = await storage.get('app.theme'); // Auto-loads from defaults.json
const size = await storage.get('app.size'); // Falls back gracefully
```

### Basic Usage

```javascript
import { storage } from '@voilajsx/comet/storage';

// Simple get/set
await storage.set('username', 'john');
const username = await storage.get('username');

// Object storage
await storage.set({
  'user.name': 'John',
  'user.theme': 'dark',
  'app.version': '1.0.0',
});

// Get multiple values
const userData = await storage.get(['user.name', 'user.theme']);
// Returns: { 'user.name': 'John', 'user.theme': 'dark' }
```

### Smart Defaults System

Create `defaults.json` in your project root:

```json
{
  "app": {
    "name": "My Extension",
    "theme": "metro",
    "variant": "light"
  },
  "features": {
    "notifications": true,
    "autoSync": false
  },
  "user": {
    "sessionTimeout": 7
  }
}
```

Now storage automatically uses these defaults:

```javascript
// Gets 'metro' if not set, from defaults.json
const theme = await storage.get('app.theme');

// Gets false if not set, from defaults.json
const autoSync = await storage.get('features.autoSync');

// Custom fallback overrides default
const timeout = await storage.get('user.sessionTimeout', 30);
```

### Advanced Storage Patterns

**Configuration Management**

```javascript
// In your options page
const saveSettings = async (newSettings) => {
  await storage.set({
    'features.notifications': newSettings.notifications,
    'app.theme': newSettings.theme,
    'user.autoLogin': newSettings.autoLogin,
  });
};

// In your popup
const loadUserPreferences = async () => {
  const prefs = await storage.get([
    'features.notifications',
    'app.theme',
    'user.autoLogin',
  ]);
  return prefs;
};
```

**Cross-Component State**

```javascript
// Share state between popup and options
const [isEnabled, setIsEnabled] = useState(false);

useEffect(() => {
  // Load initial state
  storage.get('extensionEnabled').then(setIsEnabled);

  // Listen for changes from other components
  const unsubscribe = storage.onChange((changes) => {
    if (changes.extensionEnabled) {
      setIsEnabled(changes.extensionEnabled.newValue);
    }
  });

  return unsubscribe;
}, []);
```

**When to Use Storage**

- ✅ User preferences and settings
- ✅ Authentication tokens and session data
- ✅ Feature flags and configuration
- ✅ Cache data that persists across browser sessions
- ❌ Temporary UI state (use React state instead)
- ❌ Large files or media (use IndexedDB directly)

## Messaging API: Communication That Works

### The Problem Comet Solves

```javascript
// Without Comet: Manual error handling, no retries
chrome.tabs.sendMessage(tabId, message, (response) => {
  if (chrome.runtime.lastError) {
    // Handle error manually... 😩
    console.error(chrome.runtime.lastError);
    return;
  }
  // Use response...
});

// With Comet: Automatic retries, error handling
const response = await messaging.sendToContent({ type: 'getData' });
// Just works, handles all edge cases ✨
```

### Basic Message Patterns

**Popup ↔ Content Script**

```javascript
// In popup component
import { messaging } from '@voilajsx/comet/messaging';

const analyzeCurrentPage = async () => {
  try {
    const result = await messaging.sendToContent({
      type: 'getPageData',
      data: { includeImages: true },
    });

    console.log('Page data:', result.data);
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};
```

**Background ↔ Any Component**

```javascript
// Update extension badge from popup
const updateBadge = async (count) => {
  await messaging.sendToBackground({
    type: 'badge.setText',
    data: { text: count.toString() },
  });
};

// Get extension info
const getExtensionInfo = async () => {
  const info = await messaging.sendToBackground({
    type: 'extension.getInfo',
  });
  return info.data; // { id, version, manifest }
};
```

### Advanced Messaging Patterns

**Broadcasting to All Tabs**

```javascript
// Send message to all tabs with content scripts
const results = await messaging.broadcast({
  type: 'refreshData',
  data: { timestamp: Date.now() },
});

// Results is array: [{ tabId, success, response }, ...]
results.forEach(({ tabId, success, response }) => {
  if (success) {
    console.log(`Tab ${tabId} refreshed:`, response);
  }
});
```

**Listening for Messages**

```javascript
// In any component - listen for specific message types
useEffect(() => {
  const unsubscribe = messaging.onMessageType('userLoggedIn', (data) => {
    setUser(data.user);
    setIsAuthenticated(true);
  });

  return unsubscribe;
}, []);

// In background script - handle all message types
messaging.onMessage((message, sender) => {
  if (message.type === 'trackEvent') {
    // Analytics logic
    return { success: true };
  }
});
```

**When to Use Messaging**

- ✅ Popup needs data from current page
- ✅ Background processing triggers
- ✅ Cross-component notifications
- ✅ User action needs to affect all tabs
- ❌ Simple component communication (use React context)
- ❌ Frequent updates (consider storage changes instead)

## Background Script: The Extension Brain

### What Background Scripts Do

The background script runs continuously and handles:

- Extension lifecycle (install, update, startup)
- Badge updates and notifications
- API requests (bypasses CORS)
- Cross-tab coordination
- Persistent background tasks

### Built-in Background Features

**Automatic API Proxy**

```javascript
// In your modules or components
import { comet } from '@voilajsx/comet/api';

// This bypasses CORS automatically
const data = await comet.get('https://api.external.com/data');
const result = await comet.post('https://api.service.com/create', {
  name: 'John',
  email: 'john@example.com',
});
```

**Badge Management**

```javascript
// Update extension icon badge
await messaging.sendToBackground({
  type: 'badge.setText',
  data: { text: '5' },
});

await messaging.sendToBackground({
  type: 'badge.setColor',
  data: { color: '#FF0000' },
});
```

### Extending Background Functionality

**Custom Message Handlers**
Create `src/background-extensions.js`:

```javascript
import { backgroundManager } from '@voilajsx/comet/background';

// Add custom analytics handler
backgroundManager.registerMessageHandler('trackEvent', async (data) => {
  // Send to your analytics service
  await fetch('https://analytics.myapp.com/event', {
    method: 'POST',
    body: JSON.stringify({
      event: data.event,
      properties: data.properties,
      timestamp: Date.now(),
    }),
  });

  return { success: true };
});

// Add notification handler
backgroundManager.registerMessageHandler('showNotification', async (data) => {
  await chrome.notifications.create({
    type: 'basic',
    iconUrl: '/icons/icon-48.png',
    title: data.title,
    message: data.message,
  });

  return { notificationShown: true };
});
```

Then import in your background script:

```javascript
// In src/platform/background.js (or create custom background)
import './background-extensions.js';
```

**Event Listeners**

```javascript
// Listen for extension events
backgroundManager.addEventListener('installed', (data) => {
  if (data.reason === 'install') {
    // First install - show welcome page
    chrome.tabs.create({ url: '/welcome.html' });
  }
});

backgroundManager.addEventListener('tabUpdated', ({ tab, changeInfo }) => {
  if (changeInfo.status === 'complete') {
    // Page loaded - update badge based on page content
    updateBadgeForTab(tab);
  }
});
```

**When to Extend Background**

- ✅ Need persistent background processing
- ✅ Cross-tab coordination required
- ✅ External API integration
- ✅ System notifications
- ❌ Simple UI interactions (handle in components)
- ❌ One-time operations (use messaging instead)

## API Utility: CORS-Free Requests

### The Problem Comet Solves

```javascript
// Without Comet: CORS blocks external API calls
fetch('https://api.service.com/data'); // ❌ CORS error in content script

// With Comet: Automatic proxy through background
const data = await comet.get('https://api.service.com/data'); // ✅ Works
```

### API Patterns

**Simple REST Operations**

```javascript
import { comet } from '@voilajsx/comet/api';

// GET request
const users = await comet.get('https://api.example.com/users');

// POST with data
const newUser = await comet.post('https://api.example.com/users', {
  name: 'John',
  email: 'john@example.com',
});

// PUT update
const updated = await comet.put(
  `https://api.example.com/users/${id}`,
  userData
);

// DELETE
await comet.delete(`https://api.example.com/users/${id}`);
```

**With Authentication Headers**

```javascript
// API with auth token
const token = await storage.get('auth.token');
const data = await comet.get('https://api.protected.com/data', {
  Authorization: `Bearer ${token}`,
  'X-API-Key': 'your-api-key',
});

// Check response
if (data.ok) {
  console.log('Success:', data.data);
} else {
  console.error('API Error:', data.error);
}
```

**Error Handling Patterns**

```javascript
const fetchUserData = async (userId) => {
  try {
    const response = await comet.get(`/api/users/${userId}`);

    if (response.ok) {
      return { success: true, user: response.data };
    } else {
      return { success: false, error: response.error };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
```

## Platform Integration Patterns

### Typical Extension Flow

```javascript
// 1. User clicks popup button
const handleAnalyze = async () => {
  // 2. Send message to content script
  const pageData = await messaging.sendToContent({
    type: 'analyzePage',
  });

  // 3. Save results to storage
  await storage.set('lastAnalysis', {
    data: pageData.data,
    timestamp: Date.now(),
  });

  // 4. Update badge
  await messaging.sendToBackground({
    type: 'badge.setText',
    data: { text: pageData.data.score.toString() },
  });

  // 5. Show notification
  await messaging.sendToBackground({
    type: 'showNotification',
    data: {
      title: 'Analysis Complete',
      message: `Score: ${pageData.data.score}`,
    },
  });
};
```

### Cross-Component State Management

```javascript
// Reactive settings system
const useExtensionSettings = () => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    // Load initial settings
    storage
      .get(['app.theme', 'features.enabled', 'user.preferences'])
      .then(setSettings);

    // Listen for changes from options page
    const unsubscribe = storage.onChange((changes) => {
      const updatedSettings = {};
      Object.keys(changes).forEach((key) => {
        updatedSettings[key] = changes[key].newValue;
      });
      setSettings((prev) => ({ ...prev, ...updatedSettings }));
    });

    return unsubscribe;
  }, []);

  const updateSetting = async (key, value) => {
    await storage.set(key, value);
    // Component auto-updates via onChange listener
  };

  return { settings, updateSetting };
};
```

**When to Use Each Platform API**

- **Storage**: Persistent data, user settings, cache
- **Messaging**: Component communication, content script interaction
- **Background**: System integration, persistent tasks, API proxy
- **API**: External service calls, data fetching

# 🚀 Module System & UI Components

**Build features with confidence using Comet's module system and professional UI components**

Now that you understand the platform layer, let's explore how to build actual features using Comet's module system and create beautiful interfaces with the built-in UI components.

## Module System: Organized Feature Development

### Module Philosophy

Comet modules are **feature containers** - each module handles one specific capability. This keeps your code organized and makes features easy to add, remove, or debug.

```javascript
// ✅ Good: Focused modules
pageAnalyzer.js; // Analyzes page content
userAuth.js; // Handles authentication
weatherWidget.js; // Shows weather data

// ❌ Avoid: Kitchen sink modules
utilityModule.js; // Does everything (hard to maintain)
```

### Module Lifecycle: From Idea to Working Feature

**Step 1: Create Module File**

```javascript
// src/scripts/modules/weatherWidget.js
export default {
  name: 'weatherWidget',

  handlers: {
    // What can this module do?
    getCurrentWeather: async (data) => {
      const { city } = data;
      // Module logic here
      return { temperature: 22, condition: 'sunny' };
    },

    getForecast: async (data) => {
      // 5-day forecast logic
      return { forecast: [] };
    },
  },

  // Optional: Run when module loads
  init: () => {
    console.log('Weather widget ready');
  },
};
```

**Step 2: Register Module**

```javascript
// src/scripts/bridge.js - Add to imports
import weatherWidget from './modules/weatherWidget.js';

// Add to modules array
const ALL_MODULES = [
  pageAnalyzer,
  userAuth,
  weatherWidget, // ← Your new module
];
```

**Step 3: Use in UI**

```javascript
// src/components/WeatherCard.tsx
import { messaging } from '@voilajsx/comet/messaging';

const WeatherCard = () => {
  const [weather, setWeather] = useState(null);

  const loadWeather = async () => {
    const result = await messaging.sendToContent({
      type: 'getCurrentWeather',
      data: { city: 'London' },
    });
    setWeather(result.data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather</CardTitle>
      </CardHeader>
      <CardContent>
        {weather ? (
          <div>
            {weather.temperature}°C - {weather.condition}
          </div>
        ) : (
          <Button onClick={loadWeather}>Load Weather</Button>
        )}
      </CardContent>
    </Card>
  );
};
```

### Real-World Module Examples

**API Integration Module**

```javascript
// src/scripts/modules/todoManager.js
import { comet } from '@voilajsx/comet/api';

export default {
  name: 'todoManager',

  handlers: {
    getTodos: async () => {
      const response = await comet.get(
        'https://jsonplaceholder.typicode.com/todos'
      );
      return {
        todos: response.data.slice(0, 5),
        count: response.data.length,
      };
    },

    createTodo: async (data) => {
      const response = await comet.post(
        'https://jsonplaceholder.typicode.com/todos',
        {
          title: data.title,
          completed: false,
          userId: 1,
        }
      );

      return {
        success: response.ok,
        todo: response.data,
      };
    },
  },
};
```

**Page Interaction Module**

```javascript
// src/scripts/modules/linkHighlighter.js
export default {
  name: 'linkHighlighter',

  handlers: {
    highlightLinks: (data) => {
      const links = document.querySelectorAll('a');
      const { color = 'yellow' } = data;

      links.forEach((link) => {
        link.style.backgroundColor = color;
      });

      return {
        highlighted: links.length,
        color: color,
      };
    },

    removeHighlight: () => {
      const links = document.querySelectorAll('a');
      links.forEach((link) => {
        link.style.backgroundColor = '';
      });

      return { removed: links.length };
    },

    getLinkCount: () => {
      return {
        total: document.links.length,
        external: Array.from(document.links).filter(
          (link) => !link.href.includes(window.location.hostname)
        ).length,
      };
    },
  },

  init: () => {
    console.log('Link highlighter ready on:', window.location.hostname);
  },
};
```

**Data Processing Module**

```javascript
// src/scripts/modules/textAnalyzer.js
export default {
  name: 'textAnalyzer',

  handlers: {
    analyzeText: (data) => {
      const text = data.text || document.body.innerText;
      const words = text.split(/\s+/).filter((w) => w.length > 0);

      return {
        wordCount: words.length,
        charCount: text.length,
        avgWordLength:
          words.reduce((sum, w) => sum + w.length, 0) / words.length,
        readingTime: Math.ceil(words.length / 200), // minutes
        mostCommon: getMostCommonWords(words),
      };
    },

    getHeadings: () => {
      const headings = Array.from(
        document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      );
      return {
        headings: headings.map((h) => ({
          level: h.tagName,
          text: h.textContent.trim(),
          id: h.id || null,
        })),
        structure: buildHeadingStructure(headings),
      };
    },
  },
};

// Helper functions
function getMostCommonWords(words) {
  const freq = {};
  words.forEach((word) => {
    const clean = word.toLowerCase().replace(/[^\w]/g, '');
    if (clean.length > 3) freq[clean] = (freq[clean] || 0) + 1;
  });

  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));
}
```

### Module Communication Patterns

**Module-to-Module Communication**

```javascript
// Via main action coordination
export default {
  name: 'socialSharer',

  handlers: {
    shareCurrentPage: async () => {
      // Get page data from another module
      const pageData = await callOtherModule('pageAnalyzer', 'getPageData');

      // Process and share
      const shareData = {
        title: pageData.title,
        url: pageData.url,
        summary: generateSummary(pageData.content),
      };

      return { shared: true, data: shareData };
    },
  },
};

// Helper to call other modules
async function callOtherModule(moduleName, handler, data = {}) {
  // This would be implemented in your bridge
  return await globalModuleRegistry[moduleName].handlers[handler](data);
}
```

**Stateful Modules**

```javascript
// Module with internal state
export default {
  name: 'clickTracker',

  // Private state
  _clickCount: 0,
  _clickHistory: [],

  handlers: {
    startTracking: () => {
      const self = window.cometModules.clickTracker;

      document.addEventListener('click', (e) => {
        self._clickCount++;
        self._clickHistory.push({
          element: e.target.tagName,
          timestamp: Date.now(),
          x: e.clientX,
          y: e.clientY,
        });
      });

      return { tracking: true };
    },

    getStats: () => {
      const self = window.cometModules.clickTracker;
      return {
        totalClicks: self._clickCount,
        recentClicks: self._clickHistory.slice(-10),
      };
    },

    reset: () => {
      const self = window.cometModules.clickTracker;
      self._clickCount = 0;
      self._clickHistory = [];
      return { reset: true };
    },
  },
};
```

## UI Components: Professional Interface in Minutes

### PopupLayout: The Extension Container

**Basic Usage**

```jsx
import { PopupLayout } from '@voilajsx/uikit/popup';

<PopupLayout
  variant="default" // default | compact | mini
  size="md" // sm | md | lg | auto
  title="My Extension"
  subtitle="Powered by Comet"
>
  {/* Your extension content */}
</PopupLayout>;
```

**Advanced PopupLayout**

```jsx
import { Badge } from '@voilajsx/uikit/badge';
import { Button } from '@voilajsx/uikit/button';
import { Settings } from 'lucide-react';

<PopupLayout
  variant="default"
  size="lg"
  title="Weather Extension"
  subtitle="Current conditions"
  logo={<WeatherIcon />}
  badge={<Badge variant="default">Pro</Badge>}
  headerActions={
    <Button variant="ghost" size="sm" onClick={openSettings}>
      <Settings className="h-4 w-4" />
    </Button>
  }
  footer={
    <div className="flex gap-2">
      <Button variant="outline" className="flex-1">
        Refresh
      </Button>
      <Button className="flex-1">Settings</Button>
    </div>
  }
>
  <WeatherContent />
</PopupLayout>;
```

### Building Tabbed Interfaces

**Complete Tab System**

```jsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@voilajsx/uikit/tabs';
import { FileText, User, Settings } from 'lucide-react';

function ExtensionPopup() {
  return (
    <PopupLayout title="Multi-Tool Extension" size="lg">
      <Tabs defaultValue="analyzer" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyzer" className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Analyze
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-1">
            <User className="w-3 h-3" />
            Account
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="w-3 h-3" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer">
          <AnalyzerTab />
        </TabsContent>

        <TabsContent value="account">
          <AccountTab />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </PopupLayout>
  );
}
```

**Individual Tab Components**

```jsx
// src/components/tabs/AnalyzerTab.tsx
function AnalyzerTab() {
  const [result, setResult] = useState(null);

  const analyzeCurrentPage = async () => {
    const response = await messaging.sendToContent({
      type: 'analyzeText',
    });
    setResult(response.data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={analyzeCurrentPage} className="w-full">
          Analyze Current Page
        </Button>

        {result && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="font-medium">Words</div>
              <div className="text-muted-foreground">{result.wordCount}</div>
            </div>
            <div>
              <div className="font-medium">Reading Time</div>
              <div className="text-muted-foreground">{result.readingTime}m</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Form Patterns for Extensions

**Settings Form**

```jsx
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from '@voilajsx/uikit/form';
import { Switch } from '@voilajsx/uikit/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voilajsx/uikit/select';

function SettingsForm() {
  const [settings, setSettings] = useState({});

  const saveSettings = async (data) => {
    await storage.set(data);
    // Show success message
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extension Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <FormLabel>Enable Notifications</FormLabel>
            <p className="text-sm text-muted-foreground">
              Show desktop notifications for updates
            </p>
          </div>
          <Switch
            checked={settings.notifications}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, notifications: checked }))
            }
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Default Theme</FormLabel>
          <Select
            value={settings.theme}
            onValueChange={(theme) =>
              setSettings((prev) => ({ ...prev, theme }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metro">Metro</SelectItem>
              <SelectItem value="neon">Neon</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => saveSettings(settings)} className="w-full">
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Quick Action Form**

```jsx
function QuickActionForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const processUrl = async () => {
    setLoading(true);
    try {
      const result = await messaging.sendToContent({
        type: 'processUrl',
        data: { url },
      });
      // Handle result
    } catch (error) {
      console.error('Processing failed:', error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="url">Website URL</Label>
        <Input
          id="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <Button
        onClick={processUrl}
        disabled={!url || loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Process URL'
        )}
      </Button>
    </div>
  );
}
```

### Status and Feedback Components

**ActionResult for User Feedback**

```jsx
import { ActionResult } from '@/components/ActionResult';

function AnalyzerTab() {
  const [result, setResult] = useState(null);

  const handleAnalysis = async () => {
    try {
      const data = await messaging.sendToContent({ type: 'analyze' });
      setResult({
        type: 'success',
        message: 'Analysis completed successfully!',
      });
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Analysis failed. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleAnalysis}>Run Analysis</Button>

      <ActionResult
        result={result}
        onDismiss={() => setResult(null)}
        autoDismiss={true}
        autoDismissDelay={3000}
      />
    </div>
  );
}
```

**Status Indicators**

```jsx
import { StatusBadge } from '@/components/StatusBadge';
import { TabInfo } from '@/components/TabInfo';

function ExtensionStatus() {
  const [currentTab, setCurrentTab] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    messaging.getActiveTab().then(setCurrentTab);
    storage.get('extensionEnabled').then(setIsEnabled);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Extension Status</span>
        <StatusBadge
          isEnabled={isEnabled}
          isSupported={messaging.isTabSupported(currentTab)}
        />
      </div>

      <TabInfo tab={currentTab} showSecurityIcon={true} />
    </div>
  );
}
```

### Theming Your Extension

**Built-in Themes**

```jsx
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';

// Available themes:
const themes = [
  'default', // Ocean blue - professional
  'aurora', // Purple-green gradients - creative
  'metro', // Gray-blue - clean/minimal
  'neon', // Cyberpunk magenta-cyan - gaming
  'ruby', // Red-gold - premium
  'studio', // Designer gray-amber - elegant
];

function App() {
  return (
    <ThemeProvider theme="metro" variant="light">
      <PopupLayout title="Themed Extension">
        {/* All components automatically use theme colors */}
      </PopupLayout>
    </ThemeProvider>
  );
}
```

**Dynamic Theme Switching**

```jsx
function ThemeSelector() {
  const { theme, variant, setTheme, setVariant } = useTheme();

  return (
    <div className="space-y-3">
      <Select value={theme} onValueChange={setTheme}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="metro">Metro (Clean)</SelectItem>
          <SelectItem value="neon">Neon (Gaming)</SelectItem>
          <SelectItem value="studio">Studio (Elegant)</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center justify-between">
        <Label>Dark Mode</Label>
        <Switch
          checked={variant === 'dark'}
          onCheckedChange={(dark) => setVariant(dark ? 'dark' : 'light')}
        />
      </div>
    </div>
  );
}
```

## Integration Patterns: Bringing It All Together

### Complete Feature Implementation

```jsx
// 1. Module handles logic
// src/scripts/modules/bookmarkManager.js
export default {
  name: 'bookmarkManager',

  handlers: {
    saveCurrentPage: async () => {
      const bookmark = {
        title: document.title,
        url: window.location.href,
        timestamp: Date.now(),
        favicon: document.querySelector('link[rel="icon"]')?.href,
      };

      // Save to storage via platform API
      const bookmarks = await chrome.storage.local.get('bookmarks');
      const updated = [...(bookmarks.bookmarks || []), bookmark];
      await chrome.storage.local.set({ bookmarks: updated });

      return { saved: true, bookmark };
    },
  },
};

// 2. UI component uses module
// src/components/BookmarkButton.tsx
function BookmarkButton() {
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState(null);

  const saveBookmark = async () => {
    setIsSaving(true);
    try {
      const response = await messaging.sendToContent({
        type: 'saveCurrentPage',
      });

      setResult({
        type: 'success',
        message: 'Page bookmarked successfully!',
      });
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Failed to save bookmark',
      });
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-3">
      <Button onClick={saveBookmark} disabled={isSaving} className="w-full">
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Bookmark className="w-4 h-4 mr-2" />
            Bookmark Page
          </>
        )}
      </Button>

      <ActionResult result={result} onDismiss={() => setResult(null)} />
    </div>
  );
}
```

**Why This Pattern Works**

- ✅ **Separation of concerns**: Module handles logic, component handles UI
- ✅ **Reusable**: Module can be called from anywhere
- ✅ **Testable**: Each piece can be tested independently
- ✅ **Maintainable**: Clear boundaries between functionality and presentation

# 🚀 Comet Framework - Part 4: Code Organization & Best Practices

**Master the art of writing maintainable, scalable extension code**

Great extensions aren't just about features - they're about code that's easy to understand, modify, and maintain. Let's explore why Comet organizes code the way it does and learn how to write code that stands the test of time.

## Understanding Extension Architecture: The Big Picture

### Why Extensions Need Different Organization

Browser extensions are unique applications with special constraints:

1. **Multiple Entry Points**: Popup, options page, content scripts, background script
2. **Limited Screen Space**: Popup is tiny (320px wide max)
3. **Different User Contexts**: Quick actions vs detailed configuration
4. **Cross-Page Communication**: Components need to talk to each other
5. **Persistent State**: Data must survive browser restarts

**Traditional web apps** have one main interface. **Extensions** have multiple interfaces serving different purposes. This is why Comet separates popup and options - they serve fundamentally different user needs.

### The Two-Page Strategy: Why It Matters

**The Popup Page** - Your Extension's Front Door

```
┌─────────────────┐
│   Quick Tools   │  ← 320px wide maximum
│                 │
│ [Analyze Page]  │  ← One-click actions
│ [Save Bookmark] │
│ [User: John]    │  ← Status at a glance
│                 │
└─────────────────┘
```

**User Mental Model**: "I want to DO something quickly"

- Opens 10+ times per day
- Stays open for 5-30 seconds
- Focused on immediate actions
- Mobile-like interaction patterns

**The Options Page** - Your Extension's Control Panel

```
┌─────────────────────────────────────────────┐
│               Extension Settings             │
│                                             │
│  API Configuration                          │
│  ┌─────────────────────────────────────┐    │
│  │ API Key: [******************]      │    │
│  │ Endpoint: [api.service.com]       │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Feature Settings                           │
│  ☑ Enable notifications                     │
│  ☑ Auto-analyze pages                       │
│  ☐ Advanced metrics                         │
│                                             │
│  Theme Settings                             │
│  ○ Light  ● Dark  ○ Auto                    │
│                                             │
└─────────────────────────────────────────────┘
```

**User Mental Model**: "I want to SET UP my extension the way I like it"

- Opens once per week/month
- Stays open for 2-10 minutes
- Focused on configuration and customization
- Desktop-like interaction patterns

### Why This Separation Is Critical

**Without separation** (bad pattern):

```jsx
// ❌ Everything crammed into popup
<PopupLayout>
  <Tabs>
    <Tab value="actions">
      <Button>Analyze</Button> {/* User's primary need */}
    </Tab>
    <Tab value="settings">
      <APIKeyInput /> {/* Rarely used, clutters interface */}
      <ThemeSelector /> {/* Takes up valuable space */}
      <NotificationSettings /> {/* Makes popup slow to load */}
    </Tab>
  </Tabs>
</PopupLayout>
```

**Problems with this approach:**

- Popup becomes slow (loading all settings)
- Primary actions get buried in tabs
- Mobile-unfriendly (too much content)
- Settings are hard to use in tiny space

**With proper separation** (good pattern):

```jsx
// ✅ Popup: Fast, focused actions
<PopupLayout title="Page Tools">
  <QuickAnalyzer />     {/* Core feature, always visible */}
  <BookmarkButton />    {/* Secondary feature, one click */}
  <UserStatus />        {/* Status check, minimal space */}
</PopupLayout>

// ✅ Options: Comprehensive configuration
<PageLayout title="Extension Settings">
  <APIConfiguration />     {/* Detailed form with validation */}
  <FeatureToggles />      {/* All features with descriptions */}
  <ThemeCustomization />  {/* Full theme options */}
  <DataManagement />      {/* Export, import, reset options */}
</PageLayout>
```

## File Organization: The Logic Behind the Structure

### Why This Folder Structure?

```
src/
├── pages/           # 🎨 Complete user interfaces
├── components/      # 🧩 Reusable UI building blocks
├── hooks/          # ⚡ Reusable React logic
├── scripts/        # 🔧 Browser interaction logic
├── platform/       # 🏗️ Framework foundation
└── utils/          # 🛠️ Pure helper functions
```

This isn't arbitrary - it follows **separation of concerns** and **developer mental models**:

**When you think "I need to build a page"** → Go to `pages/`
**When you think "I need a reusable button"** → Go to `components/`
**When you think "I need to interact with the webpage"** → Go to `scripts/`
**When you think "I need a utility function"** → Go to `utils/`

### The Pages Folder: Complete User Experiences

```
src/pages/
├── popup/
│   ├── index.html      # HTML entry point for popup
│   ├── popup.tsx       # React app initialization
│   └── page.tsx        # Main popup component
└── options/
    ├── index.html      # HTML entry point for options
    ├── options.tsx     # React app initialization
    └── page.tsx        # Main options component
```

**Why separate HTML files?**

- Each page is a separate browser window
- Different Content Security Policy requirements
- Independent loading and performance
- Browser extension manifest requires separate entry points

**Example popup structure:**

```jsx
// src/pages/popup/page.tsx
export default function PopupPage() {
  // 🎯 Focus: What can user do RIGHT NOW on current page?
  const [currentTab, setCurrentTab] = useState(null);
  const [extensionEnabled, setExtensionEnabled] = useState(true);

  useEffect(() => {
    // Load ONLY data needed immediately
    loadEssentialData();
  }, []);

  return (
    <PopupLayout title="Page Tools" size="md">
      {/* Primary action - what user opens popup for */}
      <PageAnalyzer currentTab={currentTab} />

      {/* Secondary actions - quick access */}
      <UserAccount />
    </PopupLayout>
  );
}
```

**Why this works:**

- **Fast loading**: Only essential data
- **Clear purpose**: Everything serves immediate user needs
- **Minimal state**: Just what affects the entire popup

**Example options structure:**

```jsx
// src/pages/options/page.tsx
export default function OptionsPage() {
  // 🎯 Focus: How does user want extension configured?
  const [allSettings, setAllSettings] = useState({});
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    // Load ALL settings - user expects everything available
    loadCompleteSettings();
  }, []);

  const updateAnySetting = async (key, value) => {
    // Centralized update logic for consistency
    setAllSettings((prev) => ({ ...prev, [key]: value }));
    await storage.set(key, value);
    setSaveStatus('Saved!');
  };

  return (
    <PageLayout title="Extension Settings" size="lg">
      <Card title="API Configuration">
        <APISettings settings={allSettings} onUpdate={updateAnySetting} />
      </Card>

      <Card title="Features">
        <FeatureToggles settings={allSettings} onUpdate={updateAnySetting} />
      </Card>

      <Card title="Appearance">
        <ThemeSettings settings={allSettings} onUpdate={updateAnySetting} />
      </Card>
    </PageLayout>
  );
}
```

**Why this works:**

- **Complete state**: Handles all settings at once
- **Centralized updates**: One function handles all saves
- **User expectations**: Everything is immediately available
- **Comprehensive**: Room for detailed configuration

## Components Folder: Building Blocks Strategy

### Organization by Usage Context

```
src/components/
├── popup/           # 🎯 Popup-specific components
├── options/         # ⚙️ Options-specific components
├── shared/          # 🤝 Used in multiple places
└── auth/           # 🔐 Authentication-related
```

**Why organize by context instead of by type?**

**Traditional (by type) - confusing:**

```
components/
├── buttons/         # Which buttons? For what purpose?
├── forms/          # Which forms? Popup or options?
├── cards/          # Cards for what functionality?
└── modals/         # Used where?
```

**Comet way (by context) - clear:**

```
components/
├── popup/          # "I'm building popup UI"
├── options/        # "I'm building settings UI"
├── shared/         # "I need something reusable"
└── auth/          # "I'm working on login/logout"
```

### Popup Components: Speed and Focus

Popup components prioritize **speed** and **clarity**:

```jsx
// src/components/popup/QuickAnalyzer.tsx
export default function QuickAnalyzer({ currentTab, disabled }) {
  // 🎯 Single purpose: Let user analyze current page quickly
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);

    try {
      const response = await messaging.sendToContent({
        type: 'analyzePageText',
        data: { includeMetrics: true },
      });

      setResult(response.data);
    } catch (error) {
      setResult({ error: 'Analysis failed' });
    }

    setAnalyzing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {/* One primary action */}
        <Button
          onClick={handleAnalyze}
          disabled={disabled || analyzing}
          className="w-full"
        >
          {analyzing ? 'Analyzing...' : 'Analyze Page'}
        </Button>

        {/* Immediate results display */}
        {result && !result.error && (
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
            <div className="text-center">
              <div className="font-bold">{result.wordCount}</div>
              <div className="text-muted-foreground">Words</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{result.readingTime}m</div>
              <div className="text-muted-foreground">Read time</div>
            </div>
          </div>
        )}

        {/* Error state */}
        {result?.error && (
          <div className="text-sm text-red-500 mt-2">{result.error}</div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Design principles for popup components:**

- **Single responsibility**: One clear purpose
- **Immediate feedback**: Show results right away
- **Optimistic UI**: Show loading states immediately
- **Error recovery**: Clear error messages
- **Mobile-friendly**: Works on small screens

### Options Components: Depth and Configuration

Options components prioritize **comprehensiveness** and **user control**:

```jsx
// src/components/options/FeatureToggles.tsx
export default function FeatureToggles({ settings, onUpdate }) {
  // 🎯 Purpose: Let user configure all extension features

  const features = [
    {
      key: 'features.autoAnalyze',
      title: 'Auto-analyze Pages',
      description: 'Automatically analyze pages when you visit them',
      category: 'automation',
      dependsOn: null,
    },
    {
      key: 'features.notifications',
      title: 'Desktop Notifications',
      description: 'Show notifications when analysis completes',
      category: 'ui',
      dependsOn: null,
    },
    {
      key: 'features.advancedMetrics',
      title: 'Advanced Metrics',
      description: 'Include readability scores and SEO analysis',
      category: 'analysis',
      dependsOn: 'features.autoAnalyze', // Only relevant if auto-analyze is on
    },
  ];

  const handleToggle = async (feature, newValue) => {
    // Check dependencies before allowing changes
    if (!newValue && hasFeaturesThatDependOnThis(feature.key)) {
      // Show confirmation dialog
      const confirmed = confirm(
        `Disabling this will also disable dependent features. Continue?`
      );
      if (!confirmed) return;
    }

    await onUpdate(feature.key, newValue);
  };

  return (
    <div className="space-y-6">
      {/* Group features by category for better organization */}
      {['automation', 'analysis', 'ui'].map((category) => (
        <div key={category}>
          <h3 className="font-medium mb-3 capitalize">{category} Features</h3>

          {features
            .filter((f) => f.category === category)
            .map((feature) => {
              const isEnabled = settings[feature.key] ?? false;
              const dependencyMet =
                !feature.dependsOn || settings[feature.dependsOn];

              return (
                <div
                  key={feature.key}
                  className="flex justify-between items-start py-3"
                >
                  <div className="flex-1">
                    <Label className="font-medium">{feature.title}</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>

                    {/* Show dependency information */}
                    {!dependencyMet && (
                      <p className="text-xs text-orange-500 mt-1">
                        Requires:{' '}
                        {
                          features.find((f) => f.key === feature.dependsOn)
                            ?.title
                        }
                      </p>
                    )}
                  </div>

                  <Switch
                    checked={isEnabled && dependencyMet}
                    onCheckedChange={(checked) =>
                      handleToggle(feature, checked)
                    }
                    disabled={!dependencyMet}
                  />
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}
```

**Design principles for options components:**

- **Comprehensive**: Show all available options
- **Well-organized**: Group related settings together
- **Dependency-aware**: Handle feature dependencies
- **Descriptive**: Explain what each option does
- **Immediate save**: No "Save" button needed

### Shared Components: Reusable Across Contexts

Shared components work in both popup and options:

```jsx
// src/components/shared/StatusBadge.tsx
export default function StatusBadge({
  isEnabled = true,
  isSupported = true,
  customStatus = null,
}) {
  // 🎯 Purpose: Show status consistently across all interfaces

  // Allow custom status to override automatic detection
  if (customStatus) {
    return <Badge variant={customStatus.variant}>{customStatus.text}</Badge>;
  }

  // Automatic status detection based on props
  const getStatus = () => {
    if (!isEnabled) {
      return { text: 'Disabled', variant: 'secondary' };
    }

    if (!isSupported) {
      return { text: 'Unavailable', variant: 'outline' };
    }

    return { text: 'Ready', variant: 'default' };
  };

  const status = getStatus();

  return <Badge variant={status.variant}>{status.text}</Badge>;
}
```

**Usage in different contexts:**

```jsx
// In popup - automatic detection
<StatusBadge isEnabled={extensionEnabled} isSupported={canUseOnThisPage} />

// In options - custom status for specific features
<StatusBadge customStatus={{ text: 'Pro Feature', variant: 'default' }} />
```

## Hooks Folder: Reusable Logic Patterns

### Why Custom Hooks Matter in Extensions

Extensions have unique state management needs:

- Data persists across browser sessions
- State shared between popup and options
- Platform APIs (storage, messaging) need consistent handling
- Feature flags control what's available

### Extension-Specific Hooks

```typescript
// src/hooks/useExtensionState.ts
export function useExtensionState<T>(
  storageKey: string,
  defaultValue: T
): [T, (value: T) => Promise<void>, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial value from storage when component mounts
  useEffect(() => {
    const loadInitialValue = async () => {
      try {
        // Use Comet's storage with automatic defaults
        const storedValue = await storage.get(storageKey, defaultValue);
        setValue(storedValue);
      } catch (error) {
        console.error(`Failed to load ${storageKey}:`, error);
        // Keep default value if loading fails
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialValue();
  }, [storageKey, defaultValue]);

  // Update function that persists to storage
  const updateValue = useCallback(
    async (newValue: T) => {
      try {
        // Update local state immediately for responsive UI
        setValue(newValue);

        // Persist to storage
        await storage.set(storageKey, newValue);
      } catch (error) {
        console.error(`Failed to save ${storageKey}:`, error);

        // Revert local state if save fails
        setValue(value);

        // Re-throw so component can handle the error
        throw error;
      }
    },
    [storageKey, value]
  );

  return [value, updateValue, isLoading];
}
```

**Why this pattern is powerful:**

```jsx
// Before: Manual storage handling in every component
function MyComponent() {
  const [theme, setTheme] = useState('metro');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Every component needs this boilerplate
    storage.get('app.theme', 'metro').then((stored) => {
      setTheme(stored);
      setLoading(false);
    });
  }, []);

  const updateTheme = async (newTheme) => {
    setTheme(newTheme);
    try {
      await storage.set('app.theme', newTheme);
    } catch (error) {
      setTheme(theme); // Revert on error
    }
  };

  // Component logic...
}

// After: One line with hook
function MyComponent() {
  const [theme, setTheme, loading] = useExtensionState('app.theme', 'metro');

  // Component logic...
}
```

### Specialized Hooks for Common Patterns

```typescript
// src/hooks/useFeatureFlag.ts
export function useFeatureFlag(
  featureName: string,
  defaultEnabled: boolean = false
): [boolean, (enabled: boolean) => Promise<void>, boolean] {
  // Automatically prefix with 'features.' for consistency
  return useExtensionState(`features.${featureName}`, defaultEnabled);
}
```

**Usage:**

```jsx
function AdvancedFeature() {
  const [enabled, setEnabled, loading] = useFeatureFlag(
    'advancedMetrics',
    false
  );

  if (loading) return <div>Loading...</div>;
  if (!enabled) return null;

  return <AdvancedMetricsPanel />;
}
```

```typescript
// src/hooks/useCurrentTab.ts
export function useCurrentTab() {
  const [currentTab, setCurrentTab] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentTab = async () => {
      try {
        const tab = await messaging.getActiveTab();
        setCurrentTab(tab);
      } catch (error) {
        console.error('Failed to get current tab:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentTab();
  }, []);

  return {
    currentTab,
    loading,
    canUseExtension: messaging.isTabSupported(currentTab),
  };
}
```

**Usage:**

```jsx
function PageActions() {
  const { currentTab, loading, canUseExtension } = useCurrentTab();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <TabInfo tab={currentTab} />
      <Button disabled={!canUseExtension}>Analyze Page</Button>
    </div>
  );
}
```

## Utils Folder: Pure Helper Functions

### Organization by Domain

```
src/utils/
├── format.ts        # Text and number formatting
├── validation.ts    # Input validation functions
├── browser.ts       # Browser-specific utilities
├── api.ts          # API helper functions
└── constants.ts    # Application constants
```

**Why organize by domain?** When you need a formatting function, you know exactly where to look.

### Pure Functions for Predictable Code

```typescript
// src/utils/format.ts

/**
 * Format file size in human-readable format
 * Pure function: same input always produces same output
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Calculate reading time based on word count
 * Uses average reading speed of 200 words per minute
 */
export function calculateReadingTime(wordCount: number): string {
  if (wordCount === 0) return '0 min read';

  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  return `${minutes} min read`;
}

/**
 * Truncate text with ellipsis
 * Ensures text fits in limited UI space
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  // Find last space before limit to avoid cutting words
  const truncated = text.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Format relative time (e.g., "2 hours ago")
 * Useful for showing when data was last updated
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  return 'Just now';
}
```

**Why pure functions matter:**

- **Predictable**: Same input always gives same output
- **Testable**: Easy to write unit tests
- **Reusable**: Can use anywhere without side effects
- **Debuggable**: No hidden dependencies or state changes

## Writing Comments That Actually Help

### The Three Types of Useful Comments

1. **File headers** - Explain the purpose and context
2. **Function headers** - Explain complex logic and decisions
3. **Inline comments** - Explain non-obvious code

### File Header Pattern

```javascript
/**
 * User Authentication Module - Handles persistent login sessions
 *
 * What it does:
 * - Manages user login/logout with JWT tokens
 * - Provides 7-day persistent sessions
 * - Handles automatic token refresh
 *
 * Why it exists:
 * - Users shouldn't have to login every day
 * - Extension needs to work across browser restarts
 * - Multiple pages (popup, options) need auth state
 *
 * How it works:
 * - Stores JWT tokens in browser storage
 * - Checks token expiry on each use
 * - Auto-refreshes tokens before expiry
 *
 * Dependencies:
 * - @voilajsx/comet/storage: For persistent token storage
 * - @voilajsx/comet/api: For authentication API calls
 *
 * Used by:
 * - AuthProvider component (provides auth context)
 * - LoginForm component (handles user login)
 * - All components that need user data
 *
 * @module @voilajsx/comet
 * @file src/scripts/modules/userAuth.js
 */
```

### Function Comment Pattern

```javascript
/**
 * Login user and establish persistent session
 *
 * Why async: Makes API calls to authentication service
 * Why 7-day expiry: Balance between security and user convenience
 * Why store timestamp: Needed to check token age for auto-refresh
 *
 * @param {Object} credentials - User login information
 * @param {string} credentials.email - User's email address
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} Login result with success status and user data
 */
async function loginUser(credentials) {
  const { email, password } = credentials;

  // Validate inputs before making expensive API call
  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required',
    };
  }

  try {
    // Use Comet's API utility to handle CORS automatically
    const response = await comet.post('/auth/login', {
      email,
      password,
    });

    if (response.ok && response.data.token) {
      // Store authentication data for 7-day persistence
      await storage.set({
        'auth.token': response.data.token,
        'auth.timestamp': Date.now(), // Used by token expiry check
        'auth.userEmail': email, // Used for UI display
        'auth.refreshToken': response.data.refreshToken, // For auto-refresh
      });

      return {
        success: true,
        user: {
          email,
          token: response.data.token,
          loginTime: Date.now(),
        },
      };
    }

    return {
      success: false,
      error: response.data?.error || 'Login failed',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Unable to connect to authentication service',
    };
  }
}
```

### Component Comment Pattern

```jsx
/**
 * Status Badge - Shows extension state with appropriate styling
 *
 * Design pattern: Automatically determines status from props
 * Usage pattern: Pass current state, component handles display logic
 * Styling pattern: Uses semantic colors for theme compatibility
 *
 * Examples:
 * <StatusBadge isEnabled={true} isSupported={true} />    // Shows "Ready" (green)
 * <StatusBadge isEnabled={false} />                      // Shows "Disabled" (gray)
 * <StatusBadge customStatus={{ text: "Pro", variant: "default" }} />
 *
 * @param {boolean} isEnabled - Whether extension is turned on
 * @param {boolean} isSupported - Whether current page supports extension
 * @param {Object} customStatus - Override automatic status detection
 */
export default function StatusBadge({
  isEnabled = true,
  isSupported = true,
  customStatus = null,
}) {
  // Custom status overrides automatic detection
  if (customStatus) {
    return <Badge variant={customStatus.variant}>{customStatus.text}</Badge>;
  }

  // Determine status automatically based on current state
  const getStatus = () => {
    if (!isEnabled) {
      return { text: 'Disabled', variant: 'secondary' };
    }

    if (!isSupported) {
      return { text: 'Unavailable', variant: 'outline' };
    }

    return { text: 'Ready', variant: 'default' };
  };

  const status = getStatus();

  return <Badge variant={status.variant}>{status.text}</Badge>;
}
```

## Best Practices Summary

### Code Organization Principles

1. **Separate by user intent**: Popup (do) vs Options (configure)
2. **Group by usage context**: Components used together live together
3. **Extract reusable logic**: Hooks for common patterns
4. **Keep utilities pure**: No side effects in helper functions

### Naming Conventions That Scale

```javascript
// ✅ Good names - clear purpose and scope
const isUserAuthenticated = checkAuthStatus();
const handleAnalyzeButtonClick = () => {};
const UserProfileCard = ({ user }) => {};
const useExtensionSettings = () => {};

// ❌ Bad names - vague and confusing
const flag = check();
const handle = () => {};
const Card = ({ data }) => {};
const useStuff = () => {};
```

### Error Handling Strategy

```javascript
// ✅ Consistent error handling pattern
async function performAction() {
  try {
    const result = await riskyOperation();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Log for developers
    console.error('Action failed:', error);

    // Return user-friendly message
    return {
      success: false,
      error: 'Action could not be completed. Please try again.',
    };
  }
}

// Usage pattern
const result = await performAction();

if (result.success) {
  // Handle success
  displayData(result.data);
} else {
  // Handle error
  showErrorMessage(result.error);
}
```

**Why this pattern works:**

- **Consistent**: Same pattern everywhere in the codebase
- **User-friendly**: Clear error messages for users
- **Developer-friendly**: Detailed logging for debugging
- **Predictable**: Functions always return success/error objects

This organizational approach makes your extension:

- **Easy to navigate**: Everything has a logical place
- **Easy to understand**: Clear purposes and patterns
- **Easy to maintain**: Changes don't break other parts
- **Easy to extend**: Adding features follows established patterns

The goal is code that tells a story - make it a good one that future developers (including yourself) will thank you for.
