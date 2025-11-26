import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Link,
  Grid,
  MenuItem,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  TrendingUp,
  Speed,
  Shield,
  AccountBalance,
  Agriculture,
} from '@mui/icons-material';
import { authAPI } from '../../services/api';
import { loginSuccess } from '../../store/slices/authSlice';

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];
const soilTypes = ['Alluvial', 'Black', 'Red', 'Laterite', 'Desert', 'Mountain', 'Saline', 'Peaty', 'Forest'];
const irrigationTypes = ['Drip', 'Sprinkler', 'Canal', 'Well', 'Rainfed', 'Tube Well', 'Tank'];

const benefits = [
  { icon: <Speed fontSize="large" />, text: 'Instant Credit Decision in < 30 minutes' },
  { icon: <TrendingUp fontSize="large" />, text: 'Low Interest Rates from 6.5%' },
  { icon: <Shield fontSize="large" />, text: 'Secure & Transparent Process' },
  { icon: <AccountBalance fontSize="large" />, text: 'Quick Loan Disbursement' },
  { icon: <Agriculture fontSize="large" />, text: 'Tailored for Indian Farmers' },
  { icon: <CheckCircle fontSize="large" />, text: 'No Hidden Charges' },
];

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    village: '',
    district: '',
    state: 'Gujarat',
    pincode: '',
    totalArea: '',
    soilType: '',
    irrigationType: '',
    crops: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % benefits.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const requestData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: {
          village: formData.village,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
        },
        landDetails: {
          totalArea: parseFloat(formData.totalArea),
          soilType: formData.soilType,
          irrigationType: formData.irrigationType,
          crops: formData.crops.split(',').map(c => c.trim()),
        },
      };

      const response = await authAPI.register(requestData);
      if (response.data.success) {
        dispatch(loginSuccess({
          token: response.data.data.token,
          user: {
            farmerId: response.data.data.farmerId,
            name: response.data.data.name,
            email: response.data.data.email,
          },
        }));
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box textAlign="center" mb={3}>
              <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
                🌾 AgriLend
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Register as a Farmer
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Address Details</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Village"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="District"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  >
                    {states.map((state) => (
                      <MenuItem key={state} value={state}>{state}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Land Details</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Total Area (acres)"
                    name="totalArea"
                    type="number"
                    value={formData.totalArea}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    label="Soil Type"
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    required
                  >
                    {soilTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    label="Irrigation Type"
                    name="irrigationType"
                    value={formData.irrigationType}
                    onChange={handleChange}
                    required
                  >
                    {irrigationTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Crops (comma-separated)"
                    name="crops"
                    value={formData.crops}
                    onChange={handleChange}
                    placeholder="e.g., Wheat, Rice, Cotton"
                    required
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </form>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link href="/login" underline="hover" fontWeight="bold">
                  Login here
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* Left Side - Benefits with Background */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.95) 0%, rgba(56, 142, 60, 0.95) 100%), url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          p: 6,
        }}
      >
        <Fade in timeout={1000}>
          <Box textAlign="center" mb={6}>
            <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              🌾 AgriLend
            </Typography>
            <Typography variant="h5" sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
              Digital Lending for Modern Farmers
            </Typography>
          </Box>
        </Fade>

        {/* Animated Benefits */}
        <Box sx={{ minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: 600 }}>
          {benefits.map((benefit, index) => (
            <Grow key={index} in={currentBenefit === index} timeout={800} unmountOnExit>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  p: 4,
                  borderRadius: 3,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ color: 'white' }}>{benefit.icon}</Box>
                <Typography variant="h5" fontWeight="medium" sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
                  {benefit.text}
                </Typography>
              </Box>
            </Grow>
          ))}
        </Box>

        {/* Progress Dots */}
        <Box sx={{ display: 'flex', gap: 1, mt: 6 }}>
          {benefits.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: currentBenefit === index ? 'white' : 'rgba(255, 255, 255, 0.4)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Right Side - Registration Form */}
      <Box sx={{ width: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#ffffff', p: 4, overflow: 'auto' }}>
        <Box sx={{ width: '100%', maxWidth: 550 }}>
          <Fade in timeout={1200}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                Create Account
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Register as a farmer to get started
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary" mt={1}>
                      Address Details
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Village"
                      name="village"
                      value={formData.village}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="District"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      size="small"
                    >
                      {states.map((state) => (
                        <MenuItem key={state} value={state}>{state}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary" mt={1}>
                      Land Details
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Total Area (acres)"
                      name="totalArea"
                      type="number"
                      value={formData.totalArea}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      select
                      label="Soil Type"
                      name="soilType"
                      value={formData.soilType}
                      onChange={handleChange}
                      required
                      size="small"
                    >
                      {soilTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      select
                      label="Irrigation Type"
                      name="irrigationType"
                      value={formData.irrigationType}
                      onChange={handleChange}
                      required
                      size="small"
                    >
                      {irrigationTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Crops (comma-separated)"
                      name="crops"
                      value={formData.crops}
                      onChange={handleChange}
                      placeholder="e.g., Wheat, Rice, Cotton"
                      required
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    boxShadow: 3,
                    '&:hover': { boxShadow: 6 },
                  }}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </form>

              <Box textAlign="center" mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link href="/login" underline="hover" fontWeight="bold" color="primary">
                    Login here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
}
