/**
 * Quote Generator Feature - Clean Version with comet.api only
 * @module @voilajsx/comet
 * @file src/features/quote-generator/index.ts
 */

import { comet } from '@voilajsx/comet/api';
import type { ModuleConfig } from '@/featuretypes';

// Type definitions for this feature
interface Quote {
  text: string;
  author: string;
  category: 'advice' | 'wisdom' | 'motivational';
  source: 'api' | 'fallback';
  timestamp: number;
}

interface QuoteApiResponse {
  data?: {
    slip?: {
      advice?: string;
    };
  };
}

interface QuoteOption {
  value: string;
  label: string;
  description: string;
}

// 🎯 FEATURE CONFIG with proper options discovery
const config: ModuleConfig = {
  name: 'quoteGenerator', // ✅ FIXED: Must match folder name pattern

  // 🎨 UI Auto-Discovery Configuration
  ui: {
    popup: {
      tab: {
        label: 'Quotes',
        icon: 'Quote',
        order: 2,
        requiresTab: false,
        description: 'Get inspirational quotes',
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        label: 'Quote Generator',
        icon: 'Quote',
        section: 'features', // ✅ ADDED: Required for options discovery
        order: 3,
        description: 'Configure quote generation behavior',
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  // ⚙️ Settings Schema (Required for options discovery)
  settings: {
    quoteType: {
      key: 'quoteGenerator.type',
      default: 'general',
      type: 'select',
      label: 'Quote Type',
      description: 'Choose the type of quotes to display',
      options: [
        {
          value: 'general',
          label: 'General Quotes',
        },
        {
          value: 'motivational',
          label: 'Motivational Quotes',
        },
      ],
    },
  },

  // ℹ️ Feature Metadata
  meta: {
    name: 'Quote Generator',
    description: 'Simple inspirational quotes with offline fallback',
    version: '1.0.0',
    permissions: [],
    author: 'Comet Framework',
    category: 'inspiration',
    tags: ['quotes', 'inspiration'],
  },

  // 🔧 BUSINESS LOGIC & HANDLERS
  handlers: {
    getQuote: (): Promise<Quote> => getQuote(),
    getMotivationalQuote: (): Promise<Quote> => getMotivationalQuote(),
  },

  // Main action for combined operations
  mainAction: (): Promise<Quote> => getQuote(),

  // Feature initialization
  init: (): void => {
    console.log('[Quote Generator] Feature initialized');
  },

  // Lifecycle hooks
  lifecycle: {
    onEnable: (): void => {
      console.log('[Quote Generator] Feature enabled');
    },
    onDisable: (): void => {
      console.log('[Quote Generator] Feature disabled');
    },
    onSettingsChange: (changedSettings: any): void => {
      console.log('[Quote Generator] Settings changed:', changedSettings);
    },
  },
};

// 🚀 SIMPLE API FUNCTIONS (comet.api only)

/**
 * Get a random quote from API with fallback
 */
export async function getQuote(): Promise<Quote> {
  try {
    console.log('[Quotes] 🚀 Fetching quote from API');

    const response = await comet.get('https://api.adviceslip.com/advice');

    if (response.ok && response.data?.data?.slip?.advice) {
      console.log('[Quotes] ✅ API quote received');
      return {
        text: response.data.data.slip.advice,
        author: 'Anonymous',
        category: 'advice',
        source: 'api',
        timestamp: Date.now(),
      };
    } else {
      throw new Error('Invalid API response');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('[Quotes] ⚠️ API failed, using fallback:', errorMessage);
    return getFallbackQuote();
  }
}

/**
 * Get a motivational quote (same API, different fallback)
 */
export async function getMotivationalQuote(): Promise<Quote> {
  try {
    const quote = await getQuote();
    if (quote.source === 'api') {
      quote.category = 'motivational';
      return quote;
    } else {
      // Use motivational fallback instead
      return getMotivationalFallback();
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('[Quotes] ⚠️ Motivational quote failed:', errorMessage);
    return getMotivationalFallback();
  }
}

/**
 * Get fallback quote when API is down
 */
function getFallbackQuote(): Quote {
  const quotes: Omit<Quote, 'category' | 'source' | 'timestamp'>[] = [
    {
      text: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
    },
    {
      text: "Life is what happens while you're busy making other plans.",
      author: 'John Lennon',
    },
    {
      text: 'The future belongs to those who believe in their dreams.',
      author: 'Eleanor Roosevelt',
    },
    {
      text: 'Be yourself; everyone else is already taken.',
      author: 'Oscar Wilde',
    },
    {
      text: 'In the middle of difficulty lies opportunity.',
      author: 'Albert Einstein',
    },
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return {
    ...randomQuote,
    category: 'wisdom',
    source: 'fallback',
    timestamp: Date.now(),
  };
}

/**
 * Get motivational fallback quotes
 */
function getMotivationalFallback(): Quote {
  const quotes: Omit<Quote, 'category' | 'source' | 'timestamp'>[] = [
    {
      text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
      author: 'Winston Churchill',
    },
    {
      text: 'The only impossible journey is the one you never begin.',
      author: 'Tony Robbins',
    },
    {
      text: "Don't watch the clock; do what it does. Keep going.",
      author: 'Sam Levenson',
    },
    {
      text: "Believe you can and you're halfway there.",
      author: 'Theodore Roosevelt',
    },
    {
      text: 'The way to get started is to quit talking and begin doing.',
      author: 'Walt Disney',
    },
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return {
    ...randomQuote,
    category: 'motivational',
    source: 'fallback',
    timestamp: Date.now(),
  };
}

// Export the feature module
export default config;