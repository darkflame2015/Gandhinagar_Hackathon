@echo off
echo.
echo ================================
echo   AgriLend Platform Launcher
echo ================================
echo.
echo This will start the AgriLend platform with test user
echo.

REM Check if MongoDB is accessible
echo Checking MongoDB connection...
mongosh --eval "db.version()" --quiet >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] MongoDB is not running!
    echo.
    echo Please install and start MongoDB first:
    echo   Option 1: Download from https://www.mongodb.com/try/download/community
    echo   Option 2: Use MongoDB Atlas free tier at https://www.mongodb.com/cloud/atlas
    echo.
    echo See SETUP_MONGODB.md for detailed instructions
    echo.
    pause
    exit /b 1
)

echo MongoDB is running!
echo.

REM Create test user
echo Creating test user...
cd backend
call npm run seed
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to create test user
    pause
    exit /b 1
)

echo.
echo ================================
echo   Test User Created!
echo ================================
echo.
echo Email:    test@farmer.com
echo Password: Test@123
echo.
echo ================================
echo   Starting Application...
echo ================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Press Ctrl+C to stop
echo.

cd ..
call npm run dev
