import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { riskAPI, weatherAPI, marketAPI } from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export default function RiskDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [assessment, setAssessment] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      const [assessmentRes, weatherRes, marketRes] = await Promise.all([
        riskAPI.getLatest(user!.farmerId),
        weatherAPI.getForecast(23.0225, 72.5714),
        marketAPI.getPrices(['Wheat', 'Rice', 'Cotton']),
      ]);
      
      setAssessment(assessmentRes.data.data);
      setWeather(weatherRes.data.data);
      setMarket(marketRes.data.data);
    } catch (error) {
      console.error('Error fetching risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewAssessment = async () => {
    setLoading(true);
    try {
      const response = await riskAPI.assess(user!.farmerId);
      setAssessment(response.data.data);
      await fetchRiskData();
    } catch (error) {
      console.error('Error generating assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'CRITICAL': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>Loading Risk Dashboard...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!assessment) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          15-Day Forward Risk Dashboard
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          No risk assessment available. Generate one to see your 15-day forward risk prediction.
        </Alert>
        <Button variant="contained" onClick={generateNewAssessment}>
          Generate Risk Assessment
        </Button>
      </Box>
    );
  }

  // Prepare data for charts
  const forwardRiskData = assessment.forwardRisk || [];
  const radarData = [
    { subject: 'Weather', value: assessment.weatherData?.droughtRisk * 100 || 0 },
    { subject: 'Market', value: assessment.marketData?.priceVolatility * 100 || 0 },
    { subject: 'Crop Health', value: (1 - assessment.satelliteData?.vegetationIndex) * 100 || 0 },
    { subject: 'Digital Score', value: assessment.alternativeData?.digitalFootprint * 100 || 0 },
    { subject: 'AgriStack', value: assessment.alternativeData?.agriStackScore * 100 || 0 },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            15-Day Forward Risk Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Real-time risk assessment using weather, satellite & market data
          </Typography>
        </Box>
        <Button variant="contained" onClick={generateNewAssessment}>
          Refresh Assessment
        </Button>
      </Box>

      {/* Overall Risk Score */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Overall Risk Score</Typography>
              <Typography variant="h2" fontWeight="bold">
                {assessment.overallRiskScore}
              </Typography>
              <Chip
                label={assessment.riskCategory}
                color={getRiskColor(assessment.riskCategory)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Weather Risk</Typography>
              <Typography variant="body2" color="textSecondary">
                Drought Risk: {Math.round((assessment.weatherData?.droughtRisk || 0) * 100)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Flood Risk: {Math.round((assessment.weatherData?.floodRisk || 0) * 100)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Rainfall: {assessment.weatherData?.rainfall?.toFixed(1) || 0} mm
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Crop Health (Satellite)</Typography>
              <Typography variant="body2" color="textSecondary">
                NDVI: {assessment.satelliteData?.vegetationIndex?.toFixed(2) || 'N/A'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Soil Moisture: {Math.round((assessment.satelliteData?.soilMoisture || 0) * 100)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Status: {assessment.satelliteData?.cropHealth || 'Unknown'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 15-Day Forward Risk Prediction */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              15-Day Forward Risk Prediction
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forwardRiskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="riskScore" stroke="#8884d8" name="Overall Risk" strokeWidth={2} />
                <Line type="monotone" dataKey="factors.weather" stroke="#82ca9d" name="Weather Risk" />
                <Line type="monotone" dataKey="factors.market" stroke="#ffc658" name="Market Risk" />
                <Line type="monotone" dataKey="factors.satellite" stroke="#ff7c7c" name="Satellite Risk" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Risk Factor Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar name="Risk Factors" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Mitigation Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Automated Mitigation Actions
            </Typography>
            {assessment.mitigationActions?.map((action: any, index: number) => (
              <Alert
                key={index}
                severity={action.priority === 'CRITICAL' ? 'error' : action.priority === 'HIGH' ? 'warning' : 'info'}
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {action.action}
                </Typography>
                <Typography variant="caption">
                  Priority: {action.priority} | {action.automated ? 'Automated' : 'Manual'} | Status: {action.status}
                </Typography>
              </Alert>
            ))}
          </Paper>
        </Grid>

        {/* Insurance Triggers */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Insurance Triggers
            </Typography>
            {assessment.insuranceTriggers?.filter((t: any) => t.triggered).length > 0 ? (
              assessment.insuranceTriggers.filter((t: any) => t.triggered).map((trigger: any, index: number) => (
                <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {trigger.triggerType} Triggered
                  </Typography>
                  <Typography variant="caption">
                    Threshold: {trigger.threshold} | Actual: {trigger.actualValue?.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Action: {trigger.action}
                  </Typography>
                </Alert>
              ))
            ) : (
              <Typography color="textSecondary">No insurance triggers at this time</Typography>
            )}
          </Paper>
        </Grid>

        {/* Weather Forecast */}
        {weather && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                15-Day Weather Forecast
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weather.forecast?.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rainfall" fill="#8884d8" name="Rainfall (mm)" />
                  <Bar dataKey="temperature.max" fill="#ff7c7c" name="Max Temp (°C)" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Market Signals */}
        {market && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Market Signals
              </Typography>
              <Grid container spacing={2}>
                {market.map((crop: any, index: number) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{crop.crop}</Typography>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          ₹{crop.currentPrice?.toFixed(2)}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={crop.trend}
                            color={crop.trend === 'UP' ? 'success' : 'error'}
                            size="small"
                          />
                          <Typography variant="caption" color="textSecondary">
                            {crop.change > 0 ? '+' : ''}{crop.change?.toFixed(2)}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
