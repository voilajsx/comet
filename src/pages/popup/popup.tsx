/**
 * Comet Framework - Extension popup entry point
 * Initializes React app for Chrome extension popup interface
 * @module @voilajsx/comet
 * @file src/pages/popup/popup.tsx
 */

import { createRoot } from 'react-dom/client';
import '@voilajsx/uikit/styles';
import '../index.css'
import PopupPage from './page';

/**
 * Initialize the comet extension popup interface
 * Sets up React root and renders the main popup component
 */
const root = createRoot(document.getElementById('root')!);
root.render(<PopupPage />);