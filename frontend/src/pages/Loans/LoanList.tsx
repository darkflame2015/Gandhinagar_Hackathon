import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';
import { loanAPI } from '../../services/api';

export default function LoanList() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await loanAPI.getAll();
      setLoans(response.data.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      APPROVED: 'success',
      DISBURSED: 'info',
      ACTIVE: 'primary',
      CLOSED: 'default',
      PENDING: 'warning',
      REJECTED: 'error',
      NPA: 'error',
    };
    return colors[status] || 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          My Loans
        </Typography>
        <Button variant="contained" onClick={() => navigate('/loans/apply')}>
          Apply for New Loan
        </Button>
      </Box>

      {loading ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Loading loans...</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Loan ID</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Applied Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.loanId} hover>
                  <TableCell>{loan.loanId}</TableCell>
                  <TableCell>{loan.loanType}</TableCell>
                  <TableCell>₹{loan.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={loan.status} color={getStatusColor(loan.status)} size="small" />
                  </TableCell>
                  <TableCell>{new Date(loan.applicationDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/loans/${loan.loanId}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
