import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Cloud as CloudIcon,
  Thermostat as ThermostatIcon,
  Water as WaterIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { weatherAPI, riskAPI, marketAPI } from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface ForecastDay {
  day: number;
  date: string;
  temperature: { min: number; max: number };
  rainfall: number;
  humidity: number;
  windSpeed: number;
  condition: string;
}

interface RiskForecast {
  day: number;
  riskScore: number;
  category: string;
  factors: { weather: number; market: number; satellite: number };
}

interface MarketForecast {
  crop: string;
  price?: number;
  currentPrice: number;
  previousPrice?: number;
  change?: number;
  predictedChange: number;
  trend: string;
  volatility?: string;
}

const ForecastAnalysis: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [weatherForecast, setWeatherForecast] = useState<ForecastDay[]>([]);
  const [riskForecast, setRiskForecast] = useState<RiskForecast[]>([]);
  const [marketForecast, setMarketForecast] = useState<MarketForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const profile = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    fetchForecastData();
  }, []);

  const fetchForecastData = async () => {
    try {
      setLoading(true);
      
      // Default location (Gandhinagar, Gujarat)
      const latitude = 23.0225;
      const longitude = 72.5714;

      const [weatherRes, riskRes, marketRes] = await Promise.all([
        weatherAPI.getForecast(latitude, longitude),
        riskAPI.getLatest(profile?.farmerId || 'FARMER001'),
        marketAPI.getPrices(['Wheat', 'Rice', 'Cotton', 'Soybean'])
      ]);

      if (weatherRes.data.success) {
        setWeatherForecast(weatherRes.data.data.forecast);
      }

      if (riskRes.data.success && riskRes.data.data.forwardPredictions) {
        setRiskForecast(riskRes.data.data.forwardPredictions);
      }

      if (marketRes.data.success) {
        setMarketForecast(marketRes.data.data.prices);
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load forecast data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'rain':
      case 'rainy':
        return <WaterIcon color="primary" />;
      case 'clear':
      case 'sunny':
        return <ThermostatIcon color="warning" />;
      default:
        return <CloudIcon color="action" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return '#4caf50';
    if (score < 50) return '#ff9800';
    if (score < 70) return '#ff5722';
    return '#f44336';
  };

  const getRiskCategory = (score: number) => {
    if (score < 30) return 'Low Risk';
    if (score < 50) return 'Moderate Risk';
    if (score < 70) return 'High Risk';
    return 'Critical Risk';
  };

  // Chart data transformations
  const weatherChartData = weatherForecast.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    'Max Temp': day.temperature.max,
    'Min Temp': day.temperature.min,
    'Rainfall': day.rainfall,
    'Humidity': day.humidity
  }));

  const riskChartData = riskForecast.map(day => ({
    date: `Day ${day.day}`,
    'Risk Score': day.riskScore,
    'Weather Risk': day.factors.weather * 100,
    'Market Risk': day.factors.market * 100,
    'Satellite Risk': day.factors.satellite * 100
  }));

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>Loading 15-day forecast analysis...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        15-Day Forecast Analysis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Weather Forecast" />
          <Tab label="Risk Analysis" />
          <Tab label="Market Trends" />
          <Tab label="Combined View" />
        </Tabs>
      </Box>

      {/* Weather Forecast Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Temperature & Rainfall Forecast</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weatherChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="Max Temp" 
                      stackId="1" 
                      stroke="#ff9800" 
                      fill="#ff9800" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="Min Temp" 
                      stackId="1" 
                      stroke="#2196f3" 
                      fill="#2196f3" 
                      fillOpacity={0.6}
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="Rainfall" 
                      fill="#4caf50" 
                      opacity={0.7}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Detailed Weather Table</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'primary.main' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Condition</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Temperature (°C)</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rainfall (mm)</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Humidity (%)</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Wind (km/h)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {weatherForecast.map((day) => (
                        <TableRow key={day.day} hover>
                          <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getWeatherIcon(day.condition)}
                              {day.condition}
                            </Box>
                          </TableCell>
                          <TableCell>{day.temperature.min}° - {day.temperature.max}°</TableCell>
                          <TableCell>
                            <Chip 
                              label={`${day.rainfall.toFixed(1)} mm`}
                              size="small"
                              color={day.rainfall > 50 ? 'error' : day.rainfall > 20 ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{day.humidity.toFixed(0)}%</TableCell>
                          <TableCell>{day.windSpeed.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Risk Analysis Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>15-Day Risk Trend</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={riskChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Risk Score" 
                      stroke="#f44336" 
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Weather Risk" 
                      stroke="#2196f3" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Market Risk" 
                      stroke="#ff9800" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Satellite Risk" 
                      stroke="#4caf50" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Risk Breakdown by Day</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'error.main' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Day</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Risk Score</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Weather</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Market</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Satellite</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {riskForecast.map((day) => (
                        <TableRow key={day.day} hover>
                          <TableCell sx={{ fontWeight: 'bold' }}>Day {day.day}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box 
                                sx={{ 
                                  width: 60, 
                                  height: 8, 
                                  bgcolor: getRiskColor(day.riskScore),
                                  borderRadius: 1
                                }}
                              />
                              {day.riskScore.toFixed(1)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getRiskCategory(day.riskScore)}
                              size="small"
                              sx={{ bgcolor: getRiskColor(day.riskScore), color: 'white' }}
                            />
                          </TableCell>
                          <TableCell>{(day.factors.weather * 100).toFixed(1)}%</TableCell>
                          <TableCell>{(day.factors.market * 100).toFixed(1)}%</TableCell>
                          <TableCell>{(day.factors.satellite * 100).toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Market Trends Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Crop Price Forecast</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marketForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="crop" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="price" fill="#4caf50" name="Current Price (₹/quintal)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Market Price Trends</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'success.main' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Crop</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Current Price</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Change</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trend</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Volatility</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {marketForecast.map((item) => (
                        <TableRow key={item.crop} hover>
                          <TableCell sx={{ fontWeight: 'bold' }}>{item.crop}</TableCell>
                          <TableCell>₹{item.price?.toLocaleString() || item.currentPrice?.toLocaleString()}/quintal</TableCell>
                          <TableCell>
                            <Chip 
                              label={`${item.change || item.predictedChange}%`}
                              size="small"
                              color={(item.change || item.predictedChange || 0) > 0 ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {item.trend === 'UP' ? (
                                <TrendingUpIcon color="success" />
                              ) : (
                                <TrendingDownIcon color="error" />
                              )}
                              {item.trend}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={item.volatility || 'Low'}
                              size="small"
                              color={item.volatility === 'High' ? 'error' : item.volatility === 'Medium' ? 'warning' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Combined View Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Weather Summary</Typography>
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    Total Rainfall (15 days): <strong>{weatherForecast.reduce((sum, d) => sum + d.rainfall, 0).toFixed(1)} mm</strong>
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Avg Temperature: <strong>
                      {(weatherForecast.reduce((sum, d) => sum + (d.temperature.min + d.temperature.max) / 2, 0) / 15).toFixed(1)}°C
                    </strong>
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Rainy Days: <strong>{weatherForecast.filter(d => d.rainfall > 10).length}</strong>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Risk Summary</Typography>
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    Average Risk Score: <strong style={{ color: getRiskColor(riskForecast.reduce((sum, r) => sum + r.riskScore, 0) / 15) }}>
                      {(riskForecast.reduce((sum, r) => sum + r.riskScore, 0) / 15).toFixed(1)}
                    </strong>
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    High Risk Days: <strong>{riskForecast.filter(r => r.riskScore >= 50).length}</strong>
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Critical Days: <strong>{riskForecast.filter(r => r.riskScore >= 70).length}</strong>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" /> Alerts & Recommendations
                </Typography>
                <Box sx={{ p: 2 }}>
                  {weatherForecast.reduce((sum, d) => sum + d.rainfall, 0) > 300 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Heavy rainfall expected. Consider flood insurance and drainage preparations.
                    </Alert>
                  )}
                  {weatherForecast.reduce((sum, d) => sum + d.rainfall, 0) < 100 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Low rainfall forecast. Prepare irrigation systems for drought conditions.
                    </Alert>
                  )}
                  {riskForecast.filter(r => r.riskScore >= 70).length > 3 && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Multiple high-risk days ahead. Review crop protection measures.
                    </Alert>
                  )}
                  {marketForecast.filter(m => m.trend === 'DOWN').length > marketForecast.length / 2 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Market showing bearish trend. Consider storage options or crop insurance.
                    </Alert>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ForecastAnalysis;
