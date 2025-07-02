'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  RefreshCw, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge, 
  Sun, 
  Moon, 
  Search,
  CloudRain,
  AlertCircle 
} from 'lucide-react';
import Image from 'next/image';

interface WeatherData {
  id: number;
  name: string;
  country: string;
  lat: number;
  lon: number;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  visibility: number;
  windSpeed: number;
  windDirection: number;
  cloudiness: number;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
  timezone: number;
}

interface SearchCity {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

// 您需要在这里设置您的 OpenWeatherMap API Key
// 方法1: 使用环境变量 (推荐)
// 方法2: 直接在代码中设置
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '79b750dbcf27b010f27c366ed5ebe0ca'; // 您的 API Key

export default function OpenWeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 默认加载北京的天气
  useEffect(() => {
    if (API_KEY !== 'YOUR_API_KEY_HERE') {
      fetchWeatherByCoords(39.9042, 116.4074); // 北京坐标
    }
  }, []);

  // 搜索城市建议
  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
      );
      
      if (response.ok) {
        const cities = await response.json();
        setSuggestions(cities);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('搜索城市失败:', err);
    } finally {
      setSearching(false);
    }
  };

  // 根据坐标获取天气
  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
      setError('请先设置您的 OpenWeatherMap API Key');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=zh_cn`
      );
      
      if (!response.ok) {
        throw new Error(`获取天气数据失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      setWeather({
        id: data.id,
        name: data.name,
        country: data.sys.country,
        lat: data.coord.lat,
        lon: data.coord.lon,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        tempMin: Math.round(data.main.temp_min),
        tempMax: Math.round(data.main.temp_max),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility ? Math.round(data.visibility / 1000) : 0,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg || 0,
        cloudiness: data.clouds.all,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        timezone: data.timezone,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
    } finally {
      setLoading(false);
    }
  };

  // 选择城市
  const selectCity = (city: SearchCity) => {
    setSearchQuery(`${city.name}, ${city.country}`);
    setShowSuggestions(false);
    fetchWeatherByCoords(city.lat, city.lon);
  };

  // 处理搜索输入
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    searchCities(value);
  };

  // 获取风向
  const getWindDirection = (degree: number): string => {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
  };

  // 格式化时间
  const formatTime = (timestamp: number, timezone: number): string => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toUTCString().slice(-12, -4);
  };

  // 获取天气图标URL
  const getWeatherIconUrl = (icon: string): string => {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  };

  // 获取温度颜色
  const getTemperatureColor = (temp: number): string => {
    if (temp >= 30) return 'text-red-500';
    if (temp >= 20) return 'text-orange-500';
    if (temp >= 10) return 'text-yellow-600';
    if (temp >= 0) return 'text-blue-500';
    return 'text-indigo-500';
  };

  if (API_KEY === 'YOUR_API_KEY_HERE') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700">需要设置 API Key</CardTitle>
            <CardDescription className="text-red-600">
              请在代码中设置您的 OpenWeatherMap API Key
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>1. 打开 src/app/openweather/page.tsx</p>
              <p>2. 找到 API_KEY 变量</p>
              <p>3. 替换 &apos;YOUR_API_KEY_HERE&apos; 为您的实际 API Key</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 标题和搜索 */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
              🌦️ OpenWeatherMap
            </CardTitle>
            <CardDescription className="text-gray-600">
              全球天气数据查询
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索城市名称..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                  {searching && (
                    <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
              </div>

              {/* 搜索建议 */}
              {showSuggestions && suggestions.length > 0 && (
                <Card className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-auto">
                  <CardContent className="p-2">
                    {suggestions.map((city, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center gap-2"
                        onClick={() => selectCity(city)}
                      >
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>
                          {city.name}, {city.state && `${city.state}, `}{city.country}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 错误状态 */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                重新加载
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 加载状态 */}
        {loading && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-lg">
            <CardContent className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-3" />
              <p className="text-gray-600">正在获取天气数据...</p>
            </CardContent>
          </Card>
        )}

        {/* 天气数据 */}
        {weather && !loading && (
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* 主要天气信息 */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-lg md:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <h2 className="text-2xl font-bold text-gray-800">
                        {weather.name}, {weather.country}
                      </h2>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {weather.lat.toFixed(2)}°, {weather.lon.toFixed(2)}°
                    </Badge>
                  </div>
                  <Image 
                    src={getWeatherIconUrl(weather.icon)} 
                    alt={weather.description}
                    width={80}
                    height={80}
                    className="w-20 h-20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Thermometer className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">当前温度</span>
                    </div>
                    <div className={`text-4xl font-bold ${getTemperatureColor(weather.temperature)}`}>
                      {weather.temperature}°C
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      体感 {weather.feelsLike}°C
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">温度范围</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {weather.tempMin}° ~ {weather.tempMax}°
                    </div>
                    <div className="text-sm text-gray-500 mt-1 capitalize">
                      {weather.description}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CloudRain className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">云量</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-800">
                      {weather.cloudiness}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 详细信息 */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-lg">环境指标</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">湿度</span>
                  </div>
                  <span className="font-semibold">{weather.humidity}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-600">气压</span>
                  </div>
                  <span className="font-semibold">{weather.pressure} hPa</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">能见度</span>
                  </div>
                  <span className="font-semibold">{weather.visibility} km</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm text-gray-600">风速</span>
                  </div>
                  <span className="font-semibold">{weather.windSpeed} m/s</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm text-gray-600">风向</span>
                  </div>
                  <span className="font-semibold">
                    {getWindDirection(weather.windDirection)} ({weather.windDirection}°)
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 日出日落 */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-lg">日出日落</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">日出</span>
                  </div>
                  <span className="font-semibold">
                    {formatTime(weather.sunrise, weather.timezone)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm text-gray-600">日落</span>
                  </div>
                  <span className="font-semibold">
                    {formatTime(weather.sunset, weather.timezone)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 