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
  Tooltip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Agriculture as AgricultureIcon,
  ShowChart as ShowChartIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { marketAPI } from '../../services/api';

interface CropPrice {
  crop: string;
  category: string;
  price?: number;
  currentPrice: number;
  previousPrice?: number;
  change?: number;
  trend: string;
  unit: string;
  market?: string;
  volatility: string | number;
  lastUpdated: string;
}

interface MarketData {
  prices: CropPrice[];
  summary?: {
    totalCrops: number;
    avgChange: number;
    upTrend: number;
    downTrend: number;
    stableTrend?: number;
    highVolatility?: number;
    marketSentiment: string;
  };
  source?: string;
}

const MarketPrices: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tabValue, setTabValue] = useState(0);

  const categories = ['All', 'Cereal', 'Cash Crop', 'Oilseed', 'Pulse', 'Vegetable', 'Spice'];

  useEffect(() => {
    fetchMarketData();
  }, [selectedCategory]);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await marketAPI.getPrices([]);
      
      if (response.data.success) {
        setMarketData(response.data.data);
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'UP') {
      return <TrendingUpIcon sx={{ color: '#4caf50' }} />;
    } else if (trend === 'DOWN') {
      return <TrendingDownIcon sx={{ color: '#f44336' }} />;
    }
    return <ShowChartIcon sx={{ color: '#ff9800' }} />;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish':
        return 'success';
      case 'Bearish':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>Loading market prices...</Typography>
      </Box>
    );
  }

  if (!marketData || !marketData.prices) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">No market data available</Alert>
      </Container>
    );
  }

  const chartData = marketData.prices.slice(0, 10).map(item => ({
    crop: item.crop,
    'Current Price': item.price || item.currentPrice,
    'Previous Price': item.previousPrice || (item.price || item.currentPrice) * 0.95
  }));

  const filteredPrices = selectedCategory === 'all' || selectedCategory === 'All'
    ? marketData.prices
    : marketData.prices.filter(p => p.category === selectedCategory);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Market Prices
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdated.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryChange}
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat.toLowerCase()}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Refresh data">
            <IconButton onClick={fetchMarketData} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Market Summary */}
      {marketData.summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AgricultureIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {marketData.summary.totalCrops}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Crops
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ShowChartIcon color="info" sx={{ fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1, color: marketData.summary.avgChange > 0 ? '#4caf50' : '#f44336' }}>
                  {marketData.summary.avgChange > 0 ? '+' : ''}{marketData.summary.avgChange.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg. Change
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 32, color: '#4caf50' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1, color: '#4caf50' }}>
                  {marketData.summary.upTrend}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Uptrend
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingDownIcon sx={{ fontSize: 32, color: '#f44336' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1, color: '#f44336' }}>
                  {marketData.summary.downTrend}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Downtrend
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Chip 
                  label={marketData.summary.marketSentiment}
                  color={getSentimentColor(marketData.summary.marketSentiment) as any}
                  sx={{ fontSize: 14, fontWeight: 'bold', mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Market Sentiment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Price Table" />
          <Tab label="Price Chart" />
          <Tab label="Trends" />
        </Tabs>
      </Box>

      {/* Price Table Tab */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Crop Prices - {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Crop</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Current Price</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Previous Price</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Change</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trend</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Volatility</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPrices.map((item) => {
                    const currentPrice = item.price || item.currentPrice;
                    const previousPrice = item.previousPrice || currentPrice * 0.95;
                    const change = item.change || ((currentPrice - previousPrice) / previousPrice) * 100;
                    
                    return (
                      <TableRow key={item.crop} hover>
                        <TableCell sx={{ fontWeight: 'bold' }}>{item.crop}</TableCell>
                        <TableCell>
                          <Chip label={item.category} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            ₹{currentPrice.toLocaleString()}/{item.unit || 'quintal'}
                          </Typography>
                        </TableCell>
                        <TableCell>₹{previousPrice.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
                            size="small"
                            color={change > 0 ? 'success' : change < 0 ? 'error' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {getTrendIcon(item.trend)}
                            {item.trend}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={typeof item.volatility === 'string' ? item.volatility : 'Low'}
                            size="small"
                            color={
                              (typeof item.volatility === 'string' ? item.volatility : 'Low') === 'High' ? 'error' : 
                              (typeof item.volatility === 'string' ? item.volatility : 'Low') === 'Medium' ? 'warning' : 
                              'default'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Price Chart Tab */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Price Comparison Chart
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="crop" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="Current Price" fill="#4caf50" name="Current Price (₹/quintal)" />
                <Bar dataKey="Previous Price" fill="#2196f3" name="Previous Price (₹/quintal)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Trends Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#4caf50' }}>
                  Top Gainers
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {filteredPrices
                        .filter(p => p.trend === 'UP')
                        .slice(0, 5)
                        .map((item) => {
                          const currentPrice = item.price || item.currentPrice;
                          const previousPrice = item.previousPrice || currentPrice * 0.95;
                          const change = item.change || ((currentPrice - previousPrice) / previousPrice) * 100;
                          
                          return (
                            <TableRow key={item.crop}>
                              <TableCell sx={{ fontWeight: 'bold' }}>{item.crop}</TableCell>
                              <TableCell>₹{currentPrice.toLocaleString()}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={`+${change.toFixed(1)}%`}
                                  size="small"
                                  color="success"
                                  icon={<TrendingUpIcon />}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#f44336' }}>
                  Top Losers
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {filteredPrices
                        .filter(p => p.trend === 'DOWN')
                        .slice(0, 5)
                        .map((item) => {
                          const currentPrice = item.price || item.currentPrice;
                          const previousPrice = item.previousPrice || currentPrice * 0.95;
                          const change = item.change || ((currentPrice - previousPrice) / previousPrice) * 100;
                          
                          return (
                            <TableRow key={item.crop}>
                              <TableCell sx={{ fontWeight: 'bold' }}>{item.crop}</TableCell>
                              <TableCell>₹{currentPrice.toLocaleString()}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={`${change.toFixed(1)}%`}
                                  size="small"
                                  color="error"
                                  icon={<TrendingDownIcon />}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Data Source Info */}
      {marketData.source && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Data Source:</strong> {marketData.source}
            </Typography>
          </Alert>
        </Box>
      )}
    </Container>
  );
};

export default MarketPrices;
