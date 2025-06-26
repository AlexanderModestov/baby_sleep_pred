# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Deployment Steps

### 1. Prepare Your Repository

Make sure all files are committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from root directory
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: baby-sleep-tracker
# - Directory: ./
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure settings:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/build`

### 3. Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

```
GEMINI_API_KEY=your_actual_gemini_api_key_here
NODE_ENV=production
```

### 4. Configure Custom Domains (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## File Structure for Vercel

```
baby_sleep_pred/
├── vercel.json                 # Main deployment config
├── client/
│   ├── vercel.json            # Frontend config
│   ├── .env.production        # Production environment
│   └── build/                 # Built React app
├── server/
│   ├── vercel.json            # Backend config
│   ├── api/
│   │   └── index.js           # Serverless entry point
│   └── index.js               # Main server file
└── DEPLOYMENT.md              # This file
```

## Environment Variables Needed

### Production (Vercel)
- `GEMINI_API_KEY`: Your Google Gemini API key
- `NODE_ENV`: Set to "production"

### Development (Local)
- `GEMINI_API_KEY`: Your Google Gemini API key  
- `PORT`: 3001
- `DB_PATH`: ./database.sqlite

## Database Considerations

**Important**: SQLite files don't persist on Vercel's serverless functions. For production, consider:

1. **Vercel Postgres** (Recommended)
2. **PlanetScale**
3. **Supabase**
4. **MongoDB Atlas**

## Troubleshooting

### Common Issues:

1. **API Routes Not Working**
   - Check that `/api/*` routes are properly configured
   - Verify `vercel.json` routing is correct

2. **Environment Variables Missing**
   - Redeploy after adding environment variables
   - Check variable names match exactly

3. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`

4. **Database Errors**
   - SQLite won't work in production on Vercel
   - Switch to a cloud database provider

### Logs and Debugging:
```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --follow
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Custom domain set up (optional)
- [ ] Database migrated to cloud provider
- [ ] Error monitoring enabled
- [ ] Performance testing completed
- [ ] Telegram Bot configured with production URL

## Updating Deployment

```bash
# For automatic deployments
git push origin main

# For manual deployments
vercel --prod
```

Your Baby Sleep Tracker will be available at:
- **Default**: `https://your-project-name.vercel.app`
- **Custom**: `https://your-domain.com` (if configured)