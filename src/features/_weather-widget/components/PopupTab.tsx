/**
 * Weather Widget Popup Tab - Simplified with Direct Imports
 * @module @voilajsx/comet
 * @file src/features/weather-widget/components/PopupTab.tsx
 */

import React, { useState, useEffect } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { 
  Sun, 
  Loader2, 
  RefreshCw, 
  MapPin, 
  Wind, 
  Droplets, 
  AlertCircle, 
  Eye,
  Gauge,
  CheckCircle
} from 'lucide-react';

// ✅ DIRECT IMPORT - Simple and clean!
import { getWeather } from '../index.js';

/**
 * Status alert component
 */
function StatusAlert({ result, onDismiss }) {
  React.useEffect(() => {
    if (result && onDismiss) {
      const timer = setTimeout(onDismiss, 2000);
      return () => clearTimeout(timer);
    }
  }, [result, onDismiss]);

  if (!result) return null;

  const Icon = result.type === 'success' ? CheckCircle : AlertCircle;
  const variant = result.type === 'success' ? 'default' : 'destructive';

  return (
    <Alert variant={variant}>
      <Icon className="h-4 w-4" />
      <AlertDescription className="pt-1">{result.message}</AlertDescription>
    </Alert>
  );
}

export default function WeatherWidgetTab({ value }) {
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [status, setStatus] = useState(null);
  const [cityInput, setCityInput] = useState('');
  const [showCityInput, setShowCityInput] = useState(false);

  // Load weather on mount
  useEffect(() => {
    handleGetWeather();
  }, []);

  const handleGetWeather = async (city = null) => {
    console.log('[Weather PopupTab] 🚀 Getting weather for:', city || 'current location');
    
    setIsLoading(true);
    setStatus(null);

    try {
      // ✅ DIRECT FUNCTION CALL - No complex messaging!
      const weather = await getWeather(city);
      
      console.log('[Weather PopupTab] ✅ Weather received:', weather);
      
      setWeatherData(weather);
      setStatus({
        type: 'success',
        message: weather.source === 'api' ? 'Weather updated!' : 'Offline weather'
      });

    } catch (error) {
      console.error('[Weather PopupTab] ❌ Error:', error);
      setStatus({
        type: 'error',
        message: 'Failed to get weather'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySearch = () => {
    if (cityInput.trim()) {
      handleGetWeather(cityInput.trim());
      setCityInput('');
      setShowCityInput(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return '☀️';
    } else if (conditionLower.includes('partly cloudy') || conditionLower.includes('partly')) {
      return '⛅';
    } else if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
      return '☁️';
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return '🌧️';
    } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return '⛈️';
    } else if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
      return '❄️';
    } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
      return '🌫️';
    } else {
      return '🌤️';
    }
  };

  return (
    <TabsContent value={value} className="mt-0">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleGetWeather()}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
            
            <Button
              onClick={() => setShowCityInput(!showCityInput)}
              variant="outline"
              size="icon"
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </div>

          {/* City Input */}
          {showCityInput && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter city name"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCitySearch()}
                className="flex-1"
              />
              <Button onClick={handleCitySearch} size="sm">
                Search
              </Button>
            </div>
          )}

          {/* Status */}
          <StatusAlert 
            result={status} 
            onDismiss={() => setStatus(null)} 
          />

          {/* Weather Display */}
          {weatherData && !isLoading && (
            <div className="space-y-4">
              {/* Location */}
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{weatherData.city}</span>
                  {weatherData.country && (
                    <span className="text-sm text-muted-foreground">
                      , {weatherData.country}
                    </span>
                  )}
                </div>
              </div>

              {/* Main Weather */}
              <div className="text-center bg-muted/50 p-4 rounded-lg">
                <div className="text-4xl mb-2">
                  {getWeatherIcon(weatherData.condition)}
                </div>
                <div className="text-2xl font-bold mb-1">
                  {weatherData.temperature}°C
                </div>
                {weatherData.feelsLike && weatherData.feelsLike !== weatherData.temperature && (
                  <div className="text-sm text-muted-foreground mb-1">
                    Feels like {weatherData.feelsLike}°C
                  </div>
                )}
                <div className="text-sm text-muted-foreground capitalize">
                  {weatherData.condition}
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Humidity */}
                <div className="bg-card border rounded p-3 text-center">
                  <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                  <div className="text-sm font-medium">{weatherData.humidity}%</div>
                  <div className="text-xs text-muted-foreground">Humidity</div>
                </div>
                
                {/* Wind */}
                <div className="bg-card border rounded p-3 text-center">
                  <Wind className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                  <div className="text-sm font-medium">
                    {weatherData.windSpeed} km/h
                    {weatherData.windDirection && (
                      <span className="text-xs ml-1">{weatherData.windDirection}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Wind</div>
                </div>

                {/* Pressure */}
                {weatherData.pressure && (
                  <div className="bg-card border rounded p-3 text-center">
                    <Gauge className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                    <div className="text-sm font-medium">{weatherData.pressure} mb</div>
                    <div className="text-xs text-muted-foreground">Pressure</div>
                  </div>
                )}

                {/* Visibility */}
                {weatherData.visibility && (
                  <div className="bg-card border rounded p-3 text-center">
                    <Eye className="w-4 h-4 mx-auto mb-1 text-green-500" />
                    <div className="text-sm font-medium">{weatherData.visibility} km</div>
                    <div className="text-xs text-muted-foreground">Visibility</div>
                  </div>
                )}
              </div>

              {/* UV Index */}
              {weatherData.uvIndex !== undefined && (
                <div className="text-center p-2 bg-muted/30 rounded">
                  <div className="text-sm">
                    <span className="text-muted-foreground">UV Index: </span>
                    <span className="font-medium">{weatherData.uvIndex}</span>
                  </div>
                </div>
              )}

              {/* Source Badge */}
              <div className="text-center text-xs text-muted-foreground pt-2 border-t">
                {weatherData.source === 'api' ? (
                  <span>⚡ Live data from wttr.in</span>
                ) : (
                  <span>📱 Offline weather data</span>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                Getting weather data...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}