# Vercel Deployment Guide - Full Stack

## 🚀 Deploy Both Frontend & Backend to Vercel

### Prerequisites
- GitHub repository with latest code
- Vercel account (sign up at https://vercel.com)

---

## 📋 Step-by-Step Deployment

### 1. Push Latest Code to GitHub

All configuration files are ready:
- ✅ `vercel.json` - Vercel configuration
- ✅ `backend/api/index.js` - Serverless backend handler
- ✅ Frontend & Backend package.json updated

### 2. Deploy to Vercel

#### Option A: Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Sign Up/Login** with GitHub
3. **Import Project**:
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose: `darkflame2015/Gandhinagar_Hackathon`
   - Click "Import"

4. **Configure Project**:
   - **Framework Preset**: Other (or None)
   - **Root Directory**: Leave as `./` (root)
   - **Build Command**: (leave default, vercel.json handles it)
   - **Output Directory**: (leave default, vercel.json handles it)

5. **Environment Variables** (optional):
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `your-secret-key-here`
   - `OPENWEATHER_API_KEY` = `your-api-key` (optional)

6. **Click "Deploy"**

7. **Wait 2-3 minutes** for deployment

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd d:\hackathon_gandhinagar
vercel --prod
```

---

## ✅ What Happens During Deployment

### Backend (Serverless Functions)
1. Builds TypeScript: `tsc` → creates `dist/` folder
2. Creates serverless function at `/api/*`
3. Handles all API requests through `backend/api/index.js`

### Frontend (Static Site)
1. Installs dependencies
2. Builds React app: `npm run build`
3. Outputs to `frontend/dist/`
4. Serves static files

### Routing
- `/api/*` → Backend serverless functions
- `/*` → Frontend static files

---

## 🎯 After Deployment

### Your URLs
```
Production URL: https://your-project-name.vercel.app
API Endpoint: https://your-project-name.vercel.app/api
```

### Test Endpoints

**Health Check:**
```
https://your-project-name.vercel.app/api/health
```

**Login:**
```
https://your-project-name.vercel.app/api/auth/login
```

### Test Login
1. Go to your Vercel URL
2. Login with:
   - Email: `test@farmer.com`
   - Password: `Test@123`
3. Should redirect to dashboard ✅

---

## 🔧 Configuration Files

### `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build"
    },
    {
      "src": "backend/package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/dist/$1"
    }
  ]
}
```

### API Handler: `backend/api/index.js`
- Express app wrapped as serverless function
- Handles all `/api/*` routes
- Includes CORS, helmet, database initialization

---

## 🎨 Advantages of Vercel Deployment

✅ **Single Domain**: Frontend and backend on same domain (no CORS issues!)
✅ **Fast Deploy**: Auto-deploys on Git push
✅ **Serverless**: Scales automatically
✅ **Free Tier**: Generous free tier for projects
✅ **SSL**: HTTPS enabled by default
✅ **Global CDN**: Fast worldwide

---

## 🔄 Automatic Deployments

After initial setup:
- Every `git push` to `main` triggers deployment
- Preview deployments for PRs
- Rollback to previous versions anytime

---

## 📊 Monitoring

After deployment, monitor in Vercel Dashboard:
- **Deployments**: See build logs
- **Functions**: Monitor serverless function performance
- **Analytics**: View traffic and performance
- **Logs**: Real-time logs for debugging

---

## 🆘 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies in package.json
- Verify TypeScript compiles: `cd backend && npm run build`

### API Not Working
- Check function logs in Vercel dashboard
- Verify routes in vercel.json
- Test API endpoint directly

### Database Issues
- SQLite works in serverless but data doesn't persist between invocations
- Consider upgrading to PostgreSQL for production
- Or use Vercel KV/Storage for persistence

---

## 🎉 Success Criteria

Deployment successful when:
- ✅ Build completes without errors
- ✅ Health endpoint responds: `/api/health`
- ✅ Login works with test credentials
- ✅ Dashboard loads with data
- ✅ All pages functional (Weather, Market, Insurance)

---

## 🚀 Next Steps

After successful deployment:
1. Share your Vercel URL
2. Test all features
3. Add custom domain (optional)
4. Set up monitoring/analytics

---

**Deploy now! All configuration is ready.** 🎊
