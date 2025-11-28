# Backend Deployment Guide 🚀

## 🎯 Quick Solution: Deploy Backend to Render (FREE)

Render is the easiest option for deploying your Node.js + SQLite backend with a free tier.

---

## ✅ Method 1: Render (Recommended - Easiest)

### Step-by-Step Instructions:

#### 1. Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (easiest)
3. Authorize Render to access your repositories

#### 2. Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `darkflame2015/Gandhinagar_Hackathon`
3. Click "Connect"

#### 3. Configure Service
Fill in these settings:

**Basic Settings:**
- **Name**: `agrilend-backend` (or any name you prefer)
- **Region**: Oregon (US West) - Free tier available
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Node

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Instance Type:**
- Select **"Free"** tier

#### 4. Environment Variables
Click **"Advanced"** and add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this-12345` |
| `OPENWEATHER_API_KEY` | *(optional - get from openweathermap.org)* |

**Important**: Change the `JWT_SECRET` to a random secure string!

#### 5. Deploy!
1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run `npm install && npm run build`
   - Start your server with `npm start`
3. Wait 2-3 minutes for deployment

#### 6. Get Your Backend URL
Once deployed, you'll see:
```
Your service is live at https://agrilend-backend.onrender.com
```

**Copy this URL!** You'll need it for the frontend.

#### 7. Test Your Backend
Visit these URLs to verify:
- Health Check: `https://agrilend-backend.onrender.com/health`
- API Health: `https://agrilend-backend.onrender.com/api/health`

You should see:
```json
{
  "status": "OK",
  "timestamp": "2025-11-28T...",
  "service": "Agri Lending Platform",
  "version": "1.0.0"
}
```

---

## 🔗 Step 8: Connect Frontend to Backend

### Update Frontend Environment Variable

1. Open `frontend/.env.production`
2. Update with your Render backend URL:
```env
VITE_API_URL=https://agrilend-backend.onrender.com/api
```

3. Commit and push:
```bash
cd d:\hackathon_gandhinagar
git add frontend/.env.production
git commit -m "Update production API URL with Render backend"
git push origin main
```

### Configure Netlify Environment Variable

1. Go to Netlify Dashboard
2. Click on your site
3. Go to **Site settings** → **Environment variables**
4. Click **"Add a variable"**
5. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://agrilend-backend.onrender.com/api`
6. Click **"Save"**

### Redeploy Netlify
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

---

## ⚡ Alternative Methods

### Method 2: Railway.app

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select `Gandhinagar_Hackathon`
5. Settings:
   - **Root Directory**: `/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add environment variables (same as Render)
7. Generate domain in Settings
8. Copy URL: `https://agrilend-backend.railway.app`

### Method 3: Vercel (Serverless)

⚠️ **Note**: Vercel requires converting to serverless functions. Not recommended for SQLite.

### Method 4: Heroku

1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Run commands:
```bash
cd d:\hackathon_gandhinagar
heroku login
heroku create agrilend-backend

# Deploy only the backend folder
git subtree push --prefix backend heroku main
```
3. Set environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
```

---

## 🔧 Troubleshooting

### Issue: "Application Error" on Render
**Solution**: Check build logs in Render dashboard. Common issues:
- Missing dependencies → Check `package.json`
- Port issues → Ensure using `process.env.PORT`
- Build failed → Check TypeScript compilation

### Issue: Database not persisting
**Solution**: Render free tier restarts services, which can reset SQLite. To fix:
- Use Render's persistent disk (paid tier)
- Or migrate to PostgreSQL (Render provides free PostgreSQL)

### Issue: Backend is slow to start
**Solution**: Render free tier "spins down" after 15 minutes of inactivity. First request takes ~30 seconds. This is normal for free tier.

### Issue: CORS errors
**Solution**: Your backend already has CORS configured. Verify in `backend/src/server.ts`:
```typescript
app.use(cors({
  origin: '*', // Update in production if needed
}));
```

---

## 📊 Production Checklist

Before going live, ensure:

- ✅ Backend deployed to Render/Railway
- ✅ Backend health endpoint working
- ✅ Environment variables set (NODE_ENV, JWT_SECRET)
- ✅ Frontend `.env.production` updated with backend URL
- ✅ Netlify environment variables configured
- ✅ Netlify redeployed with new settings
- ✅ Test login with: test@farmer.com / Test@123
- ✅ Test all pages: Dashboard, Weather, Market, Insurance

---

## 🎉 Success Criteria

Your deployment is complete when:

1. ✅ Backend URL responds: `https://your-backend.onrender.com/health`
2. ✅ Frontend loads: `https://your-site.netlify.app`
3. ✅ Login works and redirects to dashboard
4. ✅ All API calls succeed (check browser console for errors)
5. ✅ Weather, Market, Insurance pages display data

---

## 🚨 Free Tier Limitations

### Render Free Tier:
- ⏱️ Spins down after 15 minutes inactivity
- 🔄 Takes ~30 seconds for first request after spin-down
- 💾 750 hours/month (enough for 24/7 with restarts)
- 📦 No persistent disk (SQLite resets on restart)

### Solutions:
- Keep backend alive with a ping service (e.g., UptimeRobot)
- Migrate to PostgreSQL for production (Render offers free PostgreSQL)
- Upgrade to paid tier ($7/month) for persistent disk

---

## 📞 Need Help?

If deployment fails:
1. Check Render build logs
2. Verify all environment variables are set
3. Test backend locally: `cd backend && npm run build && npm start`
4. Check GitHub repository has all latest code

---

## 🎯 Quick Commands Summary

```bash
# Update frontend with backend URL
cd d:\hackathon_gandhinagar
echo "VITE_API_URL=https://your-backend.onrender.com/api" > frontend/.env.production
git add frontend/.env.production
git commit -m "Update production API URL"
git push origin main
```

Then configure the same URL in Netlify environment variables and redeploy!

---

**Your Next Step**: Go to https://render.com and follow Step 1-7 above! 🚀
