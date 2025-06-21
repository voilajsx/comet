/**
 * Weather Widget Feature - Simplified Version
 * @module @voilajsx/comet
 * @file src/features/weather-widget/index.js
 */

import { messaging } from '@voilajsx/comet/messaging';

// 🎯 SIMPLE FEATURE CONFIG
export default {
  name: 'Weather Widget',
  version: '1.0.0',

  // UI discovery (minimal)
  ui: {
    popup: {
      tab: { label: 'Weather', icon: 'Sun', order: 4 },
      component: () => import('./components/PopupTab.tsx'),
    },
  },
};

// 🚀 SIMPLE API FUNCTIONS (Direct exports)

/**
 * Get weather data with fallback
 */
export async function getWeather(cityName = null) {
  try {
    let city = cityName || 'Hyderabad';

    // If no city provided, try to get location
    if (!cityName) {
      try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        city = `${latitude},${longitude}`;
        console.log('[Weather] 📍 Using GPS location:', city);
      } catch (locationError) {
        console.log('[Weather] 📍 GPS failed, using default city');
        city = 'Hyderabad';
      }
    }

    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    console.log('[Weather] 🚀 Fetching weather from:', url);

    const response = await messaging.sendToBackground({
      type: 'api.fetch',
      data: { url },
    });

    console.log('[Weather] 📡 API response:', response);

    // ✅ FIXED: Use same structure as quotes - response.data.data
    if (response.success && response.data?.data?.current_condition) {
      console.log('[Weather] ✅ Weather data received');

      const current = response.data.data.current_condition[0];
      const nearest = response.data.data.nearest_area[0];

      return {
        city: nearest.areaName[0].value || nearest.region[0].value || city,
        country: nearest.country[0].value,
        temperature: parseInt(current.temp_C),
        feelsLike: parseInt(current.FeelsLikeC),
        condition: current.weatherDesc[0].value,
        humidity: parseInt(current.humidity),
        windSpeed: parseInt(current.windspeedKmph),
        windDirection: current.winddir16Point,
        pressure: parseInt(current.pressure),
        visibility: parseInt(current.visibility),
        uvIndex: parseInt(current.uvIndex),
        source: 'api',
        timestamp: Date.now(),
      };
    } else {
      throw new Error('Invalid API response');
    }
  } catch (error) {
    console.warn('[Weather] ⚠️ API failed, using fallback:', error.message);
    return getFallbackWeather(cityName);
  }
}

/**
 * Get current GPS position
 */
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 5000,
      enableHighAccuracy: false,
      maximumAge: 300000, // 5 minutes cache
    });
  });
}

/**
 * Fallback weather when API is down
 */
function getFallbackWeather(cityName = 'Hyderabad') {
  return {
    city: cityName,
    country: 'India',
    temperature: 28,
    feelsLike: 32,
    condition: 'Partly cloudy',
    humidity: 65,
    windSpeed: 12,
    windDirection: 'SW',
    pressure: 1013,
    visibility: 10,
    uvIndex: 6,
    source: 'fallback',
    timestamp: Date.now(),
  };
}
