import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import database
import { initializeDatabase, seedTestUser } from './database/db';

// Import routes
import authRoutes from './routes/auth.routes';
import farmerRoutes from './routes/farmer.routes';
import loanRoutes from './routes/loan.routes';
import riskRoutes from './routes/risk.routes';
import weatherRoutes from './routes/weather.routes';
import marketRoutes from './routes/market.routes';
import insuranceRoutes from './routes/insurance.routes';
import ecosystemRoutes from './routes/ecosystem.routes';
import dashboardRoutes from './routes/dashboard.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
const connectDB = async () => {
  try {
    initializeDatabase();
    seedTestUser();
    console.log('✅ SQLite database initialized successfully');
    console.log('📁 Database file: agrilend.db');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
};

connectDB();

// Health check (both root and /api for compatibility)
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Agri Lending Platform',
    version: '1.0.0'
  });
});

app.get('/api/health', (req: Request, res: Response) => {
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

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
