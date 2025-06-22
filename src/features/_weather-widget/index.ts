/**
 * Weather Widget Feature - Simplified TypeScript Version
 * @module @voilajsx/comet
 * @file src/features/weather-widget/index.ts
 */

import { messaging } from '@voilajsx/comet/messaging';
import type { ModuleConfig } from '@/featuretypes';

// Type definitions for this feature
interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  source: 'api' | 'fallback';
  timestamp: number;
}

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
  };
}

interface WeatherApiResponse {
  current_condition: Array<{
    temp_C: string;
    FeelsLikeC: string;
    weatherDesc: Array<{ value: string }>;
    humidity: string;
    windspeedKmph: string;
    winddir16Point: string;
    pressure: string;
    visibility: string;
    uvIndex: string;
  }>;
  nearest_area: Array<{
    areaName: Array<{ value: string }>;
    region: Array<{ value: string }>;
    country: Array<{ value: string }>;
  }>;
}

// 🎯 FEATURE CONFIG
const config: ModuleConfig = {
  name: 'weatherWidget',

  // 🎨 UI Auto-Discovery Configuration
  ui: {
    popup: {
      tab: {
        label: 'Weather',
        icon: 'Sun',
        order: 4,
        requiresTab: false,
        description: 'Check current weather conditions',
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        label: 'Weather Widget',
        icon: 'Sun',
        section: 'features',
        order: 4,
        description: 'Configure weather widget settings',
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  // ⚙️ Settings Schema
  settings: {
    defaultCity: {
      key: 'weatherWidget.defaultCity',
      default: 'Hyderabad',
      type: 'string',
      label: 'Default City',
      description: 'Default city for weather information',
    },
    useGPS: {
      key: 'weatherWidget.useGPS',
      default: true,
      type: 'boolean',
      label: 'Use GPS Location',
      description: 'Automatically detect location for weather',
    },
    temperatureUnit: {
      key: 'weatherWidget.temperatureUnit',
      default: 'celsius',
      type: 'select',
      label: 'Temperature Unit',
      description: 'Temperature display format',
      options: [
        { value: 'celsius', label: 'Celsius (°C)' },
        { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
      ],
    },
  },

  // ℹ️ Feature Metadata
  meta: {
    name: 'Weather Widget',
    description: 'Current weather conditions with GPS location support',
    version: '1.0.0',
    author: 'Comet Framework',
    category: 'utility',
    tags: ['weather', 'location', 'gps'],
  },

  // 🔧 BUSINESS LOGIC & HANDLERS
  handlers: {
    getWeather: (data?: { city?: string }): Promise<WeatherData> => getWeather(data?.city),
    getCurrentWeather: (): Promise<WeatherData> => getWeather(),
  },

  // Main action for combined operations
  mainAction: (): Promise<WeatherData> => getWeather(),

  // Feature initialization
  init: (): void => {
    console.log('[Weather Widget] Feature initialized');
  },

  // Lifecycle hooks
  lifecycle: {
    onEnable: (): void => {
      console.log('[Weather Widget] Feature enabled');
    },
    onDisable: (): void => {
      console.log('[Weather Widget] Feature disabled');
    },
    onSettingsChange: (changedSettings: any): void => {
      console.log('[Weather Widget] Settings changed:', changedSettings);
    },
  },
};

// 🚀 SIMPLE API FUNCTIONS (Direct exports)

/**
 * Get weather data with fallback
 */
export async function getWeather(cityName?: string): Promise<WeatherData> {
  try {
    let city = cityName || 'Hyderabad';

    // If no city provided, try to get location
    if (!cityName) {
      try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        city = `${latitude},${longitude}`;
        console.log('[Weather] 📍 Using GPS location:', city);
      } catch (locationError: unknown) {
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

      const apiData = response.data.data as WeatherApiResponse;
      const current = apiData.current_condition[0];
      const nearest = apiData.nearest_area[0];

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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('[Weather] ⚠️ API failed, using fallback:', errorMessage);
    return getFallbackWeather(cityName);
  }
}

/**
 * Get current GPS position
 */
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position as GeolocationPosition),
      (error) => reject(error),
      {
        timeout: 5000,
        enableHighAccuracy: false,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  });
}

/**
 * Fallback weather when API is down
 */
function getFallbackWeather(cityName: string = 'Hyderabad'): WeatherData {
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

// Export the feature module
export default config;