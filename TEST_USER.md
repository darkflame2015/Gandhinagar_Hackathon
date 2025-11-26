# 🧪 Test User Guide

## Quick Reference

### Test Credentials
```
Email:    test@farmer.com
Password: Test@123
```

### URLs
```
Login:    http://localhost:3000/login
Frontend: http://localhost:3000
Backend:  http://localhost:5000/health
```

---

## 🚀 Quick Start Commands

### 1. Setup (One Time)
```powershell
# Install MongoDB first, then:
cd backend
npm run seed
```

### 2. Start App
```powershell
npm run dev
```

### 3. Login
1. Open: http://localhost:3000/login
2. Email: `test@farmer.com`
3. Password: `Test@123`

---

## 👤 Test User Profile

### Personal Information
- **Name**: Test Farmer
- **Farmer ID**: FARMER001
- **Phone**: 9876543210
- **Email**: test@farmer.com

### Location
- **Village**: Test Village
- **District**: Gandhinagar
- **State**: Gujarat
- **Pincode**: 382010
- **Coordinates**: 23.2156°N, 72.6369°E

### Land Details
- **Total Area**: 5.5 acres
- **Soil Type**: Alluvial
- **Irrigation**: Drip irrigation
- **Crops**: Wheat, Cotton, Rice

### KYC Status
- **Aadhaar**: 123456789012 ✅ Verified
- **PAN**: ABCDE1234F ✅ Verified
- **Land Records**: LAND001 ✅ Verified
- **Bank Account**: 1234567890 ✅ Verified

### Financial Profile
- **Credit Score**: 720 (Good)
- **FPO Member**: Gujarat Farmers Cooperative
- **Agri Stack**: Verified (ID: AGRISTACK001)
- **Account Status**: ✅ Verified

---

## 🎯 Testing Scenarios

### Scenario 1: Apply for Loan (Instant Approval)
**Expected Result**: APPROVED (High credit score + verified KYC)

1. Login with test credentials
2. Go to "Apply for Loan"
3. Fill form:
   - Loan Type: Crop Loan
   - Amount: ₹50,000
   - Purpose: Wheat cultivation
   - Crop: Wheat
   - Season: Rabi
   - Tenure: 6 months
4. Submit
5. **Result**: Should get APPROVED in 2-5 minutes
   - Credit score: 720
   - Risk assessment: Low to Medium
   - Decision: Automated approval

### Scenario 2: View Risk Dashboard
**Expected Result**: See 15-day forward predictions

1. Navigate to "Risk Dashboard"
2. Click "Refresh Assessment"
3. **View**:
   - 15-day forward risk chart
   - Weather forecasts
   - Market signals
   - Insurance triggers
   - Mitigation recommendations

### Scenario 3: Check Portfolio
**Expected Result**: Dashboard shows statistics

1. Go to Dashboard (home)
2. **See**:
   - Total loans
   - Active loans
   - Recent activities
   - Alerts

---

## 🧪 API Testing

### Get Token
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@farmer.com","password":"Test@123"}'

$token = $response.token
Write-Host "Token: $token"
```

### Get Farmer Profile
```powershell
$headers = @{
  "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/farmer/profile" `
  -Headers $headers
```

### Apply for Loan via API
```powershell
$loanData = @{
  loanType = "CROP_LOAN"
  amount = 50000
  purpose = "Wheat cultivation for Rabi season"
  cropType = "Wheat"
  season = "Rabi"
  tenure = 6
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/loan/apply" `
  -Method POST `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $loanData
```

### Get Risk Assessment
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/risk/assess" `
  -Method POST `
  -Headers $headers `
  -ContentType "application/json"
```

---

## 🔄 Reset Test User

### Delete and Recreate
```powershell
# Delete from MongoDB
mongosh agri_lending --eval 'db.farmers.deleteOne({email:"test@farmer.com"})'

# Recreate
cd backend
npm run seed
```

### Update Password Manually
```javascript
// In MongoDB shell
mongosh agri_lending

// Hash a new password
const bcrypt = require('bcryptjs');
const newPassword = bcrypt.hashSync('NewPassword@123', 10);

// Update
db.farmers.updateOne(
  { email: 'test@farmer.com' },
  { $set: { password: newPassword } }
);
```

---

## 📊 Expected Behavior

### Credit Decision Matrix

| Credit Score | Risk Level | Expected Decision |
|-------------|------------|-------------------|
| 720 (Test)  | Low-Medium | ✅ APPROVED       |
| 600-699     | Medium     | ✅ APPROVED*      |
| 550-599     | High       | ⚠️ MANUAL REVIEW |
| < 550       | Very High  | ❌ REJECTED       |

*May require additional conditions

### Test User Advantages
- ✅ High credit score (720)
- ✅ Fully verified KYC
- ✅ FPO membership (+50 points)
- ✅ Agri Stack verified (+100 points)
- ✅ Good land holding (5.5 acres)

**Result**: Should get instant approval for most loan requests up to ₹2-3 lakhs

---

## 🎭 Creating Additional Test Users

### Modify seed script for different scenarios:

**Low Credit Score Farmer** (for rejection testing):
```typescript
creditScore: 480  // Will likely be REJECTED
```

**Medium Credit Farmer** (for manual review):
```typescript
creditScore: 570  // Will go to MANUAL_REVIEW
```

**Unverified Farmer** (for KYC testing):
```typescript
isVerified: false,
kycDocuments: {
  aadhaar: null,
  pan: null,
  // ...
}
```

---

## 📝 Notes

- **Seed script is idempotent**: Running `npm run seed` multiple times will not create duplicates
- **Password is hashed**: Uses bcrypt with salt for security
- **Realistic data**: Profile mimics actual farmer data structure
- **Ready for demos**: All verification complete, good credit score

---

## 🐛 Troubleshooting

### "Email already exists" Error
✅ **This is normal!** Test user already created. Just login.

### Cannot Login
1. Check if backend is running: http://localhost:5000/health
2. Check MongoDB connection
3. Verify credentials exactly: `test@farmer.com` / `Test@123`
4. Check browser console for errors

### Token Expired
- Tokens expire after 7 days (default)
- Just login again to get a new token

---

## 🎉 Ready to Test!

Your test user is fully configured with:
✅ Verified KYC documents
✅ Good credit score (720)
✅ Realistic land and crop data
✅ FPO membership
✅ Agri Stack integration

**Happy Testing! 🌾**
