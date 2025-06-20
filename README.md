# Comet Framework Documentation

## Table of Contents

1. [Get Started](#1-get-started)
2. [Project Architecture](#2-project-architecture)
3. [Build Your First Feature](#3-build-your-first-feature)
4. [Add UI Component](#4-add-ui-component)
5. [UIKit Components Reference](#5-uikit-components-reference)
6. [Use Platform APIs](#6-use-platform-apis)
7. [Ship Your Extension](#7-ship-your-extension)
8. [LLM Development Guidelines](#8-llm-development-guidelines)
9. [Reference](#9-reference)

---

## 1. Get Started

### What is Comet?

Comet is an auto-discovery extension framework that eliminates boilerplate. You write feature modules, Comet handles everything else - messaging, storage, UI components, theming, and cross-browser compatibility.

**Key Benefits:**

- **Auto-discovery:** Drop files in `features/` folder, framework finds them automatically
- **UIKit Integration:** Professional themes and components out of the box (Tailwind v4 + shadcn/ui)
- **Cross-browser:** Works on Chrome, Firefox, Edge without changes
- **Clean APIs:** Simple wrappers for storage, messaging, and external calls

### Quick Setup

```bash
git clone [repository]
cd comet-extension
npm install
npm run dev
```

Load in Chrome: Extensions → Developer mode → Load unpacked → Select `dist` folder

---

## 2. Project Architecture

### File Structure

```
src/
  features/           # 🎯 Your feature modules go here
    page-analyzer/    # Example: analyze page content
    quote-generator/  # Example: fetch inspirational quotes
    index.js          # Export all features (auto-discovery)
  pages/             # Extension UI pages
    popup/           # Extension popup interface
    options/         # Settings page
  shared/            # Reusable components
    components/      # UI components (logos, badges, etc.)
    layouts/         # Page layouts (popup, options wrappers)
  platform/          # 🚫 Framework core - don't modify
    storage.js       # Clean storage wrapper
    messaging.js     # Cross-context communication
    api.js           # CORS-free external requests
    service-worker.js # Background coordination
    content-script.js # Page interaction layer
  defaults.json      # App settings and feature toggles
public/
  icons/             # Extension icons (16, 32, 48, 128px)
manifest.json        # Extension configuration
```

### Features Folder Philosophy

**Why Isolated Features Matter:**
Each feature is completely self-contained in its own folder. This approach provides:

- **Modularity:** Features can be added, removed, or shared independently
- **Maintainability:** Clear boundaries prevent tangled dependencies
- **Scalability:** Large extensions stay organized as teams can work on separate features
- **Reusability:** Features can be copied between extensions easily

**Auto-Discovery Benefits:**
Instead of manually registering every feature, Comet automatically finds and loads anything exported from `features/index.js`. This means:

- No central registry to maintain
- Just export your feature and it's available
- Framework handles all the loading and initialization
- Less configuration, more coding

### Platform Files Explained

**Storage (`platform/storage.js`):**
Cross-browser wrapper that automatically loads defaults from `defaults.json`. Handles sync storage, fallbacks, and error recovery. You never touch browser storage APIs directly.

**Messaging (`platform/messaging.js`):**
Reliable communication between popup, content scripts, and background. Includes timeouts, error handling, and tab detection. Works consistently across all browsers.

**API Utility (`platform/api.js`):**
Makes external HTTP requests through the background script to avoid CORS issues. Handles JSON parsing, errors, and timeouts automatically.

**Service Worker (`platform/service-worker.js`):**
Coordinates background tasks, API proxying, and storage operations. Automatically handles extension lifecycle events and keeps your features running smoothly.

**Content Script (`platform/content-script.js`):**
Runs on web pages and automatically discovers/loads your feature modules. Handles messaging between page and extension contexts.

---

## 3. Build Your First Feature

### Step 1: Create Feature Module

Create `src/features/hello-world/index.js`:

```javascript
const helloWorldModule = {
  name: 'helloWorld',

  handlers: {
    sayHello: (data) => {
      return { message: `Hello, ${data.name || 'World'}!` };
    },
  },

  init: () => {
    console.log('[Hello World] Feature initialized');
  },

  meta: {
    name: 'Hello World',
    description: 'Simple greeting feature',
    version: '1.0.0',
  },
};

export default helloWorldModule;
```

**Module Structure Explained:**

- **name:** Unique identifier for your feature
- **handlers:** Functions that can be called from UI components
- **init:** Runs once when feature loads (optional)
- **meta:** Information about your feature (optional)

### Step 2: Register Feature

Add to `src/features/index.js`:

```javascript
export { default as helloWorld } from './hello-world/index.js';
// Framework auto-discovers all exports
```

### Step 3: Enable Feature

Add to `defaults.json`:

```json
{
  "helloWorldEnabled": true
}
```

**That's it!** Your feature is now loaded and available.

---

## 4. Add UI Component

### Create Tab Component

Create `src/features/hello-world/components/HelloWorldTab.tsx`:

```jsx
import React, { useState } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { CheckCircle, Loader2 } from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';

export default function HelloWorldTab({ value }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSayHello = async () => {
    setLoading(true);
    try {
      const response = await messaging.sendToContent({
        type: 'sayHello',
        data: { name: 'Developer' },
      });

      if (response?.success) {
        setResult({ type: 'success', message: response.data.message });
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Could not say hello' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TabsContent value={value} className="mt-0">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-card-foreground">
            Hello World Feature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSayHello}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saying Hello...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Say Hello
              </>
            )}
          </Button>

          {result && (
            <Alert
              variant={result.type === 'success' ? 'default' : 'destructive'}
            >
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
```

### Add to Popup

Edit `src/pages/popup/page.tsx` to include your tab:

```jsx
// Import your component
import HelloWorldTab from '@/features/hello-world/components/HelloWorldTab';

// Add to tabs array
const tabs = [
  {
    id: 'hello',
    label: 'Hello',
    icon: CheckCircle,
    content: <HelloWorldTab value="hello" />,
  },
  // ... other tabs
];
```

---

## 5. UIKit Components Reference

### Available Components

Comet uses `@voilajsx/uikit` - a Tailwind v4 + shadcn/ui component library. **Important:** Only use the core Tailwind utility classes listed below.

### Core Components

**Layout & Structure:**

```jsx
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@voilajsx/uikit/tabs';
import { Separator } from '@voilajsx/uikit/separator';
import { Badge } from '@voilajsx/uikit/badge';
```

**Interactive Elements:**

```jsx
import { Button } from '@voilajsx/uikit/button';
import { Switch } from '@voilajsx/uikit/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voilajsx/uikit/select';
import { Label } from '@voilajsx/uikit/label';
```

**Feedback & Status:**

```jsx
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Progress } from '@voilajsx/uikit/progress';
```

**Layout Wrappers:**

```jsx
import { PopupLayout } from '@voilajsx/uikit/popup';
import { PageLayout, PageHeader, PageContent } from '@voilajsx/uikit/page';
```

**Theme System:**

```jsx
import { ThemeProvider, useTheme } from '@voilajsx/uikit/theme-provider';
```

### Icons (Lucide React)

```jsx
import {
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  Settings,
  Palette,
  FileText,
  Quote,
  Sun,
  Moon,
  Zap,
  RefreshCw,
} from 'lucide-react';
```

### Safe Tailwind Classes

**⚠️ Important:** Comet doesn't have a Tailwind compiler, so only use these pre-defined utility classes:

**Layout & Spacing:**

```css
/* Flexbox */
flex, flex-col, flex-row, items-center, items-start, items-end
justify-center, justify-between, justify-start, justify-end
gap-1, gap-2, gap-3, gap-4, gap-6

/* Grid */
grid, grid-cols-1, grid-cols-2, grid-cols-3, grid-cols-4

/* Padding & Margin */
p-1, p-2, p-3, p-4, p-6, p-8
m-1, m-2, m-3, m-4, m-6, m-8
px-2, px-3, px-4, py-1, py-2, py-3
mt-0, mt-2, mt-3, mb-2, mb-3, mb-4

/* Width & Height */
w-full, w-auto, w-4, w-5, w-6, w-8, w-10, w-12
h-4, h-5, h-6, h-8, h-10, h-12
min-h-screen
```

**Typography:**

```css
text-xs, text-sm, text-base, text-lg, text-xl
font-medium, font-semibold, font-bold
text-center, text-left, text-right
leading-relaxed
```

**Colors (Theme-aware):**

```css
/* Text */
text-foreground, text-muted-foreground, text-card-foreground
text-primary, text-destructive
text-green-500, text-blue-500

/* Backgrounds */
bg-background, bg-card, bg-muted, bg-primary
bg-muted/50, bg-primary/10

/* Borders */
border, border-border, border-destructive
```

**Interactive States:**

```css
hover:bg-muted, hover:text-foreground
disabled:opacity-50, disabled:cursor-not-allowed
animate-spin
```

### Component Patterns

**Standard Card Layout:**

```jsx
<Card className="bg-card border-border">
  <CardHeader className="pb-3">
    <CardTitle className="text-base text-card-foreground flex items-center gap-2">
      <Icon className="w-4 h-4" />
      Feature Title
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">{/* Your content */}</CardContent>
</Card>
```

**Button Variants:**

```jsx
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
```

**Alert Patterns:**

```jsx
<Alert variant="default">
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
<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Loading...
    </>
  ) : (
    <>
      <Icon className="h-4 w-4 mr-2" />
      Action Text
    </>
  )}
</Button>
```

### Theme Variables

The UIKit provides CSS custom properties that work with any theme:

```css
/* Use these in custom styles */
--background
--foreground
--card
--card-foreground
--primary
--primary-foreground
--muted
--muted-foreground
--border
--destructive
```

---

## 6. Use Platform APIs

### Storage API

**Purpose:** Persistent data with automatic defaults loading

```javascript
import { storage } from '@voilajsx/comet/storage';

// Get single value (with fallback to defaults.json)
const enabled = await storage.get('featureEnabled');

// Get multiple values
const settings = await storage.get(['theme', 'enabled']);

// Set values
await storage.set('userPreference', 'dark');
await storage.set({ theme: 'dark', enabled: true });

// Check if exists
const hasKey = await storage.has('someKey');
```

### Messaging API

**Purpose:** Communication between popup, content scripts, and background

```javascript
import { messaging } from '@voilajsx/comet/messaging';

// Send to content script (from popup)
const response = await messaging.sendToContent({
  type: 'handlerName',
  data: { param: 'value' },
});

// Send to background script
const result = await messaging.sendToBackground({
  type: 'operation',
  data: { config: 'setting' },
});

// Get current tab info
const tab = await messaging.getActiveTab();
const isSupported = messaging.isTabSupported(tab);
```

### API Utility

**Purpose:** External HTTP requests without CORS issues

```javascript
import { comet } from '@voilajsx/comet/api';

// Simple GET request
const response = await comet.get('https://api.example.com/data');
if (response.ok) {
  console.log(response.data);
}

// POST with data
const result = await comet.post('https://api.example.com/save', {
  name: 'value',
});

// All HTTP methods available: get, post, put, patch, delete
```

**API Features:**

- Automatic JSON parsing
- Error handling and timeouts
- CORS-free through background proxy
- Consistent response format across browsers

---

## 7. Ship Your Extension

### Build for Production

```bash
# Create production build
npm run build

# Package for store submission
npm run package
```

**Build Process:**

- `npm run build` creates optimized files in `dist/`
- `npm run package` creates `comet-extension.zip` ready for upload
- Icons automatically copied from `public/icons/`
- Manifest and all assets properly bundled

### Store Submission

**Chrome Web Store:**

1. Upload `comet-extension.zip`
2. Fill in store listing details
3. Set pricing and distribution
4. Submit for review

**Firefox Add-ons:**
Same zip file works for Firefox - Comet handles cross-browser compatibility automatically.

---

## 8. LLM Development Guidelines

### Code Style Standards

**File Naming:**

- Feature folders: `kebab-case` (e.g., `page-analyzer`)
- JavaScript files: `camelCase.js` (e.g., `pageAnalyzer.js`)
- React components: `PascalCase.tsx` (e.g., `PageAnalyzerTab.tsx`)
- Constants: `UPPER_SNAKE_CASE`

**Comment Guidelines:**

```javascript
/**
 * Feature description - what it does
 * @module @voilajsx/comet
 * @file path/to/file.js
 */

// Function-level comments
function analyzeContent() {
  // Explain complex logic inline
  const result = processData();
  return result;
}
```

### Do's and Don'ts

**✅ DO:**

- Use exact UIKit import paths: `@voilajsx/uikit/component`
- Only use safe Tailwind classes from the list above
- Follow Card + CardHeader + CardContent pattern for layouts
- Include loading states with Loader2 icon
- Use Alert components for user feedback
- Wrap components in TabsContent for popup integration
- Include proper error handling with try/catch
- Use theme-aware colors (text-foreground, bg-card, etc.)

**❌ DON'T:**

- Modify files in `src/platform/`
- Use browser APIs directly (use platform wrappers)
- Use arbitrary Tailwind classes not in the safe list
- Use localStorage/sessionStorage directly
- Import from wrong UIKit paths
- Skip loading states in async operations
- Use hardcoded colors (use CSS variables)
- Create features without proper error handling

### Required Patterns

**Feature Module Template:**

```javascript
/**
 * Feature Name - Brief description
 * @module @voilajsx/comet
 * @file src/features/feature-name/index.js
 */

const featureModule = {
  name: 'featureName',

  handlers: {
    mainAction: (data) => {
      try {
        // Your logic here
        return { success: true, result: data };
      } catch (error) {
        throw new Error('Operation failed: ' + error.message);
      }
    },
  },

  init: () => {
    console.log('[Feature Name] Feature initialized');
  },

  meta: {
    name: 'Feature Name',
    description: 'What this feature does',
    version: '1.0.0',
  },
};

export default featureModule;
```

**UI Component Template:**

```jsx
/**
 * Feature Name Tab Component
 * @module @voilajsx/comet
 * @file src/features/feature-name/components/FeatureNameTab.tsx
 */

import React, { useState } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';

interface FeatureNameTabProps {
  value: string;
}

export default function FeatureNameTab({ value }: FeatureNameTabProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    (useState < { type: 'success' | 'error', message: string }) | (null > null);

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
      setResult({ type: 'error', message: 'Could not perform action' });
    } finally {
      setLoading(false);
    }
  };

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
          <Button onClick={handleAction} disabled={loading} className="w-full">
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
        </CardContent>
      </Card>
    </TabsContent>
  );
}
```

### UIKit Import Requirements

**Always use these exact imports:**

```jsx
// Core Layout
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { TabsContent } from '@voilajsx/uikit/tabs';

// Interactive
import { Button } from '@voilajsx/uikit/button';
import { Switch } from '@voilajsx/uikit/switch';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';

// Icons
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Platform APIs
import { messaging } from '@voilajsx/comet/messaging';
import { storage } from '@voilajsx/comet/storage';
import { comet } from '@voilajsx/comet/api';
```

---

## 9. Reference

### Complete API Reference

**Storage Methods:**

- `storage.get(key)` - Get single value with defaults fallback
- `storage.get([keys])` - Get multiple values
- `storage.set(key, value)` - Set single value
- `storage.set(object)` - Set multiple values
- `storage.remove(key)` - Remove value
- `storage.has(key)` - Check if exists

**Messaging Methods:**

- `messaging.sendToContent(message)` - Send to content script
- `messaging.sendToBackground(message)` - Send to background
- `messaging.getActiveTab()` - Get current tab
- `messaging.isTabSupported(tab)` - Check if tab supports scripts

**API Methods:**

- `comet.get(url)` - GET request
- `comet.post(url, data)` - POST request
- `comet.put(url, data)` - PUT request
- `comet.delete(url)` - DELETE request

### Example Extensions

**Page Analyzer Feature:** See `src/features/page-analyzer/` for a complete working example that analyzes page size and content metrics.

**Quote Generator Feature:** See `src/features/quote-generator/` for an example that fetches external API data with fallback handling.

### Troubleshooting

**Feature not loading:**

- Check export in `src/features/index.js`
- Verify module structure has `name` and `handlers`
- Look for JavaScript errors in console

**Messaging fails:**

- Ensure tab supports content scripts (`messaging.isTabSupported()`)
- Check handler name matches exactly
- Verify content script is loaded (refresh page)

**Storage issues:**

- Check `defaults.json` syntax is valid JSON
- Use `storage.has()` to verify key exists
- Check browser extension storage limits

**UIKit component errors:**

- Verify exact import paths from documentation
- Only use safe Tailwind classes from the list
- Check if component is properly wrapped in required providers

**Build problems:**

- Run `npm run clean` then `npm run build`
- Check all imports use correct paths
- Verify all dependencies are installed
