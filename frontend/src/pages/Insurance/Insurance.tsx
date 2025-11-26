import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Agriculture as AgricultureIcon,
  Cloud as CloudIcon,
  Pets as PetsIcon,
  Shield as ShieldIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { insuranceAPI } from '../../services/api';

interface InsuranceProduct {
  id: string;
  name: string;
  type: string;
  coverage: string;
  premium: number;
  sumInsured: number;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

interface ActivePolicy {
  id: string;
  productName: string;
  policyNumber: string;
  startDate: string;
  endDate: string;
  status: string;
  premium: number;
  coverage: string;
}

const Insurance: React.FC = () => {
  const [products, setProducts] = useState<InsuranceProduct[]>([]);
  const [activePolicies, setActivePolicies] = useState<ActivePolicy[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InsuranceProduct | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Application form state
  const [formData, setFormData] = useState({
    cropType: '',
    landArea: '',
    season: '',
    sumInsured: ''
  });

  useEffect(() => {
    fetchInsuranceData();
  }, []);

  const fetchInsuranceData = async () => {
    try {
      setLoading(true);
      const response = await insuranceAPI.getProducts();
      
      if (response.data.success) {
        // Transform API data to include icons
        const productsWithIcons = response.data.data.products.map((product: any) => ({
          ...product,
          icon: getProductIcon(product.type)
        }));
        
        setProducts(productsWithIcons);
        setActivePolicies(response.data.data.activePolicies || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load insurance data');
    } finally {
      setLoading(false);
    }
  };

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'Crop Insurance':
        return <AgricultureIcon sx={{ fontSize: 48, color: 'success.main' }} />;
      case 'Weather Insurance':
        return <CloudIcon sx={{ fontSize: 48, color: 'info.main' }} />;
      case 'Livestock Insurance':
        return <PetsIcon sx={{ fontSize: 48, color: 'warning.main' }} />;
      default:
        return <ShieldIcon sx={{ fontSize: 48, color: 'primary.main' }} />;
    }
  };

  const handleApplyClick = (product: InsuranceProduct) => {
    setSelectedProduct(product);
    setApplyDialogOpen(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitApplication = async () => {
    if (!selectedProduct) return;
    
    try {
      const response = await insuranceAPI.applyForPolicy({
        productId: selectedProduct.id,
        ...formData
      });
      
      if (response.data.success) {
        alert('Application submitted successfully!');
        setApplyDialogOpen(false);
        fetchInsuranceData(); // Refresh data
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Application failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Expired':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>Loading insurance products...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Insurance Products
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Active Policies Section */}
      {activePolicies.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldIcon /> Your Active Policies
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Policy Number</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Coverage</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Premium</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Validity</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activePolicies.map((policy) => (
                  <TableRow key={policy.id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{policy.policyNumber}</TableCell>
                    <TableCell>{policy.productName}</TableCell>
                    <TableCell>{policy.coverage}</TableCell>
                    <TableCell>₹{policy.premium.toLocaleString()}</TableCell>
                    <TableCell>
                      {new Date(policy.startDate).toLocaleDateString()} - {new Date(policy.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={policy.status} 
                        color={getStatusColor(policy.status) as any}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Available Products */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
        Available Insurance Products
      </Typography>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} md={6} lg={4} key={product.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {product.icon}
                </Box>
                
                <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
                  {product.name}
                </Typography>
                
                <Chip 
                  label={product.type} 
                  color="primary" 
                  size="small" 
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Coverage</Typography>
                  <Typography variant="h6" color="primary">
                    ₹{product.sumInsured.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Premium</Typography>
                  <Typography variant="h6" color="success.main">
                    ₹{product.premium.toLocaleString()}/year
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Key Features:
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {product.features.map((feature, index) => (
                    <Typography 
                      component="li" 
                      variant="body2" 
                      key={index}
                      sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      {feature}
                    </Typography>
                  ))}
                </Box>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => handleApplyClick(product)}
                  sx={{ 
                    background: 'linear-gradient(45deg, #2e7d32 30%, #66bb6a 90%)',
                    boxShadow: '0 3px 5px 2px rgba(46, 125, 50, .3)',
                  }}
                >
                  Apply Now
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Application Dialog */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Apply for {selectedProduct?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              select
              fullWidth
              label="Crop Type"
              value={formData.cropType}
              onChange={(e) => handleFormChange('cropType', e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="Wheat">Wheat</MenuItem>
              <MenuItem value="Rice">Rice</MenuItem>
              <MenuItem value="Cotton">Cotton</MenuItem>
              <MenuItem value="Soybean">Soybean</MenuItem>
              <MenuItem value="Sugarcane">Sugarcane</MenuItem>
            </TextField>

            <TextField
              fullWidth
              type="number"
              label="Land Area (Acres)"
              value={formData.landArea}
              onChange={(e) => handleFormChange('landArea', e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              select
              fullWidth
              label="Season"
              value={formData.season}
              onChange={(e) => handleFormChange('season', e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="Kharif">Kharif (Monsoon)</MenuItem>
              <MenuItem value="Rabi">Rabi (Winter)</MenuItem>
              <MenuItem value="Zaid">Zaid (Summer)</MenuItem>
            </TextField>

            <TextField
              fullWidth
              type="number"
              label="Sum Insured (₹)"
              value={formData.sumInsured}
              onChange={(e) => handleFormChange('sumInsured', e.target.value)}
              helperText={`Maximum: ₹${selectedProduct?.sumInsured.toLocaleString()}`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitApplication}
            disabled={!formData.cropType || !formData.landArea || !formData.season || !formData.sumInsured}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Insurance;
