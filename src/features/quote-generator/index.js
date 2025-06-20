/**
 * Quote Generator Feature Module - Simplified
 * Fetches inspirational quotes with basic fallback
 * @module @voilajsx/comet
 * @file src/features/quote-generator/index.js
 */

import { comet } from '@voilajsx/comet/api';

/**
 * Quote Generator Module Configuration
 */
const quoteGeneratorModule = {
  name: 'quoteGenerator',

  handlers: {
    getQuote: () => getRandomQuote(),
    getMotivationalQuote: () => getMotivationalQuote(),
  },

  mainAction: () => getRandomQuote(),

  init: () => {
    console.log('[Quote Generator] Feature initialized');
  },

  meta: {
    name: 'Quote Generator',
    description: 'Simple inspirational quotes',
    version: '1.0.0',
    permissions: [],
  },
};

/**
 * Get a random quote with basic fallback
 * @returns {Promise<object>} Quote result
 */
async function getRandomQuote() {
  // Try primary API first
  try {
    console.log('[Quote Generator] Fetching quote from API');

    const response = await comet.get('https://api.adviceslip.com/advice');

    if (response.ok && response.data?.slip?.advice) {
      return {
        success: true,
        quote: {
          text: response.data.slip.advice,
          author: 'Anonymous',
          category: 'advice',
          timestamp: Date.now(),
        },
      };
    }
  } catch (error) {
    console.warn('[Quote Generator] API failed:', error);
  }

  // Fallback to local quotes
  return {
    success: false,
    error: 'API unavailable',
    fallbackQuote: getFallbackQuote(),
  };
}

/**
 * Get motivational quote
 * @returns {Promise<object>} Motivational quote result
 */
async function getMotivationalQuote() {
  const result = await getRandomQuote();

  if (result.success) {
    result.quote.category = 'motivational';
  } else {
    result.fallbackQuote = getMotivationalFallback();
  }

  return result;
}

/**
 * Fallback quotes when API is unavailable
 * @private
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
  ];

  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  return {
    ...quote,
    category: 'wisdom',
    source: 'fallback',
    timestamp: Date.now(),
  };
}

/**
 * Motivational fallback quotes
 * @private
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
  ];

  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  return {
    ...quote,
    category: 'motivational',
    source: 'fallback',
    timestamp: Date.now(),
  };
}

export default quoteGeneratorModule;
