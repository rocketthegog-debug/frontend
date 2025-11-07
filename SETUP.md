# Setup Guide - CrickBuzz Frontend

This guide will help you set up the CrickBuzz frontend application on your local machine.

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/rocketthegog-debug/frontend.git
cd frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start development server
npm run dev
```

## Detailed Setup

### Step 1: Prerequisites

Ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
  - Check version: `node --version`
  - Download: https://nodejs.org/

- **npm** (comes with Node.js)
  - Check version: `npm --version`

- **Git**
  - Check version: `git --version`
  - Download: https://git-scm.com/

### Step 2: Clone Repository

```bash
git clone https://github.com/rocketthegog-debug/frontend.git
cd frontend
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### Step 4: Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open `.env` in your editor and configure:

```env
# Required: Backend API URL
VITE_API_BASE_URL=http://localhost:5001/api

# Optional: App Configuration
VITE_APP_NAME=CrickBuzz
VITE_MERCHANT_NAME=CrickBuzz
VITE_CURRENCY=₹

# Optional: UPI IDs (comma-separated)
VITE_UPI_IDS=your-upi@bank1,your-upi@bank2
```

**Important Notes:**
- Variables must start with `VITE_` to be accessible in the frontend
- Restart the dev server after changing `.env`
- Never commit `.env` file (it's in `.gitignore`)

### Step 5: Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Production
npm run build        # Create optimized build in dist/
```

## Backend Setup

Before using the frontend, ensure the backend server is running:

1. The backend should be running on the port specified in `VITE_API_BASE_URL`
2. Default backend URL: `http://localhost:5001/api`
3. Backend must have CORS enabled for the frontend origin

## Project Structure Overview

```
fronted/
├── public/              # Public assets (logo, etc.)
├── src/
│   ├── components/     # React components
│   │   ├── pages/      # Page components
│   │   │   ├── admin/  # Admin pages
│   │   │   └── ...     # User pages
│   │   └── ...         # Shared components
│   ├── services/       # API service functions
│   ├── config.js       # App configuration
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── .env                # Environment variables (create from .env.example)
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── tailwind.config.js  # Tailwind CSS configuration
```

## Common Issues & Solutions

### Issue: Port Already in Use

**Error:** `Port 5173 is already in use`

**Solution:**
```bash
# Option 1: Use different port
npm run dev -- --port 3000

# Option 2: Kill process on port 5173
# On Mac/Linux:
lsof -ti:5173 | xargs kill -9
# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Issue: Module Not Found

**Error:** `Cannot find module 'xxx'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Environment Variables Not Working

**Error:** Variables return `undefined`

**Solution:**
1. Ensure variables start with `VITE_` prefix
2. Restart dev server after changing `.env`
3. Check `.env` file is in root directory (same level as `package.json`)
4. Clear browser cache

### Issue: API Connection Failed

**Error:** `Failed to fetch` or CORS errors

**Solution:**
1. Verify backend server is running
2. Check `VITE_API_BASE_URL` in `.env` matches backend URL
3. Ensure backend has CORS enabled for frontend origin
4. Check network tab in browser DevTools for detailed error

### Issue: Build Fails

**Error:** Build errors during `npm run build`

**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## Development Tips

1. **Hot Module Replacement (HMR)**: Changes are reflected instantly
2. **React DevTools**: Install browser extension for debugging
3. **Console Logs**: Check browser console for errors and warnings
4. **Network Tab**: Monitor API requests in browser DevTools
5. **Tailwind IntelliSense**: Install VS Code extension for autocomplete

## Production Build

To create a production build:

```bash
npm run build
```

The optimized files will be in the `dist/` directory. These can be deployed to any static hosting service.

## Next Steps

After setup:
1. ✅ Verify backend is running
2. ✅ Test API connection
3. ✅ Create a test user account
4. ✅ Explore the application features
5. ✅ Check admin panel (if you have admin access)

## Need Help?

- Check the main [README.md](./README.md) for more information
- Review [ENV_SETUP.md](../ENV_SETUP.md) for environment variables
- Open an issue on GitHub for bugs or questions

---

Happy coding! 🚀

