import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography, Grid, Chip, Divider, Button } from '@mui/material';
import { loanAPI } from '../../services/api';

export default function LoanDetails() {
  const { loanId } = useParams();
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loanId) fetchLoanDetails();
  }, [loanId]);

  const fetchLoanDetails = async () => {
    try {
      const response = await loanAPI.getById(loanId!);
      setLoan(response.data.data);
    } catch (error) {
      console.error('Error fetching loan details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!loan) return <Typography>Loan not found</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Loan Details
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">Loan ID</Typography>
            <Typography variant="body1" fontWeight="bold">{loan.loanId}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">Status</Typography>
            <Chip label={loan.status} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">Loan Type</Typography>
            <Typography variant="body1">{loan.loanType}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
            <Typography variant="h5" color="primary">₹{loan.amount.toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">Purpose</Typography>
            <Typography variant="body1">{loan.purpose}</Typography>
          </Grid>
        </Grid>

        {loan.creditDecision && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Credit Decision</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">Decision</Typography>
                <Typography variant="body1" fontWeight="bold">{loan.creditDecision.decision}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">Credit Score</Typography>
                <Typography variant="body1" fontWeight="bold">{loan.creditDecision.score}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">Risk Level</Typography>
                <Typography variant="body1" fontWeight="bold">{loan.creditDecision.riskLevel}</Typography>
              </Grid>
              {loan.creditDecision.decisionTimeMinutes && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="success.main">
                    ✓ Decision made in {loan.creditDecision.decisionTimeMinutes} minutes
                  </Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {loan.repaymentSchedule && loan.repaymentSchedule.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Repayment Schedule</Typography>
            {loan.repaymentSchedule.map((installment: any, index: number) => (
              <Box key={index} sx={{ p: 1, mb: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2">
                  Due: {new Date(installment.dueDate).toLocaleDateString()} | 
                  Amount: ₹{installment.amount.toLocaleString()} | 
                  Status: {installment.paid ? '✓ Paid' : 'Pending'}
                </Typography>
              </Box>
            ))}
          </>
        )}
      </Paper>
    </Box>
  );
}
