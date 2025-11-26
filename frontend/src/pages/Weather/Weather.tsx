import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Cloud as CloudIcon,
  WbSunny as SunnyIcon,
  Umbrella as RainIcon,
  Air as WindIcon,
  Thermostat as ThermostatIcon,
  Water as WaterIcon,
  Opacity as HumidityIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { weatherAPI } from '../../services/api';

interface WeatherData {
  current: {
    temperature: number;
    feelsLike?: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    condition: string;
    description?: string;
    pressure?: number;
  };
  forecast: Array<{
    day: number;
    date: string;
    temperature: { min: number; max: number };
    rainfall: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    description?: string;
  }>;
  droughtRisk: number;
  floodRisk: number;
  extremeEvents: number;
  summary?: {
    location: { latitude: number; longitude: number };
    totalRainfall: number;
    avgTemperature: number;
    rainyDays: number;
    extremeWeatherDays: number;
  };
}

const Weather: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Default location: Gandhinagar, Gujarat
  const latitude = 23.0225;
  const longitude = 72.5714;

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await weatherAPI.getForecast(latitude, longitude);
      
      if (response.data.success) {
        setWeatherData(response.data.data);
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain') || cond === 'rainy') {
      return <RainIcon sx={{ fontSize: 48, color: '#2196f3' }} />;
    } else if (cond.includes('cloud')) {
      return <CloudIcon sx={{ fontSize: 48, color: '#90a4ae' }} />;
    } else {
      return <SunnyIcon sx={{ fontSize: 48, color: '#ff9800' }} />;
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 0.3) return 'success';
    if (risk < 0.5) return 'warning';
    return 'error';
  };

  const getRiskLabel = (risk: number) => {
    if (risk < 0.3) return 'Low Risk';
    if (risk < 0.5) return 'Moderate Risk';
    if (risk < 0.7) return 'High Risk';
    return 'Critical Risk';
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>Loading weather forecast...</Typography>
      </Box>
    );
  }

  if (!weatherData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">No weather data available</Alert>
      </Container>
    );
  }

  const chartData = weatherData.forecast.slice(0, 10).map(day => ({
    date: new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    'Max Temp (°C)': day.temperature.max,
    'Min Temp (°C)': day.temperature.min,
    'Rainfall (mm)': day.rainfall,
    'Humidity (%)': day.humidity
  }));

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Weather Forecast
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdated.toLocaleString()}
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton onClick={fetchWeatherData} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Current Weather */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Current Weather - Gandhinagar, Gujarat
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', color: 'white' }}>
                    {getWeatherIcon(weatherData.current.condition)}
                    <Typography variant="h3" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {weatherData.current.temperature.toFixed(1)}°C
                    </Typography>
                    <Typography variant="h6">
                      {weatherData.current.condition}
                    </Typography>
                    {weatherData.current.description && (
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {weatherData.current.description}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'white', mb: 1 }}>
                        <ThermostatIcon sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>Feels Like</Typography>
                          <Typography variant="h6">{weatherData.current.feelsLike?.toFixed(1) || weatherData.current.temperature.toFixed(1)}°C</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'white', mb: 1 }}>
                        <HumidityIcon sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>Humidity</Typography>
                          <Typography variant="h6">{weatherData.current.humidity.toFixed(0)}%</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'white', mb: 1 }}>
                        <WaterIcon sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>Rainfall</Typography>
                          <Typography variant="h6">{weatherData.current.rainfall.toFixed(1)} mm</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'white', mb: 1 }}>
                        <WindIcon sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>Wind Speed</Typography>
                          <Typography variant="h6">{weatherData.current.windSpeed.toFixed(1)} km/h</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: getRiskColor(weatherData.droughtRisk) === 'error' ? '#ffebee' : getRiskColor(weatherData.droughtRisk) === 'warning' ? '#fff3e0' : '#e8f5e9' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Drought Risk
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: getRiskColor(weatherData.droughtRisk) === 'error' ? '#d32f2f' : getRiskColor(weatherData.droughtRisk) === 'warning' ? '#f57c00' : '#388e3c' }}>
                      {(weatherData.droughtRisk * 100).toFixed(0)}%
                    </Typography>
                    <Chip 
                      label={getRiskLabel(weatherData.droughtRisk)} 
                      color={getRiskColor(weatherData.droughtRisk) as any}
                      size="small"
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={weatherData.droughtRisk * 100}
                    color={getRiskColor(weatherData.droughtRisk) as any}
                    sx={{ mt: 2, height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: getRiskColor(weatherData.floodRisk) === 'error' ? '#ffebee' : getRiskColor(weatherData.floodRisk) === 'warning' ? '#fff3e0' : '#e8f5e9' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Flood Risk
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: getRiskColor(weatherData.floodRisk) === 'error' ? '#d32f2f' : getRiskColor(weatherData.floodRisk) === 'warning' ? '#f57c00' : '#388e3c' }}>
                      {(weatherData.floodRisk * 100).toFixed(0)}%
                    </Typography>
                    <Chip 
                      label={getRiskLabel(weatherData.floodRisk)} 
                      color={getRiskColor(weatherData.floodRisk) as any}
                      size="small"
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={weatherData.floodRisk * 100}
                    color={getRiskColor(weatherData.floodRisk) as any}
                    sx={{ mt: 2, height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Weather Summary Stats */}
      {weatherData.summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <WaterIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {weatherData.summary.totalRainfall} mm
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Rainfall (15 days)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ThermostatIcon color="warning" sx={{ fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {weatherData.summary.avgTemperature}°C
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Temperature
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <RainIcon color="info" sx={{ fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {weatherData.summary.rainyDays}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rainy Days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <WarningIcon color="error" sx={{ fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {weatherData.summary.extremeWeatherDays}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Extreme Weather Days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Temperature & Rainfall Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            10-Day Temperature & Rainfall Forecast
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="Max Temp (°C)" 
                stackId="1" 
                stroke="#ff9800" 
                fill="#ff9800" 
                fillOpacity={0.6}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="Min Temp (°C)" 
                stackId="1" 
                stroke="#2196f3" 
                fill="#2196f3" 
                fillOpacity={0.6}
              />
              <Bar 
                yAxisId="right"
                dataKey="Rainfall (mm)" 
                fill="#4caf50" 
                opacity={0.7}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Forecast Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            15-Day Detailed Forecast
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Condition</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Temperature</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rainfall</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Humidity</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Wind</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weatherData.forecast.map((day, index) => (
                  <TableRow 
                    key={day.day} 
                    hover
                    sx={{ bgcolor: index === 0 ? 'action.hover' : 'inherit' }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
                        {new Date(day.date).toLocaleDateString('en-IN', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        {index === 0 && <Chip label="Today" size="small" color="primary" sx={{ ml: 1 }} />}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getWeatherIcon(day.condition)}
                        <Box>
                          <Typography variant="body2">{day.condition}</Typography>
                          {day.description && (
                            <Typography variant="caption" color="text.secondary">
                              {day.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {day.temperature.max.toFixed(1)}° / {day.temperature.min.toFixed(1)}°C
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${day.rainfall.toFixed(1)} mm`}
                        size="small"
                        color={day.rainfall > 50 ? 'error' : day.rainfall > 20 ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{day.humidity.toFixed(0)}%</TableCell>
                    <TableCell>{day.windSpeed.toFixed(1)} km/h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Weather Alerts */}
      {(weatherData.extremeEvents > 0 || weatherData.droughtRisk > 0.7 || weatherData.floodRisk > 0.7) && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="warning" icon={<WarningIcon />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Weather Alerts
            </Typography>
            {weatherData.extremeEvents > 0 && (
              <Typography variant="body2">
                • {weatherData.extremeEvents} extreme weather day(s) expected in the next 15 days
              </Typography>
            )}
            {weatherData.droughtRisk > 0.7 && (
              <Typography variant="body2">
                • High drought risk detected - Consider irrigation planning
              </Typography>
            )}
            {weatherData.floodRisk > 0.7 && (
              <Typography variant="body2">
                • High flood risk detected - Ensure proper drainage systems
              </Typography>
            )}
          </Alert>
        </Box>
      )}
    </Container>
  );
};

export default Weather;
