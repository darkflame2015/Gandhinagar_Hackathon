import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import logger from '../utils/logger';
import axios from 'axios';

const router = express.Router();

// OpenWeatherMap API configuration
// Get your free API key at: https://openweathermap.org/api
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Helper function to fetch from OpenWeatherMap
const fetchOpenWeatherData = async (endpoint: string, params: any) => {
  try {
    if (OPENWEATHER_API_KEY === 'demo') {
      // Return mock data for demo mode
      return null;
    }
    
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/${endpoint}`, {
      params: {
        ...params,
        appid: OPENWEATHER_API_KEY,
        units: 'metric' // Celsius
      },
      timeout: 5000
    });
    return response.data;
  } catch (error: any) {
    logger.warn('OpenWeather API error, using fallback data:', error.message);
    return null;
  }
};

// Get weather data for location
router.get('/forecast', authenticate, async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);

    // Try to fetch from OpenWeatherMap
    const liveWeatherData = await fetchOpenWeatherData('weather', { lat, lon });
    const liveForecastData = await fetchOpenWeatherData('forecast', { lat, lon });

    let current, forecast;

    if (liveWeatherData) {
      // Use live data from OpenWeatherMap
      current = {
        temperature: liveWeatherData.main.temp,
        feelsLike: liveWeatherData.main.feels_like,
        humidity: liveWeatherData.main.humidity,
        pressure: liveWeatherData.main.pressure,
        rainfall: liveWeatherData.rain ? liveWeatherData.rain['1h'] || 0 : 0,
        windSpeed: liveWeatherData.wind.speed,
        condition: liveWeatherData.weather[0].main,
        description: liveWeatherData.weather[0].description,
        icon: liveWeatherData.weather[0].icon
      };
    } else {
      // Fallback to simulated data
      current = {
        temperature: 25 + Math.random() * 10,
        feelsLike: 26 + Math.random() * 10,
        humidity: 60 + Math.random() * 30,
        rainfall: Math.random() * 50,
        windSpeed: 10 + Math.random() * 15,
        condition: Math.random() > 0.7 ? 'Rain' : Math.random() > 0.4 ? 'Clouds' : 'Clear',
        description: 'Simulated weather data'
      };
    }

    // Process 15-day forecast
    if (liveForecastData && liveForecastData.list) {
      // OpenWeatherMap free tier gives 5-day forecast in 3-hour steps
      // We'll extrapolate to 15 days
      forecast = [];
      const forecastDays = new Set();
      
      liveForecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000);
        const dayStr = date.toISOString().split('T')[0];
        
        if (!forecastDays.has(dayStr) && forecastDays.size < 5) {
          forecastDays.add(dayStr);
          forecast.push({
            day: forecastDays.size,
            date: dayStr,
            temperature: {
              min: item.main.temp_min,
              max: item.main.temp_max
            },
            rainfall: item.rain ? item.rain['3h'] || 0 : 0,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed,
            condition: item.weather[0].main,
            description: item.weather[0].description
          });
        }
      });

      // Extend to 15 days with simulated data
      for (let i = 5; i < 15; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        forecast.push({
          day: i + 1,
          date: date.toISOString().split('T')[0],
          temperature: {
            min: 20 + Math.random() * 10,
            max: 30 + Math.random() * 10
          },
          rainfall: Math.random() * 100,
          humidity: 60 + Math.random() * 30,
          windSpeed: 10 + Math.random() * 20,
          condition: Math.random() > 0.7 ? 'Rain' : Math.random() > 0.4 ? 'Clouds' : 'Clear',
          description: 'Extended forecast (simulated)'
        });
      }
    } else {
      // Full simulated 15-day forecast
      forecast = Array.from({ length: 15 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
          day: i + 1,
          date: date.toISOString().split('T')[0],
          temperature: {
            min: 20 + Math.random() * 10,
            max: 30 + Math.random() * 10
          },
          rainfall: Math.random() * 100,
          humidity: 60 + Math.random() * 30,
          windSpeed: 10 + Math.random() * 20,
          condition: Math.random() > 0.7 ? 'Rain' : Math.random() > 0.4 ? 'Clouds' : 'Clear',
          description: 'Simulated forecast'
        };
      });
    }
    
    // Calculate risks
    const totalRainfall = forecast.reduce((sum: number, day: any) => sum + day.rainfall, 0);
    const rainyDays = forecast.filter((day: any) => day.rainfall > 10).length;
    const extremeWeatherDays = forecast.filter((day: any) => 
      day.rainfall > 80 || day.temperature.max > 40
    ).length;
    
    const droughtRisk = totalRainfall < 100 ? 0.7 : totalRainfall < 200 ? 0.4 : 0.2;
    const floodRisk = totalRainfall > 500 ? 0.8 : totalRainfall > 300 ? 0.5 : 0.2;
    
    res.json({ 
      success: true, 
      data: { 
        current,
        forecast, 
        droughtRisk,
        floodRisk,
        extremeEvents: extremeWeatherDays,
        summary: {
          location: { latitude: lat, longitude: lon },
          totalRainfall: Math.round(totalRainfall * 10) / 10,
          avgTemperature: Math.round(forecast.reduce((sum: number, day: any) => 
            sum + (day.temperature.min + day.temperature.max) / 2, 0) / 15 * 10) / 10,
          rainyDays,
          extremeWeatherDays
        },
        source: liveWeatherData ? 'OpenWeatherMap' : 'Simulated'
      } 
    });
  } catch (error: any) {
    logger.error('Error fetching weather data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get historical weather data
router.get('/historical', authenticate, async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, days = 30 } = req.query;
    
    const historical = Array.from({ length: Number(days) }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperature: 25 + Math.random() * 15,
      rainfall: Math.random() * 80,
      humidity: 60 + Math.random() * 30
    }));
    
    res.json({ success: true, data: historical });
  } catch (error: any) {
    logger.error('Error fetching historical weather:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
