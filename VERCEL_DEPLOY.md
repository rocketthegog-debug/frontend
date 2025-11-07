# Frontend Vercel Deployment

This project is configured for Vercel deployment with SPA routing support.

## Features
- ✅ SPA routing (all routes serve index.html)
- ✅ Static asset caching
- ✅ Environment variable support

## Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel` in this directory
3. Set environment variable: `VITE_API_BASE_URL` in Vercel dashboard
4. Redeploy: `vercel --prod`

## Environment Variables
- `VITE_API_BASE_URL` - Backend API URL (e.g., https://your-backend.vercel.app/api)

