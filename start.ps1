# AgriLend - Quick Start Script
# Run this script to start the application with a test user

Write-Host "🌾 AgriLend Platform - Quick Start" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Check MongoDB
Write-Host "📊 Checking MongoDB..." -ForegroundColor Yellow

$mongoRunning = $false
try {
    $mongoTest = mongosh --eval "db.version()" --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
        $mongoRunning = $true
        Write-Host "✅ MongoDB is running locally" -ForegroundColor Green
    }
} catch {
    Write-Host "ℹ️  Local MongoDB not found" -ForegroundColor Yellow
}

if (-not $mongoRunning) {
    Write-Host ""
    Write-Host "⚠️  MongoDB is not running!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Choose an option:" -ForegroundColor Cyan
    Write-Host "1. Install MongoDB Community (Recommended)" -ForegroundColor White
    Write-Host "2. Use MongoDB Atlas (Free Cloud)" -ForegroundColor White
    Write-Host "3. Exit and set up manually" -ForegroundColor White
    Write-Host ""
    $choice = Read-Host "Enter your choice (1-3)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "📥 Opening MongoDB download page..." -ForegroundColor Cyan
            Start-Process "https://www.mongodb.com/try/download/community"
            Write-Host ""
            Write-Host "Please:" -ForegroundColor Yellow
            Write-Host "1. Download and install MongoDB Community Edition" -ForegroundColor White
            Write-Host "2. Make sure MongoDB service is running" -ForegroundColor White
            Write-Host "3. Run this script again" -ForegroundColor White
            Write-Host ""
            Read-Host "Press Enter to exit"
            exit
        }
        "2" {
            Write-Host ""
            Write-Host "☁️  Setting up MongoDB Atlas..." -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Please follow these steps:" -ForegroundColor Yellow
            Write-Host "1. Go to https://www.mongodb.com/cloud/atlas/register" -ForegroundColor White
            Write-Host "2. Create a free account and cluster" -ForegroundColor White
            Write-Host "3. Get your connection string" -ForegroundColor White
            Write-Host "4. Update backend\.env file with your connection string" -ForegroundColor White
            Write-Host "   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agri_lending" -ForegroundColor Gray
            Write-Host ""
            Start-Process "https://www.mongodb.com/cloud/atlas/register"
            Read-Host "Press Enter to exit"
            exit
        }
        "3" {
            Write-Host "Exiting..." -ForegroundColor Yellow
            exit
        }
        default {
            Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
            exit
        }
    }
}

Write-Host ""
Write-Host "🌱 Creating test user..." -ForegroundColor Cyan
Set-Location backend
npm run seed

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🚀 Starting the application..." -ForegroundColor Cyan
    Set-Location ..
    
    Write-Host ""
    Write-Host "=================================" -ForegroundColor Green
    Write-Host "✅ Application is starting!" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Test User Credentials:" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "📧 Email:    test@farmer.com" -ForegroundColor White
    Write-Host "🔑 Password: Test@123" -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🌐 URLs:" -ForegroundColor Cyan
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "Backend:  http://localhost:5000" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the servers" -ForegroundColor Yellow
    Write-Host ""
    
    npm run dev
} else {
    Write-Host ""
    Write-Host "❌ Failed to create test user" -ForegroundColor Red
    Write-Host "Please check MongoDB connection and try again" -ForegroundColor Yellow
}
