@echo off
REM Quick Backend Deployment Setup Script for Windows

echo.
echo 🚀 AgriLend Backend Deployment Helper
echo ======================================
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)

echo ✅ Project structure verified
echo.

REM Test backend build
echo 📦 Testing backend build...
cd backend
call npm install
call npm run build

if %errorlevel% equ 0 (
    echo ✅ Backend build successful!
) else (
    echo ❌ Backend build failed. Please fix errors before deploying.
    exit /b 1
)

cd ..
echo.
echo 🎉 Backend is ready for deployment!
echo.
echo 📋 Next Steps:
echo 1. Go to https://render.com and sign up
echo 2. Create a new Web Service
echo 3. Connect your GitHub repository: darkflame2015/Gandhinagar_Hackathon
echo 4. Configure:
echo    - Root Directory: backend
echo    - Build Command: npm install ^&^& npm run build
echo    - Start Command: npm start
echo 5. Add environment variables:
echo    - NODE_ENV=production
echo    - PORT=5000
echo    - JWT_SECRET=^<generate-a-secure-key^>
echo.
echo 📖 Full instructions in BACKEND_DEPLOYMENT.md
echo.
pause
