# 🧪 API Testing Guide

Complete guide to test all API endpoints using PowerShell or any HTTP client.

## Base URL
```
http://localhost:5000/api
```

---

## 1. Authentication APIs

### Register Farmer
```powershell
$body = @{
    name = "John Farmer"
    email = "john@example.com"
    phone = "9876543210"
    password = "password123"
    address = @{
        village = "Gandhinagar"
        district = "Gandhinagar"
        state = "Gujarat"
        pincode = "382010"
    }
    landDetails = @{
        totalArea = 5
        soilType = "Alluvial"
        irrigationType = "Drip"
        crops = @("Wheat", "Rice")
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Login
```powershell
$body = @{
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"

# Save token for subsequent requests
$token = $response.data.token
```

---

## 2. Farmer Profile APIs

### Get Profile
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/farmers/profile" -Method GET -Headers $headers
```

### Update Profile
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$body = @{
    phone = "9876543211"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/farmers/profile" -Method PUT -Body $body -Headers $headers -ContentType "application/json"
```

### Verify KYC
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$body = @{
    aadhaar = "1234-5678-9012"
    pan = "ABCDE1234F"
    landRecords = "LR123456"
    bankAccount = "1234567890"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/farmers/verify-kyc" -Method POST -Body $body -Headers $headers -ContentType "application/json"
```

### Sync Agri Stack
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/farmers/sync-agristack" -Method POST -Headers $headers
```

---

## 3. Loan APIs

### Apply for Loan (Instant Credit Decision)
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$body = @{
    loanType = "CROP_LOAN"
    amount = 100000
    purpose = "Purchase seeds and fertilizers for wheat cultivation"
    cropType = "Wheat"
    season = "Rabi"
    tenure = 12
} | ConvertTo-Json

$loanResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/loans/apply" -Method POST -Body $body -Headers $headers -ContentType "application/json"

# Save loan ID
$loanId = $loanResponse.data.loanId

# Check credit decision time
Write-Host "Credit decision completed in $($loanResponse.data.decisionTimeMinutes) minutes"
```

### Get All Loans
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/loans/farmer/all" -Method GET -Headers $headers
```

### Get Loan Details
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/loans/$loanId" -Method GET -Headers $headers
```

### Disburse Loan
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$body = @{
    accountNumber = "1234567890"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/loans/$loanId/disburse" -Method POST -Body $body -Headers $headers -ContentType "application/json"
```

### Make Payment
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$body = @{
    amount = 10000
    paymentDate = (Get-Date).ToString("yyyy-MM-dd")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/loans/$loanId/payment" -Method POST -Body $body -Headers $headers -ContentType "application/json"
```

### Get Insurance Recommendations
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/loans/$loanId/insurance/recommend" -Method GET -Headers $headers
```

### Activate Insurance
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$body = @{
    coverageType = @("Drought Insurance", "Crop Insurance")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/loans/$loanId/insurance/activate" -Method POST -Body $body -Headers $headers -ContentType "application/json"
```

---

## 4. Risk Assessment APIs (15-Day Forward)

### Generate Risk Assessment
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

# Get farmer ID from login response
$farmerId = $response.data.farmerId

$riskResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/risk/assess/$farmerId" -Method POST -Headers $headers -ContentType "application/json"

# View 15-day predictions
$riskResponse.data.forwardRisk | Format-Table Day, RiskScore, RiskLevel
```

### Get Latest Risk Assessment
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/risk/latest/$farmerId" -Method GET -Headers $headers
```

### Get Risk History
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/risk/history/$farmerId?limit=10" -Method GET -Headers $headers
```

---

## 5. Weather APIs

### Get 15-Day Weather Forecast
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$latitude = 23.0225
$longitude = 72.5714

$weather = Invoke-RestMethod -Uri "http://localhost:5000/api/weather/forecast?latitude=$latitude&longitude=$longitude" -Method GET -Headers $headers

# View forecast
$weather.data.forecast | Format-Table Day, Date, Rainfall, Condition
```

### Get Historical Weather
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/weather/historical?latitude=$latitude&longitude=$longitude&days=30" -Method GET -Headers $headers
```

---

## 6. Market APIs

### Get Crop Prices
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/market/prices?crops=Wheat,Rice,Cotton" -Method GET -Headers $headers
```

### Get Mandi Prices
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/market/mandi?state=Gujarat&district=Gandhinagar" -Method GET -Headers $headers
```

### Get Price Trends
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/market/trends/Wheat" -Method GET -Headers $headers
```

---

## 7. Insurance APIs

### Get Insurance Products
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/insurance/products" -Method GET -Headers $headers
```

### Get Claim Status
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$policyNumber = "POL-123456"

Invoke-RestMethod -Uri "http://localhost:5000/api/insurance/claims/$policyNumber" -Method GET -Headers $headers
```

---

## 8. Ecosystem APIs

### Get Government Schemes
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/ecosystem/schemes" -Method GET -Headers $headers
```

### Get Input Suppliers
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/ecosystem/suppliers/inputs" -Method GET -Headers $headers
```

### Get Warehouses
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/ecosystem/warehouses" -Method GET -Headers $headers
```

### Get FPO/JLG Info
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/ecosystem/fpo" -Method GET -Headers $headers
```

---

## 9. Dashboard APIs

### Get Portfolio Overview
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/portfolio" -Method GET -Headers $headers
```

### Get Loan Distribution
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/loan-distribution" -Method GET -Headers $headers
```

### Get Risk Distribution
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/risk-distribution" -Method GET -Headers $headers
```

### Get Recent Activities
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/recent-activities?limit=20" -Method GET -Headers $headers
```

### Get Alerts
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/alerts" -Method GET -Headers $headers
```

---

## 10. Health Check

### Check API Health
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
```

Expected Response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-26T...",
  "service": "Agri Lending Platform",
  "version": "1.0.0"
}
```

---

## Complete Test Flow

Run this complete test scenario:

```powershell
# 1. Register
$registerBody = @{
    name = "Test Farmer"
    email = "test@farmer.com"
    phone = "9876543210"
    password = "test123"
    address = @{
        village = "TestVillage"
        district = "Gandhinagar"
        state = "Gujarat"
        pincode = "382010"
    }
    landDetails = @{
        totalArea = 10
        soilType = "Alluvial"
        irrigationType = "Drip"
        crops = @("Wheat", "Rice", "Cotton")
    }
} | ConvertTo-Json

$regResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
$token = $regResponse.data.token
$farmerId = $regResponse.data.farmerId

Write-Host "✓ Registered farmer: $farmerId" -ForegroundColor Green

# 2. Apply for loan
$headers = @{ "Authorization" = "Bearer $token" }
$loanBody = @{
    loanType = "CROP_LOAN"
    amount = 150000
    purpose = "Wheat cultivation"
    cropType = "Wheat"
    season = "Rabi"
    tenure = 12
} | ConvertTo-Json

$loanResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/loans/apply" -Method POST -Body $loanBody -Headers $headers -ContentType "application/json"
$loanId = $loanResponse.data.loanId

Write-Host "✓ Loan applied: $loanId" -ForegroundColor Green
Write-Host "  Decision: $($loanResponse.data.creditDecision.decision)" -ForegroundColor Cyan
Write-Host "  Score: $($loanResponse.data.creditDecision.score)" -ForegroundColor Cyan
Write-Host "  Time: $($loanResponse.data.decisionTimeMinutes) minutes" -ForegroundColor Cyan

# 3. Generate risk assessment
$riskResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/risk/assess/$farmerId" -Method POST -Headers $headers -ContentType "application/json"

Write-Host "✓ Risk assessment generated" -ForegroundColor Green
Write-Host "  Overall Risk: $($riskResponse.data.overallRiskScore)" -ForegroundColor Cyan
Write-Host "  Category: $($riskResponse.data.riskCategory)" -ForegroundColor Cyan

# 4. Check dashboard
$portfolio = Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/portfolio" -Method GET -Headers $headers

Write-Host "✓ Portfolio stats:" -ForegroundColor Green
Write-Host "  Total Loans: $($portfolio.data.overview.totalLoans)" -ForegroundColor Cyan
Write-Host "  Active Loans: $($portfolio.data.overview.activeLoans)" -ForegroundColor Cyan

Write-Host "`n🎉 All tests passed!" -ForegroundColor Green
```

---

## Using Postman

Import this collection for easier testing:

1. Create new collection "AgriLend API"
2. Add environment variable:
   - `base_url`: http://localhost:5000/api
   - `token`: (will be set from login)
3. Use {{base_url}} and {{token}} in requests

---

## Expected Response Times

- Authentication: < 200ms
- Loan Application: < 5000ms (includes credit decision)
- Risk Assessment: < 3000ms
- Other APIs: < 500ms

---

**Happy Testing! 🧪**
