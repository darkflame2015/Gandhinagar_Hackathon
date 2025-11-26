# 🚀 Quick Start Guide - AgriLend Platform

## Complete Setup in 5 Steps

### Step 1: Install Dependencies

Open PowerShell in the project root directory:

```powershell
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Setup MongoDB

**Option A: Use MongoDB Atlas (Recommended for Quick Start)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `backend\.env` with your connection string

**Option B: Use Local MongoDB**
```powershell
# Make sure MongoDB is installed and running
# Default connection: mongodb://localhost:27017/agri_lending
```

### Step 3: Configure Environment

```powershell
cd backend

# Copy environment template
Copy-Item .env.example .env

# Edit .env file with your settings (optional for demo)
# The default values will work for development
```

### Step 4: Start the Application

```powershell
# From the root directory
npm run dev
```

This will start both backend and frontend concurrently:
- **Backend API**: http://localhost:5000
- **Frontend App**: http://localhost:3000

### Step 5: Test the Application

1. **Open Browser**: Navigate to http://localhost:3000

2. **Register a Farmer**:
   - Click "Register here"
   - Fill in farmer details:
     - Name: John Farmer
     - Email: john@example.com
     - Phone: 9876543210
     - Password: password123
     - Village: Gandhinagar
     - District: Gandhinagar
     - State: Gujarat
     - Pincode: 382010
     - Total Area: 5 acres
     - Soil Type: Alluvial
     - Irrigation Type: Drip
     - Crops: Wheat, Rice

3. **Apply for Loan**:
   - Navigate to "Apply for Loan"
   - Fill in loan details:
     - Loan Type: CROP_LOAN
     - Amount: 100000
     - Purpose: Purchase seeds and fertilizers
     - Crop Type: Wheat
     - Season: Rabi
     - Tenure: 12 months
   - Submit application
   - **Credit decision will be automatic (< 30 minutes)**

4. **View Risk Dashboard**:
   - Navigate to "Risk Dashboard"
   - Click "Generate Risk Assessment"
   - View 15-day forward risk predictions
   - Check weather forecasts
   - View satellite data analysis
   - Review automated mitigation actions
   - Check insurance triggers

5. **Explore Features**:
   - Dashboard: View portfolio overview
   - My Loans: See all loan applications
   - Ecosystem: Browse government schemes, suppliers, warehouses
   - Profile: Manage farmer profile

---

## 🔧 Troubleshooting

### Backend won't start
```powershell
cd backend

# Check if MongoDB is running
# Check .env file exists

# Start backend separately
npm run dev
```

### Frontend won't start
```powershell
cd frontend

# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
npm install

# Start frontend separately
npm run dev
```

### Port already in use
```powershell
# Change ports in:
# - backend/.env (PORT=5000 -> PORT=5001)
# - frontend/vite.config.ts (port: 3000 -> port: 3001)
```

### MongoDB connection error
```powershell
# Update MONGODB_URI in backend/.env
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/agri_lending

# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agri_lending
```

---

## 📊 API Health Check

Test if backend is running:
```powershell
# Using curl
curl http://localhost:5000/health

# Or open in browser
# http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-26T...",
  "service": "Agri Lending Platform",
  "version": "1.0.0"
}
```

---

## 🎯 Demo Flow

### Complete Loan Journey

1. **Registration** (2 minutes)
   - Register as farmer with land details

2. **Apply for Loan** (3 minutes)
   - Fill loan application form
   - Submit application

3. **Instant Credit Decision** (< 30 minutes, typically 2-5 minutes)
   - System fetches weather data
   - Analyzes satellite imagery
   - Checks market signals
   - Calculates credit score
   - Makes automated decision

4. **Risk Monitoring** (Ongoing)
   - 15-day forward risk predictions
   - Daily weather updates
   - Market price monitoring
   - Automated alerts

5. **Insurance Automation** (If risk detected)
   - Automatic trigger activation
   - Claim initiation
   - Payout processing

---

## 🔐 Default Credentials

For testing, you can use:
- **Email**: demo@agrilend.com
- **Password**: demo123

(Create this account after registration)

---

## 📱 Mobile Testing

The application is fully responsive. Test on mobile by:
1. Find your local IP: `ipconfig`
2. Access from mobile: `http://YOUR_IP:3000`

---

## 🐳 Docker Deployment (Optional)

For production-like environment:

```powershell
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📈 Performance Metrics

Expected performance (development mode):
- Page Load: < 2 seconds
- API Response: < 500ms
- Credit Decision: 2-5 minutes (target: < 30 minutes)
- Risk Assessment: < 3 seconds

---

## 🎨 Tech Stack

**Backend:**
- Node.js 18+
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Cron Jobs for automation

**Frontend:**
- React 18
- TypeScript
- Material-UI (MUI)
- Redux Toolkit
- Recharts for visualization
- Axios for API calls
- Vite for bundling

---

## 📞 Need Help?

1. Check the main README.md for detailed documentation
2. Review API documentation section
3. Check the code comments
4. Open an issue on GitHub

---

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] Backend starts without errors (port 5000)
- [ ] Frontend starts without errors (port 3000)
- [ ] Can register new farmer
- [ ] Can apply for loan
- [ ] Credit decision completes
- [ ] Risk dashboard loads
- [ ] Charts display correctly
- [ ] Can navigate all pages

---

**Everything should now be working! Happy coding! 🌾**
