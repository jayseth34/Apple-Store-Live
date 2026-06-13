# Render Deployment Setup Guide

## What's New

✅ **render.yaml** file has been created with:
- **Persistent disk**: 10GB storage at `/app/backend/data` (survives redeploys)
- **Backend service**: Express.js API with automatic build and deploy
- **Frontend service**: Angular static site deployment
- **Health checks**: Automatic monitoring
- **Environment variables**: Pre-configured (update values in Render dashboard)

## Setup Steps

### 1. Push Changes to GitHub

```bash
git add .
git commit -m "Add render.yaml for persistent storage and remove seeded data"
git push origin main
```

### 2. Go to Render Dashboard

Visit: https://dashboard.render.com

### 3. Create New Service (if not already connected)

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Render will automatically detect `render.yaml`
4. Click **"Create Web Services"**

### 4. Update Environment Variables

In Render Dashboard for your backend service:

1. Go to **Settings** → **Environment**
2. Update these values:

| Variable | Where to Get |
|----------|--------------|
| `FRONTEND_ORIGIN` | Your frontend domain (e.g., `https://apple-store-fe.onrender.com`) |
| `ADMIN_SECRET` | Create a strong password |
| `RAZORPAY_KEY_ID` | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | From Razorpay dashboard |

### 5. Deploy

1. Push any change to `main` branch, OR
2. Click **"Redeploy"** in Render Dashboard

### 6. Verify Data Persistence

1. Add a product through the admin panel
2. Click **"Redeploy"** (or push new code)
3. Product should still exist after redeploy ✅

## Architecture

```
Render Services:
├── Backend (Node.js)
│   ├── Express API
│   ├── Persistent Disk (10GB)
│   │   └── data/db.json (your database)
│   └── uploads/ (product images)
│
└── Frontend (Angular)
    ├── Static Site
    └── Calls backend API
```

## Key Points

✅ **No Seeded Data** - Database starts empty  
✅ **Persistent Storage** - Data survives redeployments  
✅ **Auto-Deploy** - Push to GitHub, Render auto-deploys  
✅ **Production Ready** - Free tier can handle small stores  

## Monitoring

In Render Dashboard:

- **Logs** - See what's happening (Debug → Logs)
- **Metrics** - Check CPU, Memory, Storage usage
- **Deployments** - View deployment history
- **Health** - Green checkmark = working

## If Data Disappears

If you see data missing after a redeploy:

1. Check that disk is mounted: **Settings** → **Disk**
2. Verify persistence disk exists: `apple-store-data`
3. Check logs for errors: **Logs**
4. Contact Render support if disk is corrupted

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Render auto-detects render.yaml
3. ✅ Update environment variables
4. ✅ Watch deployment in dashboard
5. ✅ Test by adding products
6. ✅ Redeploy to verify persistence

## Support

- **Render Docs**: https://render.com/docs
- **render.yaml Reference**: https://render.com/docs/infrastructure-as-code
