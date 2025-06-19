# 🚀 Comet Framework

**Minimal but powerful cross-browser extension framework built with React and UIKit**

Build beautiful, functional browser extensions with explicit module management. Works with Chrome, Firefox, Edge, Opera, Brave, and other WebExtension browsers.

## ✨ Features

- **🔧 Simple Module System** - Explicit manifest-based module registration
- **🌐 Cross-Browser** - Chrome, Firefox, Edge, Opera, Brave support
- **📦 Zero Configuration** - Framework handles all the complexity
- **🎨 Beautiful UI** - Built with @voilajsx/uikit theming system
- **🛡️ Bulletproof** - Robust error handling, never breaks
- **📦 Modular** - Clean separation between framework and app code
- **🔄 Live Reload** - Hot reloading during development

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development

```bash
npm run dev
```

### 3. Load Extension

1. Open Chrome/Firefox extension management
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` folder
4. Your extension is ready!

## 📁 Project Structure

```
src/
├── platform/           # 🔒 Framework core (don't modify)
│   ├── background.js   # Extension lifecycle management
│   ├── storage.js      # Cross-browser storage wrapper
│   └── messaging.js    # Cross-browser messaging wrapper
├── scripts/            # 👨‍💻 Your page interaction code
│   ├── bridge.js       # Module coordinator (framework-level)
│   └── modules/        # Your modules + manifest
│       ├── index.js           # 📋 Module manifest (REQUIRED)
│       ├── pageAnalyzer.js    # Example: Page analysis
│       ├── quoteGenerator.js  # Example: API integration
│       └── userAuth.js        # Example: Authentication
├── pages/              # 👨‍💻 Your extension UI
│   ├── popup/          # Extension popup interface
│   └── options/        # Extension settings page
├── components/         # 👨‍💻 Reusable UI components
├── hooks/              # 👨‍💻 Custom React hooks
├── utils/              # 👨‍💻 Helper utilities
└── types/              # 👨‍💻 TypeScript definitions
```

## 🔧 Building Your First Module

### Step 1: Create Module File

Create `src/scripts/modules/myModule.js`:

```javascript
export default {
  name: 'myModule',

  // Message handlers this module provides
  handlers: {
    doSomething: (data) => {
      return {
        message: `Hello from ${data.name}!`,
        timestamp: Date.now(),
      };
    },

    analyzeData: (data) => {
      // Your analysis logic here
      return { result: 'analysis complete' };
    },
  },

  // Main action for combined operations
  mainAction: (data) => {
    return { action: 'completed', data };
  },

  // Optional initialization
  init: () => {
    console.log('My module initialized');
  },
};
```

### Step 2: Register in Manifest

Edit `src/scripts/modules/index.js`:

```javascript
// Import your modules
import pageAnalyzer from './pageAnalyzer.js';
import quoteGenerator from './quoteGenerator.js';
import userAuth from './userAuth.js';
import myModule from './myModule.js'; // 👈 Add your import

// Export all modules
export const modules = [
  pageAnalyzer,
  quoteGenerator,
  userAuth,
  myModule, // 👈 Add to the array
];
```

### Step 3: Use the Module

From popup or any extension component:

```javascript
import { messaging } from '@voilajsx/comet/messaging';

// Call your module
const response = await messaging.sendToContent({
  type: 'doSomething',
  data: { name: 'World' },
});

console.log(response.data.message); // "Hello from World!"
```

That's it! Simple, explicit, and production-ready.

## 🎨 Module Development Workflow

### Adding New Modules

```bash
# 1. Create module file
touch src/scripts/modules/newModule.js

# 2. Write module configuration
# 3. Add import to modules/index.js
# 4. Add to modules array
# 5. Done! Framework auto-loads it
```

### Module Template

```javascript
export default {
  name: 'moduleName', // REQUIRED: Unique identifier

  // Message handlers (optional)
  handlers: {
    handlerName: (data, sender) => {
      // Your logic here
      return { success: true, result: data };
    },
  },

  // Main action for combined operations (optional)
  mainAction: (data) => {
    // Called when "performMainAction" is triggered
    return { completed: true };
  },

  // Initialization function (optional)
  init: () => {
    console.log('Module initialized');
  },
};
```

## 🎨 Customizing the UI

### Update Popup

Edit `src/pages/popup/page.tsx`:

```javascript
import { messaging } from '@voilajsx/comet/messaging';
import { Button } from '@voilajsx/uikit/button';

export default function PopupPage() {
  const handleAction = async () => {
    const result = await messaging.sendToContent({
      type: 'doSomething',
      data: { name: 'User' },
    });

    console.log('Module response:', result);
  };

  return (
    <PopupLayout title="My Extension">
      <Button onClick={handleAction}>Perform Action</Button>
    </PopupLayout>
  );
}
```

### Customize Theme

Update the theme in your page components:

```javascript
<ThemeProvider theme="neon" variant="dark">
  <PopupLayout>{/* Your UI */}</PopupLayout>
</ThemeProvider>
```

Available themes: `default`, `aurora`, `metro`, `neon`, `ruby`, `studio`

## 🔧 Platform APIs

### Storage

```javascript
import { storage } from '@voilajsx/comet/storage';

// Save data
await storage.set('key', 'value');
await storage.set({ user: 'john', theme: 'dark' });

// Get data
const value = await storage.get('key');
const data = await storage.get(['user', 'theme']);

// Check existence
const exists = await storage.has('key');

// Remove data
await storage.remove('key');
await storage.clear();
```

### Messaging

```javascript
import { messaging } from '@voilajsx/comet/messaging';

// Send to content script
const response = await messaging.sendToContent({
  type: 'analyzeData',
  data: { url: 'https://example.com' },
});

// Send to background
const bgResponse = await messaging.sendToBackground({
  type: 'updateBadge',
  data: { text: '5' },
});

// Listen for messages
const unsubscribe = messaging.onMessageType('getData', (data, sender) => {
  return { result: 'processed' };
});
```

## 📊 Example Modules

### Page Analysis Module

```javascript
export default {
  name: 'pageAnalyzer',

  handlers: {
    getPageData: () => {
      return {
        title: document.title,
        wordCount: document.body.innerText.split(' ').length,
        linkCount: document.links.length,
        url: window.location.href,
      };
    },
  },

  mainAction: () => {
    return {
      analysis: 'complete',
      data: document.title,
    };
  },
};
```

### API Integration Module

```javascript
export default {
  name: 'weatherModule',

  handlers: {
    getWeather: async (data) => {
      const response = await fetch(
        `https://api.weather.com/current?city=${data.city}`
      );
      const weather = await response.json();

      return {
        temperature: weather.temp,
        condition: weather.condition,
        city: data.city,
      };
    },
  },
};
```

## 🛠️ Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Build and package extension
npm run package

# Type checking
npm run type-check

# Clean build files
npm run clean
```

## 🌐 Cross-Browser Support

Comet automatically detects and adapts to different browsers:

- **Chrome** - Full support
- **Firefox** - Full support
- **Edge** - Full support
- **Opera** - Full support
- **Brave** - Full support

No code changes needed - write once, run everywhere!

## 💡 Best Practices

### Module Development

- **Keep modules focused** - One responsibility per module
- **Always add to manifest** - Register in `modules/index.js`
- **Handle errors gracefully** - Modules should never crash
- **Use descriptive names** - Clear handler names improve debugging

### Module Manifest Management

```javascript
// ✅ Good: Organized and clear
export const modules = [
  // Core functionality
  pageAnalyzer,
  userAuth,

  // API integrations
  quoteGenerator,
  weatherModule,

  // UI enhancements
  themeManager,
  notificationHandler,
];
```

### Performance

- **Minimize DOM queries** - Cache selectors when possible
- **Use debouncing** - For frequent operations
- **Optimize storage** - Use appropriate storage types

### Security

- **Validate inputs** - Always sanitize user data
- **Use HTTPS APIs** - Secure external connections
- **Minimal permissions** - Request only what you need

## 🐛 Troubleshooting

### Common Issues

**Module not loading:**

- Check console for import errors
- Verify module is added to `modules/index.js`
- Ensure module export structure is correct

**"No handler" errors:**

- Verify handler name matches exactly
- Check if module registered successfully
- Look for initialization errors in console

**Storage not working:**

- Check permissions in manifest.json
- Verify async/await usage
- Check browser console for errors

## 📚 API Reference

### Module Configuration

```javascript
export default {
  name: string,              // REQUIRED: Unique module identifier
  handlers?: object,         // Message handlers { handlerName: function }
  mainAction?: function,     // Main action for combined operations
  init?: function,          // Initialization function
}
```

### Core Message Types

- `ping` - Health check
- `getPageInfo` - Current page information
- `getModules` - List of loaded modules
- `performMainAction` - Execute all module main actions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ by [VoilaJSX](https://github.com/voilajsx)**

_Simple, explicit, production-ready browser extension development!_
