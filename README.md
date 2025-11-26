# 🌾 AgriLend - Digital Lending Platform for Agriculture

## 15-Day Forward Risk Dashboard with Automated Mitigation

A production-ready, scalable digital lending solution for agriculture featuring instant credit decisioning, real-time risk assessment, and automated insurance triggers.

---

## 🎯 Key Features

### ✅ Instant Credit Decisioning
- **Target: < 30 minutes** ✓
- Automated decision engine using multi-factor analysis
- Real-time Agri Stack integration
- Alternative data scoring (digital footprint, community rating)

### 📊 15-Day Forward Risk Dashboard
- Weather-based risk prediction using forecast data
- Satellite imagery analysis (NDVI, soil moisture, crop health)
- Market signals integration (price trends, volatility)
- Automated mitigation recommendations
- **Insurance triggers** with parametric thresholds

### 💰 End-to-End Loan Lifecycle Automation
1. **Origination** - Quick farmer registration with KYC
2. **Underwriting** - Automated credit scoring & risk assessment
3. **Disbursement** - Direct bank transfer integration
4. **Monitoring** - Real-time portfolio dashboards
5. **Collection** - Flexible seasonal repayment schedules

### 🤝 Ecosystem Integration
- Government schemes (KCC, PMFBY, PMKSY)
- Input suppliers & warehouses
- Mandi price integration
- FPO/JLG support for group lending
- Insurance provider connectivity

### 📱 Farmer-Friendly Design
- Multiple loan products (KCC, Crop Loan, Asset Finance, Group Lending)
- Seasonal repayment schedules
- Mobile-first responsive UI
- Real-time notifications & alerts

---

## 🏗️ Architecture

```
agri-lending-platform/
├── backend/                    # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── models/            # MongoDB schemas
│   │   │   ├── Farmer.model.ts
│   │   │   ├── Loan.model.ts
│   │   │   └── RiskAssessment.model.ts
│   │   ├── routes/            # API endpoints
│   │   │   ├── auth.routes.ts
│   │   │   ├── loan.routes.ts
│   │   │   ├── risk.routes.ts
│   │   │   ├── weather.routes.ts
│   │   │   ├── market.routes.ts
│   │   │   ├── insurance.routes.ts
│   │   │   ├── ecosystem.routes.ts
│   │   │   └── dashboard.routes.ts
│   │   ├── services/          # Business logic
│   │   │   ├── loan.service.ts      # Credit decisioning
│   │   │   ├── risk.service.ts      # Risk assessment
│   │   │   └── insurance.service.ts # Insurance automation
│   │   ├── middleware/        # Auth, validation
│   │   ├── utils/             # Logger, helpers
│   │   └── server.ts          # Entry point
│   └── package.json
│
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard/     # Portfolio overview
│   │   │   ├── Risk/          # 15-day risk dashboard
│   │   │   ├── Loans/         # Loan management
│   │   │   ├── Auth/          # Login/Register
│   │   │   ├── Profile/       # Farmer profile
│   │   │   └── Ecosystem/     # Partners & schemes
│   │   ├── components/        # Reusable UI components
│   │   ├── store/             # Redux state management
│   │   └── services/          # API integration
│   └── package.json
│
└── package.json               # Root workspace
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6+
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd hackathon_gandhinagar
```

2. **Install all dependencies**
```bash
npm run install-all
```

3. **Set up environment variables**
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and API keys
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud database
```

5. **Run the application**
```bash
# From root directory
npm run dev
```

This will start:
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000

---

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - Register new farmer
- `POST /api/auth/login` - Login

### Farmers
- `GET /api/farmers/profile` - Get farmer profile
- `PUT /api/farmers/profile` - Update profile
- `POST /api/farmers/verify-kyc` - Verify KYC documents
- `POST /api/farmers/sync-agristack` - Sync with Agri Stack

### Loans
- `POST /api/loans/apply` - Apply for loan (triggers instant credit decision)
- `GET /api/loans/farmer/all` - Get all loans
- `GET /api/loans/:loanId` - Get loan details
- `POST /api/loans/:loanId/disburse` - Disburse approved loan
- `POST /api/loans/:loanId/payment` - Make payment
- `GET /api/loans/:loanId/insurance/recommend` - Get insurance recommendations
- `POST /api/loans/:loanId/insurance/activate` - Activate insurance

### Risk Assessment (15-Day Forward)
- `POST /api/risk/assess/:farmerId` - Generate 15-day risk forecast
- `GET /api/risk/latest/:farmerId` - Get latest assessment
- `GET /api/risk/history/:farmerId` - Get historical assessments

### Weather
- `GET /api/weather/forecast` - 15-day weather forecast
- `GET /api/weather/historical` - Historical weather data

### Market
- `GET /api/market/prices` - Current crop prices
- `GET /api/market/mandi` - Mandi prices
- `GET /api/market/trends/:crop` - Price trends

### Insurance
- `GET /api/insurance/products` - Available insurance products
- `GET /api/insurance/claims/:policyNumber` - Claim status

### Ecosystem
- `GET /api/ecosystem/schemes` - Government schemes
- `GET /api/ecosystem/suppliers/inputs` - Input suppliers
- `GET /api/ecosystem/warehouses` - Warehouse facilities
- `GET /api/ecosystem/fpo` - FPO/JLG information

### Dashboard
- `GET /api/dashboard/portfolio` - Portfolio overview & KPIs
- `GET /api/dashboard/loan-distribution` - Loan type distribution
- `GET /api/dashboard/risk-distribution` - Risk category distribution
- `GET /api/dashboard/recent-activities` - Recent loan activities
- `GET /api/dashboard/alerts` - Alerts & notifications

---

## 🎨 Frontend Features

### Pages
1. **Dashboard** - Portfolio overview with KPIs
2. **Risk Dashboard** - 15-day forward risk visualization
3. **Loan Application** - Apply for new loan
4. **My Loans** - View all loans
5. **Loan Details** - Detailed loan information
6. **Ecosystem Partners** - Browse partners & schemes
7. **Profile** - Manage farmer profile

### Components
- Responsive navigation with drawer
- Interactive charts (Recharts)
- Material-UI components
- Real-time data updates
- Alert notifications

---

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Helmet.js for HTTP headers
- Input validation
- Secure API endpoints

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## 📊 Database Schema

### Farmer
- Personal information
- Land details
- KYC documents
- Agri Stack integration
- Credit score

### Loan
- Loan details & type
- Application & approval workflow
- Credit decision (automated)
- Repayment schedule
- Insurance coverage
- Risk score

### RiskAssessment
- 15-day forward predictions
- Weather data
- Satellite imagery analysis
- Market signals
- Alternative data scores
- Mitigation actions
- Insurance triggers

---

## 🔄 Automated Workflows

### Credit Decisioning (< 30 minutes)
1. Farmer submits loan application
2. System fetches Agri Stack data
3. Generates risk assessment
4. Calculates credit score
5. Makes automated decision
6. Returns approval/rejection

### Risk Monitoring
- **Cron Job**: Updates risk scores every 6 hours
- Monitors weather forecasts
- Analyzes satellite imagery
- Tracks market volatility

### Insurance Triggers
- **Cron Job**: Checks triggers every hour
- Drought threshold monitoring
- Flood risk assessment
- Crop failure detection
- Automatic claim initiation

---

## 🌐 External API Integrations

### Required APIs (Production)
- **Weather API**: OpenWeatherMap, WeatherAPI
- **Satellite Imagery**: Sentinel Hub, Landsat
- **Agri Stack**: Government Agri Stack API
- **Market Data**: Agmarknet, NCDEX
- **Insurance**: Insurance provider APIs
- **Payment Gateway**: Razorpay, PayU

### Demo Mode
All external APIs have fallback mock data for development/demo purposes.

---

## 📦 Deployment

### Docker Deployment
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

### Manual Deployment

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist folder with nginx or any static server
```

---

## 🎯 Performance Targets

✅ **Credit Decision Time**: < 30 minutes (typically 2-5 minutes)
✅ **API Response Time**: < 500ms for most endpoints
✅ **Risk Assessment Generation**: < 2 seconds
✅ **Dashboard Load Time**: < 3 seconds
✅ **99.9% Uptime** with proper infrastructure

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Team

Built for the Gandhinagar Hackathon 2025

---

## 📞 Support

For issues and questions, please open a GitHub issue.

---

## 🙏 Acknowledgments

- Agri Stack Initiative
- Weather API providers
- Satellite imagery providers
- Open source community

---

**Happy Farming! 🌾**
