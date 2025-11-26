# AgriLend Platform - Setup Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Install and Start MongoDB

**Option A: MongoDB Community (Recommended for local development)**
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will auto-start as a Windows service

**Option B: MongoDB Atlas (Free Cloud - No installation)**
1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster (M0)
3. Get connection string
4. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agri_lending
   ```

**Option C: Docker (If you have Docker Desktop)**
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 2: Create Test User

```powershell
cd backend
npm run seed
```

**Test Credentials Created:**
- 📧 **Email**: `test@farmer.com`
- 🔑 **Password**: `Test@123`
- 👤 **Name**: Test Farmer
- 🆔 **ID**: FARMER001

### Step 3: Start the Application

```powershell
cd ..
npm run dev
```

**Access the app:**
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:5000

---

## 📝 Login Instructions

1. Open http://localhost:3000/login
2. Enter credentials:
   - **Email**: `test@farmer.com`
   - **Password**: `Test@123`
3. Click "Login"

---

## 🎯 What to Try After Login

### 1. View Dashboard
- See portfolio overview
- Check loan statistics

### 2. Apply for a Loan
- Navigate to "Apply for Loan"
- Fill the form
- Get instant credit decision (< 5 minutes!)

### 3. Check Risk Dashboard
- View 15-day forward risk predictions
- See weather forecasts
- Check market signals
- Review insurance triggers

### 4. Explore Features
- View loan details
- Check ecosystem partners
- Update profile

---

## ⚡ One-Line Quick Start (If MongoDB is already running)

```powershell
cd backend; npm run seed; cd ..; npm run dev
```

Then login at http://localhost:3000 with `test@farmer.com` / `Test@123`

---

## 🔧 Troubleshooting

### MongoDB Connection Error
**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**:
1. Check if MongoDB is running:
   ```powershell
   mongosh
   ```
2. Start MongoDB service (Windows):
   ```powershell
   net start MongoDB
   ```
3. Or use MongoDB Atlas (cloud option)

### Port Already in Use
**Error**: `Port 3000/5000 already in use`

**Solution**:
```powershell
# Find and kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Test User Already Exists
If you see "Test user already exists" - that's fine! Just proceed to start the app.

---

## 📱 Test User Profile Details

The seed script creates a complete farmer profile:

- **Location**: Test Village, Gandhinagar, Gujarat
- **Land**: 5.5 acres (Alluvial soil, Drip irrigation)
- **Crops**: Wheat, Cotton, Rice
- **Credit Score**: 720 (Good)
- **KYC**: Fully verified (Aadhaar, PAN, Land records, Bank)
- **FPO**: Gujarat Farmers Cooperative
- **Agri Stack**: Verified

---

## 🎉 Ready to Go!

Your AgriLend platform is now fully configured with:
✅ Test user with realistic data
✅ KYC documents verified
✅ Good credit score (720)
✅ Ready for instant loan approval

**Happy Testing! 🌾**
