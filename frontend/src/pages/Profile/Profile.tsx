import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Agriculture,
  VerifiedUser,
  Edit,
  Save,
  Cancel,
  CreditScore,
  Landscape,
  WaterDrop,
  CheckCircle,
  Warning,
  CloudSync,
} from '@mui/icons-material';
import { farmerAPI } from '../../services/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { loginSuccess } from '../../store/slices/authSlice';

export default function Profile() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      village: '',
      district: '',
      state: '',
      pincode: '',
    },
    landDetails: {
      totalArea: 0,
      soilType: '',
      irrigationType: '',
      crops: [] as string[],
    },
    fpo: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await farmerAPI.getProfile();
      const profileData = res.data.data;
      setProfile(profileData);
      
      // Initialize form data
      setFormData({
        name: profileData.name || '',
        phone: profileData.phone || '',
        address: {
          village: profileData.address?.village || '',
          district: profileData.address?.district || '',
          state: profileData.address?.state || '',
          pincode: profileData.address?.pincode || '',
        },
        landDetails: {
          totalArea: profileData.landDetails?.totalArea || 0,
          soilType: profileData.landDetails?.soilType || '',
          irrigationType: profileData.landDetails?.irrigationType || '',
          crops: profileData.landDetails?.crops || [],
        },
        fpo: profileData.fpo || '',
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        address: {
          village: profile.address?.village || '',
          district: profile.address?.district || '',
          state: profile.address?.state || '',
          pincode: profile.address?.pincode || '',
        },
        landDetails: {
          totalArea: profile.landDetails?.totalArea || 0,
          soilType: profile.landDetails?.soilType || '',
          irrigationType: profile.landDetails?.irrigationType || '',
          crops: profile.landDetails?.crops || [],
        },
        fpo: profile.fpo || '',
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await farmerAPI.updateProfile(formData);
      const updatedProfile = res.data.data;
      setProfile(updatedProfile);
      setEditing(false);
      setSuccess('Profile updated successfully!');

      // Update user in Redux store
      if (user) {
        dispatch(loginSuccess({
          token: localStorage.getItem('token') || '',
          user: {
            ...user,
            name: updatedProfile.name,
          },
        }));
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [field]: value,
      },
    }));
  };

  const handleSyncAgriStack = async () => {
    try {
      setSuccess('');
      setError('');
      await farmerAPI.syncAgriStack();
      setSuccess('AgriStack data synced successfully!');
      await fetchProfile();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to sync AgriStack data');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          My Profile
        </Typography>
        {!editing ? (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleEdit}
          >
            Edit Profile
          </Button>
        ) : (
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        )}
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Overview Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto',
                bgcolor: theme.palette.primary.main,
                fontSize: 48,
                mb: 2,
              }}
            >
              {profile?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {profile?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Farmer ID: {profile?.farmerId}
            </Typography>
            <Box display="flex" justifyContent="center" gap={1} my={2}>
              {profile?.isVerified ? (
                <Chip
                  icon={<CheckCircle />}
                  label="Verified"
                  color="success"
                  size="small"
                />
              ) : (
                <Chip
                  icon={<Warning />}
                  label="Not Verified"
                  color="warning"
                  size="small"
                />
              )}
              {profile?.agriStackData?.verified && (
                <Chip
                  icon={<CloudSync />}
                  label="AgriStack"
                  color="info"
                  size="small"
                />
              )}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box textAlign="left">
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CreditScore color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Credit Score"
                    secondary={profile?.creditScore || 'Not assessed'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Landscape color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Total Land"
                    secondary={`${profile?.landDetails?.totalArea || 0} acres`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Agriculture color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Crops"
                    secondary={profile?.landDetails?.crops?.join(', ') || 'None'}
                  />
                </ListItem>
              </List>
            </Box>
            {!profile?.agriStackData?.verified && (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<CloudSync />}
                onClick={handleSyncAgriStack}
                sx={{ mt: 2 }}
              >
                Sync AgriStack
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!editing}
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'text.disabled' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={profile?.email || ''}
                        disabled
                        InputProps={{
                          startAdornment: <Email sx={{ mr: 1, color: 'text.disabled' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!editing}
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: 'text.disabled' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="FPO/JLG Membership"
                        value={formData.fpo}
                        onChange={(e) => handleInputChange('fpo', e.target.value)}
                        disabled={!editing}
                        placeholder="Optional"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Address Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Village"
                        value={formData.address.village}
                        onChange={(e) => handleNestedInputChange('address', 'village', e.target.value)}
                        disabled={!editing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="District"
                        value={formData.address.district}
                        onChange={(e) => handleNestedInputChange('address', 'district', e.target.value)}
                        disabled={!editing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="State"
                        value={formData.address.state}
                        onChange={(e) => handleNestedInputChange('address', 'state', e.target.value)}
                        disabled={!editing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Pincode"
                        value={formData.address.pincode}
                        onChange={(e) => handleNestedInputChange('address', 'pincode', e.target.value)}
                        disabled={!editing}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Land Details */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    <Agriculture sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Land & Farming Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Total Land Area (acres)"
                        type="number"
                        value={formData.landDetails.totalArea}
                        onChange={(e) => handleNestedInputChange('landDetails', 'totalArea', parseFloat(e.target.value))}
                        disabled={!editing}
                        InputProps={{
                          startAdornment: <Landscape sx={{ mr: 1, color: 'text.disabled' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Soil Type"
                        value={formData.landDetails.soilType}
                        onChange={(e) => handleNestedInputChange('landDetails', 'soilType', e.target.value)}
                        disabled={!editing}
                        placeholder="e.g., Loamy, Clay, Sandy"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Irrigation Type"
                        value={formData.landDetails.irrigationType}
                        onChange={(e) => handleNestedInputChange('landDetails', 'irrigationType', e.target.value)}
                        disabled={!editing}
                        placeholder="e.g., Drip, Sprinkler, Canal"
                        InputProps={{
                          startAdornment: <WaterDrop sx={{ mr: 1, color: 'text.disabled' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Crops Grown"
                        value={formData.landDetails.crops.join(', ')}
                        onChange={(e) => handleNestedInputChange('landDetails', 'crops', e.target.value.split(',').map(c => c.trim()))}
                        disabled={!editing}
                        placeholder="e.g., Rice, Wheat, Cotton"
                        helperText="Separate crops with commas"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* KYC Documents */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    <VerifiedUser sx={{ mr: 1, verticalAlign: 'middle' }} />
                    KYC Documents
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2">Aadhaar</Typography>
                        {profile?.kycDocuments?.aadhaar ? (
                          <Chip icon={<CheckCircle />} label="Verified" color="success" size="small" />
                        ) : (
                          <Chip icon={<Warning />} label="Pending" color="warning" size="small" />
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2">PAN</Typography>
                        {profile?.kycDocuments?.pan ? (
                          <Chip icon={<CheckCircle />} label="Verified" color="success" size="small" />
                        ) : (
                          <Chip icon={<Warning />} label="Pending" color="warning" size="small" />
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2">Land Records</Typography>
                        {profile?.kycDocuments?.landRecords ? (
                          <Chip icon={<CheckCircle />} label="Verified" color="success" size="small" />
                        ) : (
                          <Chip icon={<Warning />} label="Pending" color="warning" size="small" />
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2">Bank Account</Typography>
                        {profile?.kycDocuments?.bankAccount ? (
                          <Chip icon={<CheckCircle />} label="Verified" color="success" size="small" />
                        ) : (
                          <Chip icon={<Warning />} label="Pending" color="warning" size="small" />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                  {!profile?.isVerified && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Complete your KYC verification to access all features and get better loan offers
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
