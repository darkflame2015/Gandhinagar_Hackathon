import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Alert,
  Button,
  CircularProgress,
  Chip,
  LinearProgress,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Agriculture,
  Assessment,
  Cloud,
  Store,
  Shield,
  ArrowForward,
  Refresh,
  Info,
  AttachMoney,
  PendingActions,
} from '@mui/icons-material';
import { loanAPI, farmerAPI, riskAPI, weatherAPI, marketAPI } from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loans, setLoans] = useState<any[]>([]);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Optimized: Fetch all data in parallel
  const fetchData = async () => {
    try {
      // Fetch all data in parallel
      const [loansRes, profileRes, riskRes, weatherRes, marketRes] = await Promise.all([
        loanAPI.getAll().catch(() => ({ data: { data: [] } })),
        farmerAPI.getProfile().catch(() => ({ data: { data: null } })),
        riskAPI.getLatest(user!.farmerId).catch(() => ({ data: { data: null } })),
        weatherAPI.getForecast(23.0225, 72.5714).catch(() => ({ data: { data: null } })),
        marketAPI.getPrices(['Wheat', 'Rice', 'Cotton']).catch(() => ({ data: { data: null } })),
      ]);
      
      setLoans(loansRes.data.data || []);
      setFarmerProfile(profileRes.data.data);
      setRiskData(riskRes.data.data);
      setWeatherData(weatherRes.data.data);
      setMarketData(marketRes.data.data);
      
    } catch (error) {
      // Silent error - data will show empty states
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, subtitle, onClick }: any) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography color="textSecondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{ mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box 
            sx={{ 
              color, 
              bgcolor: `${color}15`,
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, icon, onClick, color }: any) => (
    <Card 
      sx={{ 
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          bgcolor: `${color}10`,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ color, mb: 1 }}>
          {icon}
        </Box>
        <Typography variant="body2" fontWeight="medium">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const totalLoanAmount = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
  const activeLoanAmount = loans
    .filter(l => l.status === 'ACTIVE' || l.status === 'DISBURSED')
    .reduce((sum, loan) => sum + (loan.amount || 0), 0);

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header Section */}
      <Box 
        display="flex" 
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent="space-between" 
        alignItems={isMobile ? 'flex-start' : 'center'}
        mb={3}
        gap={2}
      >
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} gutterBottom fontWeight="bold">
            Welcome back, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>
        <IconButton 
          onClick={handleRefresh} 
          disabled={refreshing}
          title="Refresh Dashboard"
        >
          <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </IconButton>
      </Box>

      {/* Profile Verification Alert */}
      {farmerProfile && !farmerProfile.isVerified && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/profile')}>
              Complete Now
            </Button>
          }
        >
          Please complete your KYC verification to unlock all features
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Loans"
            value={loans.length}
            subtitle={`₹${totalLoanAmount.toLocaleString('en-IN')}`}
            icon={<AccountBalance fontSize="large" />}
            color={theme.palette.primary.main}
            onClick={() => navigate('/loans')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Active Loans"
            value={loans.filter(l => l.status === 'ACTIVE' || l.status === 'DISBURSED').length}
            subtitle={`₹${activeLoanAmount.toLocaleString('en-IN')}`}
            icon={<TrendingUp fontSize="large" />}
            color={theme.palette.success.main}
            onClick={() => navigate('/loans')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Pending Approval"
            value={loans.filter(l => l.status === 'PENDING').length}
            subtitle="Awaiting decision"
            icon={<PendingActions fontSize="large" />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Credit Score"
            value={farmerProfile?.creditScore || 'N/A'}
            subtitle="View risk analysis"
            icon={<Assessment fontSize="large" />}
            color={theme.palette.info.main}
            onClick={() => navigate('/risk')}
          />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={4} md={2}>
                <QuickActionCard
                  title="Apply Loan"
                  icon={<AttachMoney fontSize="large" />}
                  color={theme.palette.primary.main}
                  onClick={() => navigate('/loans/apply')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <QuickActionCard
                  title="Risk Assessment"
                  icon={<Assessment fontSize="large" />}
                  color={theme.palette.error.main}
                  onClick={() => navigate('/risk')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <QuickActionCard
                  title="Weather"
                  icon={<Cloud fontSize="large" />}
                  color={theme.palette.info.main}
                  onClick={() => navigate('/weather')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <QuickActionCard
                  title="Market Prices"
                  icon={<Store fontSize="large" />}
                  color={theme.palette.success.main}
                  onClick={() => navigate('/market')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <QuickActionCard
                  title="Insurance"
                  icon={<Shield fontSize="large" />}
                  color={theme.palette.warning.main}
                  onClick={() => navigate('/insurance')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <QuickActionCard
                  title="Ecosystem"
                  icon={<Agriculture fontSize="large" />}
                  color={theme.palette.secondary.main}
                  onClick={() => navigate('/ecosystem')}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Risk Assessment Card */}
        {riskData && (
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', bgcolor: riskData.riskCategory === 'HIGH' ? '#fff3e0' : riskData.riskCategory === 'MEDIUM' ? '#e3f2fd' : '#e8f5e9' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Risk Assessment
                  </Typography>
                  <Assessment sx={{ color: riskData.riskCategory === 'HIGH' ? 'error.main' : riskData.riskCategory === 'MEDIUM' ? 'warning.main' : 'success.main' }} />
                </Box>
                <Box textAlign="center" py={2}>
                  <Typography variant="h2" fontWeight="bold" color={riskData.riskCategory === 'HIGH' ? 'error.main' : riskData.riskCategory === 'MEDIUM' ? 'warning.main' : 'success.main'}>
                    {Math.round(riskData.overallRiskScore)}
                  </Typography>
                  <Chip 
                    label={riskData.riskCategory}
                    color={riskData.riskCategory === 'HIGH' ? 'error' : riskData.riskCategory === 'MEDIUM' ? 'warning' : 'success'}
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption" display="block" color="textSecondary" mt={1}>
                    Based on 15-day forecast
                  </Typography>
                </Box>
                <Button fullWidth variant="outlined" size="small" onClick={() => navigate('/risk')} sx={{ mt: 2 }}>
                  View Detailed Analysis
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Weather Card */}
        {weatherData && (
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Weather Forecast
                  </Typography>
                  <Cloud color="info" />
                </Box>
                <Box textAlign="center" py={2}>
                  <Typography variant="h2" fontWeight="bold" color="info.main">
                    {Math.round(weatherData.current?.temperature || 28)}°C
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mt={1}>
                    Humidity: {Math.round(weatherData.current?.humidity || 65)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Rainfall: {Math.round(weatherData.current?.rainfall || 0)}mm
                  </Typography>
                  {weatherData.droughtRisk > 0.6 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      High drought risk detected
                    </Alert>
                  )}
                </Box>
                <Button fullWidth variant="outlined" size="small" onClick={() => navigate('/weather')} sx={{ mt: 2 }}>
                  7-Day Forecast
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Market Prices Card */}
        {marketData && marketData.length > 0 && (
          <Grid item xs={12} md={12} lg={4}>
            <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Market Prices
                  </Typography>
                  <Store color="success" />
                </Box>
                <Box>
                  {marketData.slice(0, 3).map((item: any, index: number) => (
                    <Box key={index} display="flex" justifyContent="space-between" alignItems="center" py={1} borderBottom={index < 2 ? '1px solid #ddd' : 'none'}>
                      <Typography variant="body2" fontWeight="medium">
                        {item.crop}
                      </Typography>
                      <Box textAlign="right">
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          ₹{item.price}/quintal
                        </Typography>
                        {item.change && (
                          <Typography variant="caption" color={item.change > 0 ? 'success.main' : 'error.main'}>
                            {item.change > 0 ? '+' : ''}{item.change}%
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Button fullWidth variant="outlined" size="small" onClick={() => navigate('/market')} sx={{ mt: 2 }}>
                  View All Prices
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Loans */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Recent Loans
              </Typography>
              <Button 
                endIcon={<ArrowForward />} 
                onClick={() => navigate('/loans')}
                size="small"
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {loans.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Agriculture sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="textSecondary" gutterBottom>
                  No loans yet
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/loans/apply')}
                >
                  Apply for First Loan
                </Button>
              </Box>
            ) : (
              loans.slice(0, 5).map((loan) => (
                <Card
                  key={loan.loanId}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateX(4px)',
                    },
                  }}
                  onClick={() => navigate(`/loans/${loan.loanId}`)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                      <Box flex={1} minWidth={200}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {loan.loanType || 'Agricultural Loan'}
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          ₹{loan.amount?.toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {loan.purpose}
                        </Typography>
                        {loan.tenure && (
                          <Typography variant="caption" color="textSecondary">
                            Tenure: {loan.tenure} months
                          </Typography>
                        )}
                      </Box>
                      <Box display="flex" flexDirection="column" gap={1} alignItems="flex-end">
                        <Chip
                          label={loan.status}
                          size="small"
                          color={
                            loan.status === 'APPROVED' || loan.status === 'DISBURSED' ? 'success' :
                            loan.status === 'REJECTED' ? 'error' :
                            loan.status === 'PENDING' ? 'warning' : 'default'
                          }
                        />
                        {loan.creditDecision && (
                          <Chip
                            label={`Risk: ${loan.creditDecision.riskLevel}`}
                            size="small"
                            variant="outlined"
                            color={
                              loan.creditDecision.riskLevel === 'LOW' ? 'success' :
                              loan.creditDecision.riskLevel === 'MEDIUM' ? 'warning' : 'error'
                            }
                          />
                        )}
                      </Box>
                    </Box>
                    {loan.status === 'DISBURSED' && loan.repaymentSchedule && (
                      <Box mt={2}>
                        <Typography variant="caption" color="textSecondary">
                          Repayment Progress
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={
                            ((loan.totalPaid || 0) / loan.amount) * 100
                          }
                          sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          ₹{(loan.totalPaid || 0).toLocaleString('en-IN')} / ₹{loan.amount.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </Paper>
        </Grid>

        {/* Quick Stats & Info */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Info
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box textAlign="center" py={2}>
              <Info sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="textSecondary" gutterBottom>
                All systems operational
              </Typography>
              {farmerProfile && (
                <Box mt={3}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Profile Status:</strong>
                  </Typography>
                  <Chip 
                    label={farmerProfile.isVerified ? "Verified" : "Pending Verification"}
                    color={farmerProfile.isVerified ? "success" : "warning"}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                  {farmerProfile.landDetails?.totalArea && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                      <strong>Land Area:</strong> {farmerProfile.landDetails.totalArea} acres
                    </Typography>
                  )}
                  {farmerProfile.landDetails?.crops?.length > 0 && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      <strong>Crops:</strong> {farmerProfile.landDetails.crops.join(', ')}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
}
