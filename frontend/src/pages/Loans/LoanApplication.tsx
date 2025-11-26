import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
} from '@mui/material';
import { loanAPI } from '../../services/api';

const loanTypes = ['KCC', 'CROP_LOAN', 'ASSET_FINANCE', 'GROUP_LENDING'];
const seasons = ['Kharif', 'Rabi', 'Zaid'];

export default function LoanApplication() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loanType: 'CROP_LOAN',
    amount: '',
    purpose: '',
    cropType: '',
    season: 'Kharif',
    tenure: '12',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loanAPI.apply({
        ...formData,
        amount: parseFloat(formData.amount),
        tenure: parseInt(formData.tenure),
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/loans/${response.data.data.loanId}`);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Apply for Agricultural Loan
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Get instant credit decision in under 30 minutes
      </Typography>

      <Paper sx={{ p: 4, mt: 3 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Application submitted successfully! Redirecting to loan details...
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Loan Type"
                name="loanType"
                value={formData.loanType}
                onChange={handleChange}
                required
              >
                {loanTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type.replace('_', ' ')}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Loan Amount (₹)"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Crop Type"
                name="cropType"
                value={formData.cropType}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Season"
                name="season"
                value={formData.season}
                onChange={handleChange}
              >
                {seasons.map((season) => (
                  <MenuItem key={season} value={season}>{season}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tenure (months)"
                name="tenure"
                type="number"
                value={formData.tenure}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Submit Application'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
