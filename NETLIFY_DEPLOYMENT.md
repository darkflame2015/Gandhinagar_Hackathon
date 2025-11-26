# Netlify Deployment Guide

## ✅ Preparation Complete

All Netlify configuration files have been created and pushed to GitHub:
- ✅ `netlify.toml` - Build configuration
- ✅ `frontend/public/_redirects` - SPA routing
- ✅ `frontend/.env.production` - Environment variables template
- ✅ `frontend/vite.config.ts` - Optimized build settings

## 📋 Deployment Steps

### Step 1: Deploy Backend (REQUIRED FIRST)

⚠️ **IMPORTANT**: Netlify only hosts static frontend. You MUST deploy the backend separately first.

#### Option A: Deploy to Render (Recommended - Free tier with SQLite)
1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: agrilend-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click "Create Web Service"
6. **Copy your backend URL** (e.g., `https://agrilend-backend.onrender.com`)

#### Option B: Deploy to Railway
1. Go to https://railway.app and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - **Root Directory**: `/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click "Deploy"
6. Go to Settings → Generate Domain
7. **Copy your backend URL** (e.g., `https://agrilend-backend.railway.app`)

#### Option C: Deploy to Heroku
1. Go to https://heroku.com and sign up
2. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
3. Run these commands:
```bash
cd d:\hackathon_gandhinagar
heroku login
heroku create agrilend-backend
git subtree push --prefix backend heroku main
```
4. **Copy your backend URL** (e.g., `https://agrilend-backend.herokuapp.com`)

### Step 2: Update Environment Variables

1. Open `frontend/.env.production`
2. Replace the placeholder with your actual backend URL:
```env
VITE_API_URL=https://your-backend-url.com/api
```
Example:
```env
VITE_API_URL=https://agrilend-backend.onrender.com/api
```

3. Save the file and commit:
```bash
cd d:\hackathon_gandhinagar
git add frontend/.env.production
git commit -m "Update production API URL"
git push origin main
```

### Step 3: Deploy Frontend to Netlify

#### Method 1: Using Netlify UI (Easiest)
1. Go to https://netlify.com and sign up
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify to access your repository
5. Select `darkflame2015/Gandhinagar_Hackathon`
6. Netlify will auto-detect settings from `netlify.toml`:
   - **Base directory**: frontend
   - **Build command**: npm run build
   - **Publish directory**: dist
7. Click "Deploy site"

#### Method 2: Using Netlify CLI
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd d:\hackathon_gandhinagar
netlify deploy --prod
```

### Step 4: Configure Environment Variables in Netlify

1. In Netlify dashboard, go to your site
2. Click "Site settings" → "Environment variables"
3. Click "Add a variable"
4. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.com/api` (from Step 1)
5. Click "Save"
6. Go to "Deploys" → "Trigger deploy" → "Deploy site"

### Step 5: Test Your Deployment

1. Once deployed, click "Open production deploy" in Netlify
2. Test these features:
   - ✅ Login with: test@farmer.com / Test@123
   - ✅ Dashboard loads with all cards
   - ✅ Weather page shows forecast
   - ✅ Market Prices displays data
   - ✅ Insurance page loads products
   - ✅ Forecast Analysis shows charts

## 🔧 Troubleshooting

### Issue: "Failed to fetch" errors
**Solution**: Check that `VITE_API_URL` in Netlify environment variables matches your backend URL exactly (including `/api` at the end)

### Issue: Blank page or 404 errors
**Solution**: The `_redirects` file ensures SPA routing works. Make sure it's in `frontend/public/_redirects`

### Issue: Build fails
**Solution**: 
1. Check build logs in Netlify dashboard
2. Ensure `frontend/package.json` has all dependencies
3. Try building locally: `cd frontend && npm run build`

### Issue: Backend not responding
**Solution**: 
1. Check your backend service (Render/Railway/Heroku) is running
2. Visit `https://your-backend-url.com/api/health` to test
3. Check backend logs for errors

## 📊 Environment Variables Summary

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.com/api
```

### Backend (on Render/Railway/Heroku)
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secret-key-here
OPENWEATHER_API_KEY=your-openweather-key (optional)
```

## 🚀 Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment
- Netlify rebuilds and deploys frontend automatically
- Backend services also auto-deploy on push (if configured)

## 📱 Your Deployed URLs

After deployment, you'll have:
- **Frontend**: https://your-site-name.netlify.app
- **Backend**: https://your-backend-url.com
- **GitHub**: https://github.com/darkflame2015/Gandhinagar_Hackathon

## ✨ Production Optimizations Included

✅ **Build Optimizations**:
- Vendor code splitting (React, MUI, Redux, Charts)
- Chunk size limit: 1000KB
- Asset caching: 1 year for static files
- Gzip compression enabled

✅ **Security**:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: no-referrer

✅ **Performance**:
- SPA routing with _redirects
- Optimized asset loading
- CDN distribution via Netlify

## 📞 Need Help?

If you encounter issues:
1. Check Netlify build logs
2. Check backend service logs
3. Test API endpoints directly in browser
4. Verify environment variables are set correctly

---

**Next Steps**: Follow Step 1 to deploy your backend first, then proceed with Netlify deployment!
