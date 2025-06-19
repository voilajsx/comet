/**
 * Comet Framework - Quote Generator Module (Simplified)
 * Fetches inspirational quotes using Comet API utilities
 * @module @voilajsx/comet
 * @file src/scripts/modules/quoteGenerator.js
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
    console.log('[Quote Generator] Module initialized');
  },
};

/**
 * Get a random quote with backup API
 */
async function getRandomQuote() {
  const apis = [
    {
      url: 'https://api.adviceslip.com/advice',
      transform: (response) => ({
        text: response.data.data.slip.advice, // response.data.data.slip.advice
        author: 'Anonymous',
        tags: ['advice'],
      }),
    },
    {
      url: 'https://api.kanye.rest/',
      transform: (response) => ({
        text: response.data.data.quote, // response.data.data.quote
        author: 'Kanye West',
        tags: ['inspiration'],
      }),
    },
  ];

  for (const api of apis) {
    try {
      console.log(`[Quote Generator] Trying ${api.url}`);
      const response = await comet.get(api.url);

      console.log(
        `[Quote Generator] Full response:`,
        JSON.stringify(response, null, 2)
      );

      if (response.ok && response.data && response.data.data) {
        const quote = api.transform(response);

        console.log(`[Quote Generator] Transformed quote:`, quote);

        return {
          success: true,
          quote: {
            text: quote.text,
            author: quote.author,
            length: quote.text.length,
            tags: quote.tags,
          },
          timestamp: Date.now(),
        };
      }
    } catch (error) {
      console.warn(`[Quote Generator] API failed:`, error);
      continue;
    }
  }

  return {
    success: false,
    error: 'APIs unavailable',
    fallbackQuote: getFallbackQuote(),
  };
}

/**
 * Get motivational quote
 */
async function getMotivationalQuote() {
  const result = await getRandomQuote();

  if (result.success) {
    result.quote.category = 'motivational';
    return result;
  }

  return {
    success: false,
    error: result.error,
    fallbackQuote: getMotivationalFallback(),
  };
}

/**
 * Fallback quotes
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
  return { ...quote, source: 'fallback', tags: ['wisdom'] };
}

function getMotivationalFallback() {
  const quotes = [
    {
      text: 'Success is courage to continue despite failures.',
      author: 'Winston Churchill',
    },
    {
      text: 'The only impossible journey is the one you never begin.',
      author: 'Tony Robbins',
    },
    {
      text: "Don't watch the clock; keep going like it does.",
      author: 'Sam Levenson',
    },
  ];

  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  return {
    ...quote,
    category: 'motivational',
    source: 'fallback',
    tags: ['motivation'],
  };
}

export default quoteGeneratorModule;
