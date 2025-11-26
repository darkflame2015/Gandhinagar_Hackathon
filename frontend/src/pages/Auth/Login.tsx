import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  IconButton,
  InputAdornment,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
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

const benefits = [
  { icon: <Speed fontSize="large" />, text: 'Instant Credit Decision in < 30 minutes' },
  { icon: <TrendingUp fontSize="large" />, text: 'Low Interest Rates from 6.5%' },
  { icon: <Shield fontSize="large" />, text: 'Secure & Transparent Process' },
  { icon: <AccountBalance fontSize="large" />, text: 'Quick Loan Disbursement' },
  { icon: <Agriculture fontSize="large" />, text: 'Tailored for Indian Farmers' },
  { icon: <CheckCircle fontSize="large" />, text: 'No Hidden Charges' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % benefits.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
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
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4, px: 2 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 450, mx: 'auto' }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
               AgriLend
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Login to Your Account
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link href="/register" underline="hover" fontWeight="bold">
                Register here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
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
               AgriLend
            </Typography>
            <Typography variant="h5" sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
              Digital Lending for Modern Farmers
            </Typography>
          </Box>
        </Fade>

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

      <Box sx={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#ffffff', p: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Fade in timeout={1200}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                Welcome Back!
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                Login to access your account
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
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
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    mb: 2,
                    boxShadow: 3,
                    '&:hover': { boxShadow: 6 },
                  }}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              <Box textAlign="center" mt={3}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link href="/register" underline="hover" fontWeight="bold" color="primary">
                    Register here
                  </Link>
                </Typography>
              </Box>

              <Box textAlign="center" mt={4} p={2} bgcolor="#f5f5f5" borderRadius={2}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  Test Credentials
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: test@farmer.com
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Password: Test@123
                </Typography>
              </Box>
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
}