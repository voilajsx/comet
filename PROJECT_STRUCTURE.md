# Comet Framework - Complete Project Structure

## Root Directory Overview

```
comet-extension/
├── 📁 public/
│   ├── manifest.json
│   └── 📁 icons/
├── 📁 src/
│   ├── 📁 features/
│   ├── 📁 pages/
│   ├── 📁 platform/
│   ├── 📁 shared/
│   └── defaults.json
├── 📁 dist/ (generated)
├── 📁 node_modules/ (generated)
├── package.json
├── tsconfig.json
├── vite.config.js
├── vite.content-script.config.js
└── README.md
```

---

## Detailed Structure with Explanations

### `/public/` - Static Assets

Static files that are copied directly to the build output without processing.

```
public/
├── manifest.json          # Extension configuration (Manifest V3)
└── 📁 icons/
    ├── icon-16.png       # Toolbar icon (16x16)
    ├── icon-32.png       # Extension management (32x32)
    ├── icon-48.png       # Extensions page (48x48)
    └── icon-128.png      # Chrome Web Store (128x128)
```

**`manifest.json`** - Chrome extension configuration file that defines permissions, entry points, and metadata. This follows Manifest V3 specification and tells the browser how to load your extension.

**`icons/`** - Extension icons in various sizes required by different browser contexts. These are referenced in manifest.json and provide visual identity for your extension.

---

### `/src/features/` - Your Feature Modules 🎯

This is where all your extension features live. Each feature is completely self-contained and auto-discovered by the framework.

```
src/features/
├── index.js                          # Feature registry (export all features here)
├── 📁 page-analyzer/
│   ├── index.js                      # Page analysis feature module
│   └── 📁 components/
│       └── PageAnalyzerTab.tsx       # UI component for popup
├── 📁 quote-generator/
│   ├── index.js                      # Quote fetching feature module
│   └── 📁 components/
│       └── QuoteGeneratorTab.tsx     # UI component for popup
└── 📁 your-new-feature/              # Add your features here
    ├── index.js                      # Feature logic and handlers
    └── 📁 components/
        ├── FeatureTab.tsx            # Popup tab component
        └── FeatureSettings.tsx       # Options page component (optional)
```

**`index.js`** - Central registry that exports all feature modules. The framework auto-discovers anything exported here, eliminating manual configuration.

**Feature Folders** - Each feature is isolated in its own folder with a standard structure:

- **`index.js`** - Contains feature logic, message handlers, and initialization code
- **`components/`** - React components for UI (tabs, settings, etc.)
- **`utils/`** (optional) - Feature-specific utility functions
- **`types/`** (optional) - TypeScript type definitions

**Auto-Discovery Philosophy:** Drop a new feature folder, export it in the main index.js, and the framework automatically loads and integrates it.

---

### `/src/pages/` - Extension UI Pages

Core extension interfaces that users interact with directly.

```
src/pages/
├── index.css                    # Global styles (Tailwind CSS import)
├── 📁 popup/
│   ├── index.html               # HTML entry point for popup
│   ├── popup.tsx                # React root initialization
│   └── page.tsx                 # Main popup component with tabs
└── 📁 options/
    ├── index.html               # HTML entry point for options
    ├── options.tsx              # React root initialization
    └── page.tsx                 # Main options/settings component
```

**`index.css`** - Global stylesheet that imports Tailwind CSS. This provides base styling for the entire extension.

**`popup/`** - Extension popup interface (appears when clicking extension icon):

- **`index.html`** - HTML template with React root div
- **`popup.tsx`** - Initializes React app and renders main component
- **`page.tsx`** - Main popup logic with feature tabs and navigation

**`options/`** - Extension settings/options page (opened via right-click → Options):

- **`index.html`** - HTML template for options page
- **`options.tsx`** - React initialization for options interface
- **`page.tsx`** - Settings interface with theme controls and feature toggles

---

### `/src/platform/` - Framework Core 🚫 Don't Modify

The platform layer provides clean APIs for common extension tasks. These files are framework code and shouldn't be modified.

```
src/platform/
├── api.js                       # Universal API utility (CORS-free requests)
├── content-script.js            # Auto-discovery content script
├── messaging.js                 # Cross-context communication
├── service-worker.js            # Background script coordination
└── storage.js                   # Storage wrapper with auto-defaults
```

**`api.js`** - Universal HTTP client that makes external API requests through the background script, eliminating CORS issues. Provides simple get/post/put/delete methods with automatic JSON parsing.

**`content-script.js`** - Runs on web pages and automatically discovers/loads feature modules. Handles message routing between page content and extension contexts with robust error handling.

**`messaging.js`** - Cross-browser messaging utility for communication between popup, content scripts, and background. Includes timeout handling, error recovery, and tab detection.

**`service-worker.js`** - Background script that coordinates storage operations, API proxying, and extension lifecycle events. Handles cross-browser compatibility and maintains extension state.

**`storage.js`** - Storage abstraction that automatically loads defaults from defaults.json, handles cross-browser sync storage, and provides simple get/set operations with fallback support.

---

### `/src/shared/` - Reusable Components

Common UI components and utilities used across different parts of the extension.

```
src/shared/
├── 📁 components/
│   ├── ExtensionFooter.tsx      # Flexible footer with content slots
│   ├── ExtensionHeader.tsx      # Header with logo and actions
│   ├── ExtensionLogo.tsx        # Customizable brand logo component
│   ├── StatusBadge.tsx          # Extension status indicator
│   ├── TabNavigation.tsx        # UIKit tabs wrapper
│   └── ThemeSelector.tsx        # Theme picker with dark mode toggle
├── 📁 layouts/
│   ├── OptionsWrapper.tsx       # Complete options page layout
│   └── PopupWrapper.tsx         # Complete popup layout shell
└── 📁 hooks/
    └── useActiveTab.ts          # Tab state management hook
```

**`components/`** - Reusable UI components that provide consistent interface elements:

- **`ExtensionFooter.tsx`** - Footer component with multiple content slots (left, center, right)
- **`ExtensionHeader.tsx`** - Header component with logo and action buttons
- **`ExtensionLogo.tsx`** - Branded logo component with customizable icon and name
- **`StatusBadge.tsx`** - Status indicator showing extension state (active, error, loading)
- **`TabNavigation.tsx`** - Wrapper around UIKit tabs for consistent navigation
- **`ThemeSelector.tsx`** - Theme picker with UIKit integration and persistence

**`layouts/`** - Complete page layouts that provide structure for major interfaces:

- **`OptionsWrapper.tsx`** - Full options page layout with header, tabs, and footer
- **`PopupWrapper.tsx`** - Complete popup layout with navigation and theming

**`hooks/`** - Custom React hooks for common extension functionality:

- **`useActiveTab.ts`** - Manages tab state and current browser tab information

---

### `/src/defaults.json` - Configuration & Settings

Default configuration values that are automatically loaded into storage on first run.

```json
{
  "app": {
    "name": "Comet Extension",
    "theme": "metro",
    "variant": "light"
  },
  "ui": {
    "size": "md",
    "animations": true
  },
  "extensionEnabled": true,
  "pageAnalyzerEnabled": true,
  "quoteGeneratorEnabled": true,
  "notificationsEnabled": true
}
```

**Purpose:** Provides sensible defaults for all extension settings. The storage system automatically loads these values if no user preferences exist, ensuring the extension works out of the box.

**Feature Toggles:** Each feature should have an `[featureName]Enabled` setting to allow users to disable features they don't need.

---

### Root Configuration Files

```
├── package.json                     # Node.js dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.js                   # Main build configuration
├── vite.content-script.config.js    # Content script specific build
└── README.md                        # Project documentation
```

**`package.json`** - Defines project dependencies, build scripts, and metadata. Includes development and production build commands.

**`tsconfig.json`** - TypeScript configuration with path mapping for imports (e.g., `@/components`). Enables type checking for React components and platform APIs.

**`vite.config.js`** - Main Vite configuration for building popup, options, and service worker. Handles React compilation and asset optimization.

**`vite.content-script.config.js`** - Separate build configuration for content script that outputs IIFE format for browser compatibility.

---

### Generated Directories

```
├── 📁 dist/ (generated)            # Production build output
└── 📁 node_modules/ (generated)    # NPM dependencies
```

**`dist/`** - Production build output created by `npm run build`. Contains optimized JavaScript, HTML, CSS, and assets ready for extension loading or store submission.

**`node_modules/`** - NPM dependency cache. Contains all package dependencies including React, UIKit, and build tools.

---

## Key Architectural Principles

**📁 Features First:** Everything revolves around self-contained feature modules in the `features/` directory.

**🔄 Auto-Discovery:** No manual registration - features are automatically found and loaded.

**🎨 UI Consistency:** Shared components and layouts ensure consistent interface across all features.

**🌐 Cross-Browser:** Platform layer abstracts browser differences for seamless compatibility.

**⚙️ Configuration:** Defaults system provides sensible settings that users can customize.

**🔧 Build Simplicity:** Dual Vite configurations handle different extension contexts transparently.

This structure scales from simple extensions with one feature to complex extensions with dozens of features while maintaining organization and consistency.
