import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import RiskDashboard from './pages/Risk/RiskDashboard';
import LoanApplication from './pages/Loans/LoanApplication';
import LoanList from './pages/Loans/LoanList';
import LoanDetails from './pages/Loans/LoanDetails';
import Profile from './pages/Profile/Profile';
import EcosystemPartners from './pages/Ecosystem/EcosystemPartners';
import Insurance from './pages/Insurance/Insurance';
import ForecastAnalysis from './pages/Forecast/ForecastAnalysis';
import Weather from './pages/Weather/Weather';
import MarketPrices from './pages/Market/MarketPrices';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="risk" element={<RiskDashboard />} />
          <Route path="risk-dashboard" element={<RiskDashboard />} />
          <Route path="loans/apply" element={<LoanApplication />} />
          <Route path="loans" element={<LoanList />} />
          <Route path="loans/:loanId" element={<LoanDetails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="ecosystem" element={<EcosystemPartners />} />
          <Route path="insurance" element={<Insurance />} />
          <Route path="forecast" element={<ForecastAnalysis />} />
          <Route path="weather" element={<Weather />} />
          <Route path="market" element={<MarketPrices />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
