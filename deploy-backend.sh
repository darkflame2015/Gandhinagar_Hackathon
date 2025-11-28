#!/bin/bash
# Quick Backend Deployment Setup Script

echo "🚀 AgriLend Backend Deployment Helper"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"
echo ""

# Test backend build
echo "📦 Testing backend build..."
cd backend
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful!"
else
    echo "❌ Backend build failed. Please fix errors before deploying."
    exit 1
fi

echo ""
echo "🎉 Backend is ready for deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://render.com and sign up"
echo "2. Create a new Web Service"
echo "3. Connect your GitHub repository: darkflame2015/Gandhinagar_Hackathon"
echo "4. Configure:"
echo "   - Root Directory: backend"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm start"
echo "5. Add environment variables:"
echo "   - NODE_ENV=production"
echo "   - PORT=5000"
echo "   - JWT_SECRET=<generate-a-secure-key>"
echo ""
echo "📖 Full instructions in BACKEND_DEPLOYMENT.md"
