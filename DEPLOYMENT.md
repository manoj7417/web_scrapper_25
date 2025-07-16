# Deployment Guide for eProcurement Scraper

## Overview
This guide explains how to deploy the eProcurement Scraper to Render.com with proper Chrome installation.

## Problem Solved
The original deployment was failing because Chrome wasn't properly installed in the Render environment. The error was:
```
Could not find Chrome (ver. 127.0.6533.88). This can occur if either
1. you did not perform an installation before running the script (e.g. `npx puppeteer browsers install chrome`) or
2. your cache path is incorrectly configured (which is: /opt/render/.cache/puppeteer).
```

## Solution Implemented

### 1. Updated `render.yaml`
- Simplified build command to use a dedicated build script
- Set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` to avoid conflicts
- Configured proper Chrome executable path

### 2. Created `render-build.sh`
- Comprehensive build script that handles Chrome installation
- Installs both Puppeteer's bundled Chrome and system Chrome
- Verifies installation and provides detailed logging
- Exits with error if Chrome installation fails

### 3. Enhanced Chrome Detection
- Updated `services/scraper.js` to better detect Chrome executable
- Improved fallback mechanisms for different Chrome installations
- Better error handling and logging

### 4. Added Testing Scripts
- `test-chrome.js`: Tests Chrome installation and functionality
- `build-check.js`: Comprehensive build verification
- Health check endpoint at `/health`

## Deployment Process

### 1. Automatic Deployment (Recommended)
The app will automatically deploy when you push to your repository. The build process:

1. **Install Dependencies**: `npm install`
2. **Install Puppeteer Chrome**: `npx puppeteer browsers install chrome`
3. **Install System Chrome**: Uses `render-build.sh` to install Google Chrome
4. **Verify Installation**: Tests Chrome functionality
5. **Start Application**: Runs `node index.js`

### 2. Environment Variables
Make sure these are set in your Render dashboard:
- `NODE_ENV`: `production`
- `MONGODB_URI`: Your MongoDB connection string
- `PUPPETEER_EXECUTABLE_PATH`: `/usr/bin/google-chrome-stable`
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`: `true`

### 3. Health Check
The app provides a health check endpoint at `/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-16T04:55:21.308Z",
  "service": "eProcurement Scraper"
}
```

## Troubleshooting

### Chrome Installation Issues
If Chrome installation fails:

1. **Check Build Logs**: Look for Chrome installation errors in Render build logs
2. **Verify Paths**: Ensure `/usr/bin/google-chrome-stable` exists
3. **Test Locally**: Run `node test-chrome.js` to test Chrome functionality

### Common Issues

1. **"No Chrome executable found"**
   - Solution: The build script installs Chrome automatically
   - Check if `render-build.sh` executed successfully

2. **"Failed to launch browser"**
   - Solution: Chrome is installed but may need additional arguments
   - The scraper includes comprehensive Chrome arguments for Render

3. **Database Connection Issues**
   - Ensure `MONGODB_URI` is set correctly
   - Check if MongoDB is accessible from Render

## Monitoring

### Build Verification
The build process includes multiple verification steps:
- Chrome installation verification
- Chrome functionality testing
- Database connection testing
- Application startup testing

### Logs
Monitor these logs in Render:
- Build logs: Chrome installation progress
- Application logs: Scraping progress and errors
- Health check: Application status

## Performance Optimizations

### Chrome Arguments
The scraper uses optimized Chrome arguments for Render:
- `--no-sandbox`: Required for containerized environments
- `--disable-dev-shm-usage`: Prevents memory issues
- `--disable-gpu`: Reduces resource usage
- Additional flags for stability and performance

### Resource Management
- Headless mode for reduced memory usage
- Request interception to block unnecessary resources
- Proper browser cleanup after scraping

## Rollback Strategy
If deployment fails:
1. Check build logs for specific errors
2. Verify environment variables
3. Test Chrome installation manually
4. Rollback to previous working version if needed

## Support
For deployment issues:
1. Check Render documentation: https://render.com/docs
2. Review build logs for specific error messages
3. Test Chrome installation locally with Docker
4. Contact support with specific error details 