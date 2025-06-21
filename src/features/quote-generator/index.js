/**
 * Quote Generator Feature - Simplified Version
 * @module @voilajsx/comet
 * @file src/features/quote-generator/index.js
 */

import { messaging } from '@voilajsx/comet/messaging';

// 🎯 SIMPLE FEATURE CONFIG
export default {
  name: 'Quote Generator',
  version: '1.0.0',

  // UI discovery (minimal)
  ui: {
    popup: {
      tab: { label: 'Quotes', icon: 'Quote', order: 2 },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: { label: 'Quote Generator', icon: 'Quote' },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },
};

// 🚀 SIMPLE API FUNCTIONS (Direct exports)

/**
 * Get a random quote from API with fallback
 */
export async function getQuote() {
  try {
    console.log('[Quotes] 🚀 Fetching quote from API');

    const response = await messaging.sendToBackground({
      type: 'api.fetch',
      data: { url: 'https://api.adviceslip.com/advice' },
    });
    console.log('[Quotes] 📡 API response:', response);
    if (response.success && response.data?.data?.slip?.advice) {
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
  } catch (error) {
    console.warn('[Quotes] ⚠️ API failed, using fallback:', error.message);
    return getFallbackQuote();
  }
}

/**
 * Get a motivational quote (same API, different fallback)
 */
export async function getMotivationalQuote() {
  try {
    const quote = await getQuote();
    if (quote.source === 'api') {
      quote.category = 'motivational';
      return quote;
    } else {
      // Use motivational fallback instead
      return getMotivationalFallback();
    }
  } catch (error) {
    console.warn('[Quotes] ⚠️ Motivational quote failed:', error.message);
    return getMotivationalFallback();
  }
}

/**
 * Get fallback quote when API is down
 */
function getFallbackQuote() {
  const quotes = [
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
function getMotivationalFallback() {
  const quotes = [
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
