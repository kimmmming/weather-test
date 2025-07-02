'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, MapPin, Thermometer, Droplets, Wind, Compass } from 'lucide-react';

interface WeatherData {
  temperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

const cities: City[] = [
  { name: '北京', country: '中国', lat: 39.9042, lon: 116.4074 },
  { name: '上海', country: '中国', lat: 31.2304, lon: 121.4737 },
  { name: '东京', country: '日本', lat: 35.6762, lon: 139.6503 },
  { name: '纽约', country: '美国', lat: 40.7128, lon: -74.0060 },
  { name: '伦敦', country: '英国', lat: 51.5074, lon: -0.1278 },
  { name: '巴黎', country: '法国', lat: 48.8566, lon: 2.3522 },
  { name: '悉尼', country: '澳大利亚', lat: -33.8688, lon: 151.2093 },
  { name: '柏林', country: '德国', lat: 52.5200, lon: 13.4050 },
  { name: '莫斯科', country: '俄罗斯', lat: 55.7558, lon: 37.6173 },
  { name: '首尔', country: '韩国', lat: 37.5665, lon: 126.9780 },
];

const getWeatherIcon = (weatherCode: number): string => {
  const icons: { [key: number]: string } = {
    0: '☀️', // Clear sky
    1: '🌤️', // Mainly clear
    2: '⛅', // Partly cloudy
    3: '☁️', // Overcast
    45: '🌫️', // Fog
    48: '🌫️', // Depositing rime fog
    51: '🌦️', // Light drizzle
    53: '🌦️', // Moderate drizzle
    55: '🌦️', // Dense drizzle
    61: '🌧️', // Slight rain
    63: '🌧️', // Moderate rain
    65: '🌧️', // Heavy rain
    71: '🌨️', // Slight snow
    73: '🌨️', // Moderate snow
    75: '🌨️', // Heavy snow
    77: '🌨️', // Snow grains
    80: '🌦️', // Slight rain showers
    81: '🌦️', // Moderate rain showers
    82: '🌦️', // Violent rain showers
    85: '🌨️', // Slight snow showers
    86: '🌨️', // Heavy snow showers
    95: '⛈️', // Thunderstorm
    96: '⛈️', // Thunderstorm with slight hail
    99: '⛈️', // Thunderstorm with heavy hail
  };
  return icons[weatherCode] || '🌤️';
};

const getWeatherDescription = (weatherCode: number): string => {
  const descriptions: { [key: number]: string } = {
    0: '晴朗',
    1: '基本晴朗',
    2: '局部多云',
    3: '阴天',
    45: '雾',
    48: '雾凇',
    51: '小雨',
    53: '中雨',
    55: '大雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '雪粒',
    80: '阵雨',
    81: '中阵雨',
    82: '强阵雨',
    85: '阵雪',
    86: '大阵雪',
    95: '雷暴',
    96: '雷暴伴小冰雹',
    99: '雷暴伴大冰雹',
  };
  return descriptions[weatherCode] || '未知';
};

const getTemperatureColor = (temp: number): string => {
  if (temp >= 30) return 'bg-red-500';
  if (temp >= 20) return 'bg-orange-500';
  if (temp >= 10) return 'bg-yellow-500';
  if (temp >= 0) return 'bg-blue-500';
  return 'bg-indigo-500';
};

export default function WeatherApp() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 随机选择一个城市
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      
      // 调用 Open-Meteo API
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${randomCity.lat}&longitude=${randomCity.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error('获取天气数据失败');
      }
      
      const data = await response.json();
      
      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        city: randomCity.name,
        country: randomCity.country,
        latitude: randomCity.lat,
        longitude: randomCity.lon,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const getWindDirection = (degree: number): string => {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              🌍 随机天气
            </CardTitle>
            <CardDescription className="text-gray-600">
              探索世界各地的天气情况
            </CardDescription>
            <div className="flex gap-2 justify-center mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/openweather'}
              >
                OpenWeatherMap 版本
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-3" />
                <p className="text-gray-600">正在获取天气数据...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-6">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchWeather} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重试
                </Button>
              </div>
            )}

            {weather && !loading && (
              <div className="space-y-6">
                {/* 城市信息 */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      {weather.city}, {weather.country}
                    </h2>
                  </div>
                  <Badge variant="outline" className="text-xs text-gray-500">
                    {weather.latitude.toFixed(2)}°, {weather.longitude.toFixed(2)}°
                  </Badge>
                </div>

                <Separator />

                {/* 主要天气信息 */}
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {getWeatherIcon(weather.weatherCode)}
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Thermometer className="h-6 w-6 text-gray-500" />
                    <span className="text-4xl font-bold text-gray-800">
                      {weather.temperature}°C
                    </span>
                  </div>
                  <Badge 
                    className={`${getTemperatureColor(weather.temperature)} text-white`}
                  >
                    {getWeatherDescription(weather.weatherCode)}
                  </Badge>
                </div>

                <Separator />

                {/* 详细信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-blue-50/50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600">湿度</span>
                      </div>
                      <div className="text-xl font-semibold text-gray-800">
                        {weather.humidity}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50/50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Wind className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">风速</span>
                      </div>
                      <div className="text-xl font-semibold text-gray-800">
                        {weather.windSpeed} km/h
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-purple-50/50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Compass className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-600">风向</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-800">
                      {getWindDirection(weather.windDirection)} ({weather.windDirection}°)
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  onClick={fetchWeather} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  🎲 随机切换城市
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
