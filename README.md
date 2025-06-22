<p >
   <img src="public/comet_logo.png" alt="Comet Framework Logo" width="200" />
</p>

Comet is an AI-ready, metadata-first cross-browser extension framework built for **rapid development, modular architecture, and enterprise-grade consistency**. Features self-register through declarative metadata, while the framework automatically generates UI, handles cross-browser compatibility, and manages configuration with live reloads.

### **Philosophy**

Comet is built on four core pillars that solve the biggest pain points in extension development:

- **🤖 AI-Ready Development:** Structured, metadata-first approach makes Comet highly interpretable by LLMs, enabling rapid AI-assisted feature generation, code scaffolding, and automated development workflows.

- **🚀 Rapid Development:** Build extensions 10x faster with auto-discovery architecture, live config reloads, and pre-built platform utilities. Focus on feature logic, not boilerplate.

- **🧱 Modular Architecture:** Features are completely self-contained and independent. Add/remove functionality by simply dropping folders. Enable/disable features with a single underscore prefix.

- **🎨 Enterprise-Grade Consistency:** Professional theme system with 6 adaptive themes, semantic color variables, and layout wrappers ensure consistent UI/UX across all components and team members.

### **Key Advantages**

**🎯 Unique to Comet:**

- **Metadata-First Auto-Discovery:** Features self-register, UI auto-generates, zero manual wiring
- **Live Configuration Reloads:** Edit `defaults.ts` → rebuild → see changes instantly
- **Cross-Browser Platform Layer:** Pre-built storage, messaging, and CORS-free API utilities
- **Professional Theme System:** 6 enterprise themes with automatic light/dark adaptation

**⚡ Best-in-Class:**

- **Zero-Config Setup:** Single command to working extension
- **Fastest Iteration Cycle:** Change config → rebuild → instant results
- **Plugin Architecture:** Drop-in features with folder-based enable/disable
- **Production-Ready Components:** Theme-aware UIKit with consistent design patterns

**🌐 Industry Standard:**

- **Modern Tooling:** TypeScript + React + Vite
- **Cross-Browser Support:** Chrome, Firefox, Edge, Opera from single codebase
- **Manifest V3 Ready:** Automatic compatibility handling

### **Perfect For**

- **React developers** wanting Chrome extension development without the complexity
- **Teams** needing consistent UI/UX across multiple extensions
- **Rapid prototyping** of extension ideas with professional polish
- **AI-assisted development** with structured, predictable patterns

## Table of Contents

1.  [Quick Start](#1-quick-start)
2.  [Project Architecture](#2-project-architecture)
3.  [Feature Module System](#3-feature-module-system)
4.  [Build Your First Feature](#4-build-your-first-feature)
5.  [Configuration System](#5-configuration-system)
6.  [UIKit Components Reference](#6-uikit-components-reference)
7.  [Platform APIs](#7-platform-apis)
8.  [Ship Your Extension](#8-ship-your-extension)
9.  [LLM Development Guidelines](#9-llm-development-guidelines)
10. [Reference](#10-reference)

---

## 1. Quick Start

### Quick Setup

```bash
git clone [repository]
cd comet-extension
npm install
npm run build

## 2. Project Architecture

### File Structure

```

src/
features/ # 🎯 Auto-discovered feature modules
page-analyzer/ # Feature: analyze page metrics
index.js # Feature metadata & handlers
components/
PopupTab.tsx # Auto-loaded popup tab
OptionsPanel.tsx # Auto-loaded options panel
quote-generator/ # Feature: inspirational quotes
index.js
components/
PopupTab.tsx
OptionsPanel.tsx
index.js # Auto-generated exports
pages/ # Extension UI pages
popup/ # Extension popup (minimal - uses PopupWrapper)
options/ # Settings page (minimal - uses OptionsWrapper)
shared/ # Reusable components & layouts
layouts/ # Smart wrapper components
PopupWrapper.tsx # Auto-discovery popup layout
OptionsWrapper.tsx # Auto-discovery options layout
components/ # Shared UI components
ExtensionLogo.tsx # Storage-aware logo
GeneralSettingsPanel.tsx # Core settings
hooks/ # React hooks
useModuleDiscovery.ts # Auto-discovery engine
platform/ # 🚫 Framework core - don't modify
storage.js # Storage with auto-reload defaults
messaging.js # Cross-context communication
api.js # CORS-free external requests
service-worker.js # Background coordination
content-script.js # Auto-discovery content injection
defaults.js # ✨ Central configuration (auto-reloads on build)
public/
icons/ # Extension icons
manifest.json # Extension configuration

````

### Auto-Discovery Architecture

**How Auto-Discovery Works:**

1. **Feature Detection:** Build system scans `src/features/` and auto-generates `index.js`
2. **Metadata Registration:** Each feature exports metadata describing its capabilities
3. **UI Generation:** Framework reads metadata and automatically creates:
   - Popup tabs (if feature has `ui.popup` config)
   - Options panels (if feature has `ui.options` config)
   - Navigation (based on `order` and `section` properties)
4. **Dynamic Loading:** Components load on-demand using lazy imports
5. **Storage Integration:** Settings automatically sync with `defaults.js`

**Benefits:**

- **Zero Manual Registration:** No central registry to maintain
- **Automatic UI:** Tabs and panels generate from metadata
- **Hot Reload:** Change `defaults.js` → rebuild → see changes immediately
- **Plugin Architecture:** Features are completely self-contained

---

## 3. Feature Module System

### Metadata-First Architecture

Features are defined by **metadata** that describes their capabilities, not implementation details:

```javascript
/**
 * Page Analyzer Feature - Metadata First Architecture
 * @module @voilajsx/comet
 * @file src/features/page-analyzer/index.js
 */

const config = {
  name: 'pageAnalyzer',

  // 🎨 UI Auto-Discovery Configuration
  ui: {
    popup: {
      tab: {
        label: 'Analyzer',
        icon: 'FileText',
        order: 1,
        requiresTab: true, // Only show on supported pages
        description: 'Analyze current page size and structure',
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        label: 'Page Analyzer',
        icon: 'FileText',
        section: 'features',
        order: 2,
        description: 'Configure page analysis settings',
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  // ⚙️ Settings Schema (auto-syncs with defaults.js)
  settings: {
    showDetailedView: {
      key: 'pageAnalyzer.showDetailedView',
      default: true,
      type: 'boolean',
      label: 'Show Detailed View',
      description: 'Display breakdown of HTML, text, images, and links',
    },
    autoAnalyze: {
      key: 'pageAnalyzer.autoAnalyze',
      default: false,
      type: 'boolean',
      label: 'Auto Analyze',
      description: 'Automatically analyze pages when visiting',
    },
  },

  // ℹ️ Feature Metadata
  meta: {
    name: 'Page Analyzer',
    description: 'Analyzes page size information and structure',
    version: '1.2.0',
    author: 'Comet Framework',
    category: 'analysis',
    tags: ['page', 'size', 'analysis', 'performance'],
  },

  // 🔧 Business Logic & Handlers
  handlers: {
    getPageSize: () => analyzePageContent(),
    analyzeCurrentPage: () => getDetailedAnalysis(),
  },

  // Lifecycle hooks
  init: () => console.log('[Page Analyzer] Feature initialized'),

  lifecycle: {
    onEnable: () => console.log('[Page Analyzer] Feature enabled'),
    onDisable: () => console.log('[Page Analyzer] Feature disabled'),
    onSettingsChange: (changes) => handleSettingsUpdate(changes),
  },
};

export default config;
````

### Feature Registration

Features are automatically discovered by the build system:

```javascript
// src/features/index.js (AUTO-GENERATED - DO NOT EDIT)
export { default as pageAnalyzer } from './page-analyzer/index.js';
export { default as quoteGenerator } from './quote-generator/index.js';
// Build system auto-updates this file
```

### Component Auto-Loading

UI components are loaded dynamically when needed:

```jsx
// src/features/page-analyzer/components/PopupTab.tsx
import React, { useState, useEffect } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { messaging } from '@voilajsx/comet/messaging';
import { storage } from '@voilajsx/comet/storage';

export default function PageAnalyzerTab({ value, currentTab }) {
  const [settings, setSettings] = useState({});
  const [data, setData] = useState(null);

  // Auto-load feature settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const showDetailed = await storage.get(
      'pageAnalyzer.showDetailedView',
      true
    );
    const autoAnalyze = await storage.get('pageAnalyzer.autoAnalyze', false);
    setSettings({ showDetailed, autoAnalyze });
  };

  const handleAnalyze = async () => {
    // Use feature handler
    const response = await messaging.sendToContent({
      type: 'getPageSize',
      data: {},
    });

    if (response?.success) {
      setData(response.data);
    }
  };

  return (
    <TabsContent value={value} className="mt-0">
      {/* Component implementation */}
    </TabsContent>
  );
}
```

---

## 4. Build Your First Feature

### Step 1: Create Feature Structure

```bash
mkdir src/features/my-feature
mkdir src/features/my-feature/components
```

### Step 2: Define Feature Metadata

Create `src/features/my-feature/index.js`:

```javascript
/**
 * My Feature - Brief description
 * @module @voilajsx/comet
 * @file src/features/my-feature/index.js
 */

const config = {
  name: 'myFeature',

  // UI Auto-Discovery
  ui: {
    popup: {
      tab: {
        label: 'My Feature',
        icon: 'Star',
        order: 10,
        requiresTab: false, // Available everywhere
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        label: 'My Feature Settings',
        icon: 'Star',
        section: 'features',
        order: 10,
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  // Settings Schema
  settings: {
    enabled: {
      key: 'myFeature.enabled',
      default: true,
      type: 'boolean',
      label: 'Enable My Feature',
    },
    mode: {
      key: 'myFeature.mode',
      default: 'auto',
      type: 'select',
      label: 'Operating Mode',
      options: [
        { value: 'auto', label: 'Automatic' },
        { value: 'manual', label: 'Manual' },
      ],
    },
  },

  // Feature Metadata
  meta: {
    name: 'My Feature',
    description: 'Does something useful',
    version: '1.0.0',
  },

  // Business Logic
  handlers: {
    performAction: (data) => {
      // Your feature logic here
      return { success: true, result: data };
    },
  },

  init: () => {
    console.log('[My Feature] Initialized');
  },
};

export default config;
```

### Step 3: Create Components

**Popup Tab** (`src/features/my-feature/components/PopupTab.tsx`):

```jsx
import React, { useState } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Star, Loader2 } from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';

export default function MyFeatureTab({ value }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      const response = await messaging.sendToContent({
        type: 'performAction',
        data: { timestamp: Date.now() },
      });

      if (response?.success) {
        console.log('Action completed:', response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TabsContent value={value} className="mt-0">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4" />
            My Feature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAction} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Working...
              </>
            ) : (
              <>
                <Star className="w-4 h-4 mr-2" />
                Perform Action
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
```

**Options Panel** (`src/features/my-feature/components/OptionsPanel.tsx`):

```jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Switch } from '@voilajsx/uikit/switch';
import { Label } from '@voilajsx/uikit/label';
import { Star } from 'lucide-react';
import { storage } from '@voilajsx/comet/storage';

export default function MyFeatureOptionsPanel() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const isEnabled = await storage.get('myFeature.enabled', true);
    setEnabled(isEnabled);
  };

  const updateEnabled = async (checked) => {
    setEnabled(checked);
    await storage.set('myFeature.enabled', checked);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Feature Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure my feature behavior
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Feature Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="feature-enabled">Enable Feature</Label>
              <p className="text-xs text-muted-foreground">
                Turn my feature on or off
              </p>
            </div>
            <Switch
              id="feature-enabled"
              checked={enabled}
              onCheckedChange={updateEnabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 4: Rebuild and Test

```bash
npm run build
```

**That's it!** Your feature automatically appears in:

- ✅ Popup as a new tab
- ✅ Options page as a new panel
- ✅ Settings sync with storage

---

## 5. Configuration System

### Storage-Based Configuration

All extension configuration is centralized in `src/defaults.js`:

```javascript
/**
 * Comet Framework - Default Configuration
 * @module @voilajsx/comet
 * @file src/defaults.js
 */

export default {
  // App Configuration
  'app-name': 'Comet One',
  'app-version': '1.0.0',
  'app-description': 'Minimal but powerful Chrome extension framework',
  'app-author': 'Your Name',
  'app-icon': 'Zap',
  'app-theme': 'metro',
  'app-variant': 'light',

  // Layout Configuration
  'options-variant': 'primary', // 'default' | 'primary' | 'black'
  'options-size': 'full', // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  'popup-variant': 'default', // 'default' | 'primary' | 'black' | 'compact' | 'mini'
  'popup-size': 'lg', // 'sm' | 'md' | 'lg' | 'auto'

  // Footer Configuration
  'footer-content': 'Made with ❤️ using Comet Framework',

  // Extension State
  extensionEnabled: true,

  // Feature Settings (auto-managed by features)
  'pageAnalyzer.showDetailedView': true,
  'pageAnalyzer.autoAnalyze': false,
  'quoteGenerator.type': 'general',
};
```

### Auto-Reload on Rebuild

**Key Feature:** Configuration automatically reloads when you rebuild the extension.

**Developer Workflow:**

1. Change any value in `defaults.js`
2. Run `npm run build`
3. Refresh extension → changes apply immediately
4. No manual cache clearing needed

**How It Works:**

- Storage system detects extension reload
- Automatically applies all values from `defaults.js`
- Overwrites cached values with fresh defaults
- UI instantly reflects new configuration

### Layout Variants

**Options Page Variants:**

```javascript
"options-variant": "default"   // White header, standard buttons
"options-variant": "primary"   // Primary colored header, white text
"options-variant": "black"     // Black header, white text
```

**Popup Variants:**

```javascript
"popup-variant": "default"   // Standard popup styling
"popup-variant": "primary"   // Primary colored header
"popup-variant": "black"     // Black header styling
"popup-variant": "compact"   // Reduced padding, muted colors
"popup-variant": "mini"      // Minimal styling, tight spacing
```

**Theme System:**

```javascript
"app-theme": "metro"     // Clean transit-inspired design
"app-theme": "aurora"    // Purple-green gradients
"app-theme": "neon"      // Cyberpunk magenta-cyan
"app-theme": "ruby"      // Red with gold accents
"app-theme": "studio"    // Designer grays with amber
"app-theme": "default"   // Ocean blue professional
```

### Feature Settings Management

Features automatically sync their settings:

```javascript
// In feature metadata
settings: {
  myOption: {
    key: 'featureName.myOption',  // Storage key
    default: true,                // Default value
    type: 'boolean',             // Type for UI generation
    label: 'My Option',          // Display label
    description: 'What this does' // Help text
  }
}

// In component
const value = await storage.get('featureName.myOption', true);
await storage.set('featureName.myOption', newValue);
```

---

## 6. UIKit Components Reference

### Theme-Aware Components

**CRITICAL:** Only use semantic color classes that adapt to themes:

```css
/* ✅ Theme-aware colors (USE THESE) */
bg-background, bg-card, bg-muted, bg-primary
text-foreground, text-muted-foreground, text-primary
border-border, border-input

/* ❌ Hardcoded colors (NEVER USE) */
bg-white, bg-gray-100, text-black, text-gray-600
```

### Core Layout Components

**Card Layouts:**

```jsx
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';

<Card className="bg-card border-border">
  <CardHeader className="pb-3">
    <CardTitle className="text-base text-card-foreground flex items-center gap-2">
      <Icon className="w-4 h-4" />
      Title
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">{/* Content */}</CardContent>
</Card>;
```

**Tab Layouts:**

```jsx
import { TabsContent } from '@voilajsx/uikit/tabs';

export default function FeatureTab({ value }) {
  return (
    <TabsContent value={value} className="mt-0">
      <Card className="bg-card border-border">{/* Tab content */}</Card>
    </TabsContent>
  );
}
```

### Interactive Components

**Buttons:**

```jsx
import { Button } from '@voilajsx/uikit/button';

<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
```

**Form Controls:**

```jsx
import { Switch } from '@voilajsx/uikit/switch';
import { Label } from '@voilajsx/uikit/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@voilajsx/uikit/select';

<div className="flex items-center justify-between">
  <Label htmlFor="setting">Setting Name</Label>
  <Switch id="setting" checked={value} onCheckedChange={setValue} />
</div>

<Select value={selected} onValueChange={setSelected}>
  <SelectTrigger>
    <SelectValue placeholder="Choose option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Feedback Components

**Alerts:**

```jsx
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

<Alert variant="default" className="border-border">
  <CheckCircle className="h-4 w-4 text-green-500" />
  <AlertDescription>Success message</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>Error message</AlertDescription>
</Alert>
```

**Loading States:**

```jsx
import { Loader2 } from 'lucide-react';

<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Loading...
    </>
  ) : (
    'Action Text'
  )}
</Button>;
```

### Layout Wrapper Components

**PopupLayout:**

```jsx
import { PopupLayout } from '@voilajsx/uikit/popup';

<PopupLayout
  variant="default"
  size="lg"
  logo={logo}
  headerActions={actions}
  showDivider={true}
>
  {/* Popup content */}
</PopupLayout>;
```

**PageLayout:**

```jsx
import {
  PageLayout,
  PageHeader,
  PageContent,
  PageFooter,
} from '@voilajsx/uikit/page';

<PageLayout variant="primary" size="full">
  <PageHeader sticky={true}>Header content</PageHeader>
  <PageContent>Main content</PageContent>
  <PageFooter>Footer content</PageFooter>
</PageLayout>;
```

---

## 7. Platform APIs

### Storage API

**Auto-Loading Defaults:**

```javascript
import { storage } from '@voilajsx/comet/storage';

// Get with automatic fallback to defaults.js
const theme = await storage.get('app-theme'); // Returns 'metro' from defaults
const enabled = await storage.get('featureEnabled', false); // Manual fallback

// Set values (immediately available)
await storage.set('userPreference', 'dark');
await storage.set({
  'app-theme': 'neon',
  'popup-variant': 'black',
});

// Check existence
const hasKey = await storage.has('someKey');

// Remove values
await storage.remove('oldKey');
await storage.remove(['key1', 'key2']);
```

### Messaging API

**Cross-Context Communication:**

```javascript
import { messaging } from '@voilajsx/comet/messaging';

// Send to content script (from popup/options)
const response = await messaging.sendToContent({
  type: 'handlerName', // Must match feature handler
  data: { param: 'value' },
});

if (response?.success) {
  console.log('Handler result:', response.data);
}

// Send to background script
const result = await messaging.sendToBackground({
  type: 'operation',
  data: { config: 'setting' },
});

// Tab utilities
const currentTab = await messaging.getActiveTab();
const isSupported = messaging.isTabSupported(currentTab);
```

### API Utility

**CORS-Free External Requests:**

```javascript
import { comet } from '@voilajsx/comet/api';

// Simple GET request
const response = await comet.get('https://api.example.com/data');
if (response.ok) {
  console.log('Data:', response.data);
} else {
  console.error('Error:', response.error);
}

// POST with JSON data
const result = await comet.post('https://api.example.com/save', {
  name: 'value',
  timestamp: Date.now(),
});

// All HTTP methods: get, post, put, patch, delete
// Automatic JSON parsing and error handling
// Works through background script to avoid CORS
```

---

## 8. Ship Your Extension

### Production Build

```bash
# Create optimized build
npm run build

# Package for store upload
npm run package
```

**Build Process:**

- Auto-generates `features/index.js` with all discovered features
- Bundles main extension pages and service worker
- Compiles content script with feature auto-loading
- Copies manifest and assets to `dist/`
- Creates `comet-extension.zip` ready for upload

### Cross-Browser Compatibility

**Comet automatically handles:**

- Browser API differences (Chrome vs Firefox)
- Manifest V3 requirements
- Service worker compatibility
- Storage API normalization
- Messaging system differences

**Same code works on:**

- Chrome Web Store
- Firefox Add-ons
- Edge Add-ons
- Opera Extensions

---

## 9. LLM Development Guidelines

### Feature Module Standards

**Required Structure:**

```javascript
/**
 * Feature Name - Brief description
 * @module @voilajsx/comet
 * @file src/features/feature-name/index.js
 */

const config = {
  name: 'featureName', // REQUIRED: camelCase identifier

  ui: {
    // REQUIRED: UI auto-discovery
    popup: {
      tab: {
        /* tab config */
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        /* panel config */
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  settings: {
    /* settings schema */
  }, // OPTIONAL: storage settings
  meta: {
    /* feature metadata */
  }, // OPTIONAL: feature info
  handlers: {
    /* message handlers */
  }, // REQUIRED: business logic
  init: () => {}, // OPTIONAL: initialization
  lifecycle: {
    /* hooks */
  }, // OPTIONAL: lifecycle events
};

export default config;
```

**File Naming Conventions:**

- Feature folders: `kebab-case` (e.g., `page-analyzer`)
- Feature modules: `index.js` (always)
- Components: `PascalCase.tsx` (e.g., `PopupTab.tsx`, `OptionsPanel.tsx`)
- Imports: Use exact paths from UIKit documentation

### Component Templates

**Popup Tab Template:**

```jsx
/**
 * Feature Name Popup Tab Component
 * @module @voilajsx/comet
 * @file src/features/feature-name/components/PopupTab.tsx
 */

import React, { useState, useEffect } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';
import { storage } from '@voilajsx/comet/storage';

export default function FeatureNameTab({ value, currentTab }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [settings, setSettings] = useState({});

  // Load feature settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const enabled = await storage.get('featureName.enabled', true);
    setSettings({ enabled });
  };

  const handleAction = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await messaging.sendToContent({
        type: 'handlerName',
        data: {},
      });

      if (response?.success) {
        setResult({
          type: 'success',
          message: 'Action completed successfully!',
        });
      } else {
        setResult({
          type: 'error',
          message: response?.error || 'Action failed',
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Could not perform action',
      });
    } finally {
      setLoading(false);
    }
  };

  const canPerformAction = messaging.isTabSupported(currentTab);

  return (
    <TabsContent value={value} className="mt-0">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-card-foreground flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Feature Name
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleAction}
            disabled={loading || !canPerformAction}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Perform Action
              </>
            )}
          </Button>

          {result && (
            <Alert
              variant={result.type === 'success' ? 'default' : 'destructive'}
            >
              {result.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          {!canPerformAction && (
            <div className="text-center text-sm text-muted-foreground">
              Feature not available on this page type
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
```

**Options Panel Template:**

```jsx
/**
 * Feature Name Options Panel Component
 * @module @voilajsx/comet
 * @file src/features/feature-name/components/OptionsPanel.tsx
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Switch } from '@voilajsx/uikit/switch';
import { Label } from '@voilajsx/uikit/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voilajsx/uikit/select';
import { Separator } from '@voilajsx/uikit/separator';
import { CheckCircle } from 'lucide-react';
import { storage } from '@voilajsx/comet/storage';

export default function FeatureNameOptionsPanel() {
  const [settings, setSettings] = useState({
    enabled: true,
    mode: 'auto',
    notifications: false,
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const featureSettings = {
        enabled: await storage.get('featureName.enabled', true),
        mode: await storage.get('featureName.mode', 'auto'),
        notifications: await storage.get('featureName.notifications', false),
      };
      setSettings(featureSettings);
    } catch (error) {
      console.error('[Feature Name Options] Failed to load settings:', error);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await storage.set(`featureName.${key}`, value);
    } catch (error) {
      console.error('[Feature Name Options] Failed to save setting:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Feature Name Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure how the feature behaves and what options are enabled
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Feature */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="feature-enabled" className="text-sm font-medium">
                Enable Feature
              </Label>
              <p className="text-xs text-muted-foreground">
                Turn this feature on or off globally
              </p>
            </div>
            <Switch
              id="feature-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSetting('enabled', checked)}
            />
          </div>

          <Separator />

          {/* Mode Selection */}
          <div className="space-y-3">
            <Label htmlFor="mode-select" className="text-sm font-medium">
              Operating Mode
            </Label>
            <Select
              value={settings.mode}
              onValueChange={(value) => updateSetting('mode', value)}
            >
              <SelectTrigger id="mode-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  <div>
                    <div className="font-medium">Automatic</div>
                    <div className="text-xs text-muted-foreground">
                      Feature operates automatically
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="manual">
                  <div>
                    <div className="font-medium">Manual</div>
                    <div className="text-xs text-muted-foreground">
                      Requires user interaction
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications" className="text-sm font-medium">
                Show Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Display notifications when feature performs actions
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) =>
                updateSetting('notifications', checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Required Patterns

**✅ DO:**

- Use semantic color classes (`bg-card`, `text-foreground`, `border-border`)
- Include loading states with `Loader2` icon and `animate-spin`
- Wrap tab content in `<TabsContent value={value} className="mt-0">`
- Use `Card` > `CardHeader` > `CardContent` structure for layouts
- Include proper error handling with try/catch blocks
- Load feature settings in `useEffect` on component mount
- Save settings immediately on change (auto-save pattern)
- Use `messaging.isTabSupported()` for tab-dependent features
- Include descriptive help text for settings
- Use proper TypeScript interfaces for props

**❌ DON'T:**

- Use hardcoded colors (`bg-white`, `text-black`, `bg-gray-100`)
- Skip loading states or error handling
- Modify files in `src/platform/` directory
- Use browser APIs directly (use platform wrappers)
- Use localStorage/sessionStorage directly
- Import from incorrect UIKit paths
- Create features without proper metadata structure
- Forget to export default from feature modules
- Use arbitrary Tailwind classes not in safe list
- Skip auto-save functionality in options panels

### Metadata Configuration

**UI Auto-Discovery Properties:**

```javascript
ui: {
  popup: {
    tab: {
      label: 'Tab Name',           // REQUIRED: Display name
      icon: 'IconName',            // REQUIRED: Lucide icon name
      order: 1,                    // REQUIRED: Tab order (lower = first)
      requiresTab: true,           // OPTIONAL: Only show on supported pages
      description: 'What it does'  // OPTIONAL: Tooltip/help text
    },
    component: () => import('./components/PopupTab.tsx')  // REQUIRED: Lazy import
  },
  options: {
    panel: {
      label: 'Panel Name',         // REQUIRED: Display name
      icon: 'IconName',            // REQUIRED: Lucide icon name
      section: 'features',         // OPTIONAL: Panel grouping
      order: 2,                    // REQUIRED: Panel order
      description: 'What it configures'  // OPTIONAL: Help text
    },
    component: () => import('./components/OptionsPanel.tsx')  // REQUIRED: Lazy import
  }
}
```

**Settings Schema Properties:**

```javascript
settings: {
  settingName: {
    key: 'featureName.settingName',  // REQUIRED: Storage key
    default: true,                   // REQUIRED: Default value
    type: 'boolean',                 // REQUIRED: 'boolean' | 'string' | 'number' | 'select'
    label: 'Setting Display Name',   // REQUIRED: UI label
    description: 'What this controls', // OPTIONAL: Help text
    options: [                       // REQUIRED for type: 'select'
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' }
    ]
  }
}
```

### Safe Tailwind Classes

**Layout & Spacing:**

```css
/* Flexbox */
flex, flex-col, flex-row, flex-wrap
items-center, items-start, items-end, items-stretch
justify-center, justify-between, justify-start, justify-end
gap-1, gap-2, gap-3, gap-4, gap-6, gap-8

/* Grid */
grid, grid-cols-1, grid-cols-2, grid-cols-3, grid-cols-4, grid-cols-5

/* Spacing */
p-1, p-2, p-3, p-4, p-6, p-8
px-1, px-2, px-3, px-4, py-1, py-2, py-3, py-4
m-1, m-2, m-3, m-4, mb-1, mb-2, mb-3, mb-4, mt-0, mt-1, mt-2, mt-3, mt-4

/* Sizing */
w-4, w-5, w-6, w-8, w-10, w-12, w-16, w-24, w-32, w-48, w-64, w-full, w-auto
h-4, h-5, h-6, h-8, h-10, h-12, h-16, h-24, h-32, h-48, h-64, h-full, h-auto
min-h-screen, max-w-sm, max-w-md, max-w-lg, max-w-xl, max-w-2xl, max-w-4xl
```

**Typography:**

```css
text-xs, text-sm, text-base, text-lg, text-xl, text-2xl
font-normal, font-medium, font-semibold, font-bold
text-left, text-center, text-right
leading-normal, leading-relaxed, leading-loose
```

**Theme-Aware Colors:**

```css
/* Backgrounds */
bg-background, bg-card, bg-muted, bg-primary, bg-secondary, bg-destructive
bg-muted/50, bg-primary/10, bg-card/50

/* Text */
text-foreground, text-muted-foreground, text-card-foreground
text-primary, text-primary-foreground, text-secondary-foreground
text-destructive, text-destructive-foreground

/* Borders */
border, border-border, border-input, border-destructive
border-t, border-b, border-l, border-r

/* States */
hover:bg-muted, hover:text-foreground, hover:bg-muted/80
disabled:opacity-50, disabled:cursor-not-allowed
focus:ring-ring, focus:ring-2, focus:ring-offset-2
```

**Interactive States:**

```css
animate-spin, animate-pulse
transition-colors, transition-all
cursor-pointer, cursor-not-allowed
rounded, rounded-md, rounded-lg, rounded-xl
shadow, shadow-sm, shadow-md, shadow-lg
```

### Icon Usage

**Available Lucide Icons (String references for metadata):**

```javascript
// Common icons for features
'CheckCircle', 'AlertCircle', 'Info', 'Star', 'Heart';
'FileText', 'Image', 'Link', 'Code', 'Database';
'BarChart3', 'PieChart', 'TrendingUp', 'Activity';
'Settings', 'Cog', 'Wrench', 'Tool', 'Gear';
'Zap', 'Rocket', 'Shield', 'Globe', 'Search';
'Download', 'Upload', 'RefreshCw', 'RotateCcw';
'Play', 'Pause', 'Stop', 'Forward', 'Rewind';
'Plus', 'Minus', 'X', 'Check', 'ArrowRight';
'Home', 'User', 'Users', 'Mail', 'Phone';
'Calendar', 'Clock', 'Timer', 'Stopwatch';
'Sun', 'Moon', 'Cloud', 'Umbrella', 'Thermometer';
'Volume2', 'VolumeX', 'Mic', 'MicOff', 'Camera';
'Eye', 'EyeOff', 'Lock', 'Unlock', 'Key';
'Bookmark', 'BookOpen', 'Library', 'Archive';
'Tag', 'Tags', 'Filter', 'SortAsc', 'SortDesc';
```

**Icon Import in Components:**

```jsx
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  FileText,
  Star
} from 'lucide-react';

// Usage in JSX
<CheckCircle className="w-4 h-4" />
<Loader2 className="h-4 w-4 mr-2 animate-spin" />
```

### Development Workflow

**1. Create Feature:**

```bash
mkdir src/features/my-feature
mkdir src/features/my-feature/components
```

**2. Define Metadata:**
Create `src/features/my-feature/index.js` with proper structure

**3. Create Components:**

- `PopupTab.tsx` - Use template above
- `OptionsPanel.tsx` - Use template above

**4. Build & Test:**

```bash
npm run build  # Auto-generates exports and loads feature
```

**5. Update Configuration:**
Add settings to `src/defaults.js` if needed

**6. Iterate:**
Change `defaults.js` → rebuild → changes apply immediately

### Troubleshooting

**Feature not appearing:**

- Check `src/features/index.js` was auto-generated with your export
- Verify feature module has `name` and `ui` properties
- Check browser console for JavaScript errors
- Ensure component files exist at specified import paths

**Settings not syncing:**

- Verify storage keys match between feature metadata and component
- Check `defaults.js` has correct key format (`featureName.settingName`)
- Use browser dev tools → Application → Storage to inspect values
- Ensure `await` is used with all storage operations

**UI styling issues:**

- Only use theme-aware color classes from safe list
- Wrap tab content in `<TabsContent value={value} className="mt-0">`
- Use `Card` components for proper styling and borders
- Check that imports use exact UIKit paths

**Messaging failures:**

- Verify handler names match exactly between component and feature
- Use `messaging.isTabSupported()` to check tab compatibility
- Check that content script is loaded (refresh page if needed)
- Include proper error handling with try/catch blocks

---

## 10. Reference

### Complete API Documentation

**Storage API:**

- `storage.get(key, fallback)` - Get value with automatic defaults fallback
- `storage.get([keys])` - Get multiple values as object
- `storage.set(key, value)` - Set single value
- `storage.set(object)` - Set multiple key-value pairs
- `storage.remove(key | [keys])` - Remove one or more keys
- `storage.has(key)` - Check if key exists
- `storage.clear()` - Remove all data
- `storage.getDefaults()` - Get all default values

**Messaging API:**

- `messaging.sendToContent(message)` - Send to content script from popup/options
- `messaging.sendToBackground(message)` - Send to service worker
- `messaging.getActiveTab()` - Get current browser tab info
- `messaging.isTabSupported(tab)` - Check if tab supports content scripts
- `messaging.onMessage(callback)` - Listen for incoming messages
- `messaging.setTimeout(ms)` - Set global message timeout

**API Utility:**

- `comet.get(url, headers)` - GET request through background proxy
- `comet.post(url, data, headers)` - POST request with JSON body
- `comet.put(url, data, headers)` - PUT request with JSON body
- `comet.patch(url, data, headers)` - PATCH request with JSON body
- `comet.delete(url, headers)` - DELETE request
- All methods return: `{ ok: boolean, status: number, data: any, error?: string }`

### Auto-Discovery Engine

**Module Discovery Process:**

1. Build system scans `src/features/` folders
2. Finds all `index.js` files with default exports
3. Auto-generates `src/features/index.js` with exports
4. Runtime loads feature metadata and registers handlers
5. UI components load on-demand via lazy imports
6. Settings sync automatically with `defaults.js`

**UI Generation Rules:**

- Features with `ui.popup.tab` → automatically appear in popup
- Features with `ui.options.panel` → automatically appear in options
- `order` property controls display sequence
- `requiresTab: true` → only show on supported pages
- `section` property groups options panels

### Framework Architecture

**Cross-Context Communication:**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Popup Page    │    │  Service Worker  │    │   Content Script    │
│                 │    │                  │    │                     │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────────┐ │
│ │ PopupWrapper│ │────│→│ Messaging    │ │────│→│ Feature Handlers│ │
│ │             │ │    │ │ Coordinator  │ │    │ │                 │ │
│ │ Auto-Tabs   │ │    │ │              │ │    │ │ Auto-Discovery  │ │
│ └─────────────┘ │    │ │ API Proxy    │ │    │ │                 │ │
│                 │    │ │              │ │    │ │ Page Access     │ │
│ Storage Access  │    │ │ Storage      │ │    │ └─────────────────┘ │
└─────────────────┘    │ │ Manager      │ │    └─────────────────────┘
                       │ └──────────────┘ │
                       └──────────────────┘
```

**Feature Lifecycle:**

1. **Discovery:** Build system finds feature modules
2. **Registration:** Features register metadata and handlers
3. **UI Generation:** Framework creates tabs/panels from metadata
4. **Initialization:** Feature `init()` method called
5. **Runtime:** User interactions trigger feature handlers
6. **Settings Sync:** Changes in options immediately update storage

### Best Practices Summary

**Feature Design:**

- Keep features focused and single-purpose
- Use descriptive names and clear metadata
- Include proper error handling and loading states
- Make features work independently of each other
- Provide meaningful user feedback

**Code Organization:**

- One feature per folder with clear naming
- Components in dedicated `components/` subfolder
- Follow exact import paths and naming conventions
- Use semantic color classes for theme compatibility
- Include comprehensive JSDoc comments

**Configuration Management:**

- Centralize all settings in `defaults.js`
- Use consistent key naming (`featureName.settingName`)
- Provide sensible defaults for all settings
- Test configuration changes with rebuild workflow
- Document setting purposes and valid values

**Performance Optimization:**

- Use lazy loading for all UI components
- Implement proper loading states and error boundaries
- Minimize storage operations and batch when possible
- Cache frequently accessed data appropriately
- Test on slower devices and networks
