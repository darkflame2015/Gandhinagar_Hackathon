// Vercel Serverless Function Handler
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');

// Import database
const { initializeDatabase, seedTestUser } = require('../dist/database/db');

// Import routes
const authRoutes = require('../dist/routes/auth.routes').default;
const farmerRoutes = require('../dist/routes/farmer.routes').default;
const loanRoutes = require('../dist/routes/loan.routes').default;
const riskRoutes = require('../dist/routes/risk.routes').default;
const weatherRoutes = require('../dist/routes/weather.routes').default;
const marketRoutes = require('../dist/routes/market.routes').default;
const insuranceRoutes = require('../dist/routes/insurance.routes').default;
const ecosystemRoutes = require('../dist/routes/ecosystem.routes').default;
const dashboardRoutes = require('../dist/routes/dashboard.routes').default;

dotenv.config();

const app = express();

// Middleware - CORS must come before helmet
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
try {
  initializeDatabase();
  seedTestUser();
  console.log('✅ Database initialized');
} catch (error) {
  console.error('Database initialization error:', error);
}

// Health checks
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Agri Lending Platform',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Agri Lending Platform API',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/ecosystem', ecosystemRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
