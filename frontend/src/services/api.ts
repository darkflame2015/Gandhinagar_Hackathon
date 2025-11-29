import axios from 'axios';

// Use relative path for Vercel (same domain) or absolute URL for separate deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', import.meta.env.MODE);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) =>
    api.post('/auth/register', data),
};

// Farmer APIs
export const farmerAPI = {
  getProfile: () => api.get('/farmers/profile'),
  updateProfile: (data: any) => api.put('/farmers/profile', data),
  verifyKYC: (data: any) => api.post('/farmers/verify-kyc', data),
  syncAgriStack: () => api.post('/farmers/sync-agristack'),
};

// Loan APIs
export const loanAPI = {
  apply: (data: any) => api.post('/loans/apply', data),
  getAll: () => api.get('/loans/farmer/all'),
  getById: (loanId: string) => api.get(`/loans/${loanId}`),
  disburse: (loanId: string, accountNumber: string) =>
    api.post(`/loans/${loanId}/disburse`, { accountNumber }),
  makePayment: (loanId: string, amount: number, paymentDate?: Date) =>
    api.post(`/loans/${loanId}/payment`, { amount, paymentDate }),
  getInsuranceRecommendations: (loanId: string) =>
    api.get(`/loans/${loanId}/insurance/recommend`),
  activateInsurance: (loanId: string, coverageType: string[]) =>
    api.post(`/loans/${loanId}/insurance/activate`, { coverageType }),
};

// Risk APIs
export const riskAPI = {
  assess: (farmerId: string, loanId?: string) =>
    api.post(`/risk/assess/${farmerId}`, { loanId }),
  getLatest: (farmerId: string) =>
    api.get(`/risk/latest/${farmerId}`),
  getHistory: (farmerId: string, limit?: number) =>
    api.get(`/risk/history/${farmerId}`, { params: { limit } }),
};

// Weather APIs
export const weatherAPI = {
  getForecast: (latitude: number, longitude: number) =>
    api.get('/weather/forecast', { params: { latitude, longitude } }),
  getHistorical: (latitude: number, longitude: number, days?: number) =>
    api.get('/weather/historical', { params: { latitude, longitude, days } }),
};

// Market APIs
export const marketAPI = {
  getPrices: (crops: string[]) =>
    api.get('/market/prices', { params: { crops: crops.join(',') } }),
  getMandiPrices: (state: string, district: string) =>
    api.get('/market/mandi', { params: { state, district } }),
  getTrends: (crop: string) =>
    api.get(`/market/trends/${crop}`),
};

// Insurance APIs
export const insuranceAPI = {
  getProducts: () => api.get('/insurance/products'),
  applyForPolicy: (data: any) => api.post('/insurance/apply', data),
  getClaimStatus: (policyNumber: string) =>
    api.get(`/insurance/claims/${policyNumber}`),
};

// Ecosystem APIs
export const ecosystemAPI = {
  getSchemes: () => api.get('/ecosystem/schemes'),
  getSuppliers: () => api.get('/ecosystem/suppliers/inputs'),
  getWarehouses: () => api.get('/ecosystem/warehouses'),
  getFPOs: () => api.get('/ecosystem/fpo'),
};

// Dashboard APIs
export const dashboardAPI = {
  getPortfolio: () => api.get('/dashboard/portfolio'),
  getLoanDistribution: () => api.get('/dashboard/loan-distribution'),
  getRiskDistribution: () => api.get('/dashboard/risk-distribution'),
  getRecentActivities: (limit?: number) =>
    api.get('/dashboard/recent-activities', { params: { limit } }),
  getAlerts: () => api.get('/dashboard/alerts'),
};

export default api;
