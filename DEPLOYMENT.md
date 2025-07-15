# Deployment Guide

This guide will help you deploy the eProcurement Scraper to Render and other platforms.

## 🚀 Render Deployment

### 1. Prerequisites

- GitHub repository with your code
- MongoDB database (local or cloud)
- Render account

### 2. Environment Variables

Set these environment variables in Render:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eprocurement
NODE_ENV=production
PORT=3000
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

### 3. Render Configuration

The project includes:
- `render.yaml` - Render configuration
- `start.js` - Production start script
- `server.js` - HTTP server for health checks
- `Procfile` - Alternative deployment config
- `Dockerfile` - Docker deployment option

### 4. Deployment Steps

1. **Connect GitHub Repository**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: eprocurement-scraper
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node start.js`
   - **Health Check Path**: `/`

3. **Set Environment Variables**
   - Add `MONGODB_URI` with your MongoDB connection string
   - Add `NODE_ENV=production`
   - Add `PORT=3000`
   - Add `PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome`
   - Add `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy

## 🔧 Build Verification

### Local Build Test

```bash
# Check build configuration
npm run build-check

# Test full build
npm run build

# Test Chrome installation
npm run test-chrome

# Test start script
npm start
```

### Build Requirements

- ✅ Node.js >= 18.0.0
- ✅ npm >= 8.0.0
- ✅ All required files present
- ✅ Dependencies installed
- ✅ MongoDB connection configured
- ✅ Chrome/Puppeteer working

## 📋 File Structure for Deployment

```
├── start.js              # Production start script
├── server.js             # HTTP server for health checks
├── index.js              # Development entry point
├── config.js             # Configuration
├── package.json          # Dependencies and scripts
├── render.yaml           # Render configuration
├── Procfile              # Alternative deployment
├── Dockerfile            # Docker deployment
├── .gitignore            # Git ignore rules
├── env.example           # Environment variables example
├── build-check.js        # Build verification
├── test-chrome.js        # Chrome installation test
├── services/
│   └── scraper.js       # Main scraping logic
├── utils/
│   ├── database.js      # Database utilities
│   └── logger.js        # Logging utilities
└── models/
    └── Tender.js        # Database model
```

## 🛠️ Troubleshooting

### Common Render Issues

1. **Build Fails**
   ```bash
   # Check build locally
   npm run build-check
   ```

2. **Dependencies Missing**
   ```bash
   # Reinstall dependencies
   npm install
   ```

3. **MongoDB Connection Fails**
   - Verify MongoDB URI is correct
   - Check network connectivity
   - Ensure database exists

4. **Puppeteer/Chrome Issues**
   ```bash
   # Test Chrome installation
   npm run test-chrome
   ```
   
   **Common Chrome Errors:**
   - **"Could not find Chrome"**: Set `PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome`
   - **"Permission denied"**: Add `--no-sandbox` and `--disable-setuid-sandbox` args
   - **"Memory issues"**: Reduce page limits in production

5. **Health Check Fails**
   - Verify `/` endpoint returns 200
   - Check server.js is working
   - Review logs for errors

### Chrome Troubleshooting

**If you get Chrome errors in Render:**

1. **Set Environment Variables:**
   ```env
   PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   ```

2. **Alternative Chrome Paths:**
   - `/usr/bin/google-chrome`
   - `/usr/bin/chromium-browser`
   - `/usr/bin/chromium`
   - `/opt/google/chrome/chrome`

3. **Test Chrome Locally:**
   ```bash
   npm run test-chrome
   ```

4. **Use Docker (Alternative):**
   ```bash
   # Build Docker image
   docker build -t eprocurement-scraper .
   
   # Run container
   docker run -p 3000:3000 -e MONGODB_URI=your_uri eprocurement-scraper
   ```

### Environment Variables

Required for production:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eprocurement
NODE_ENV=production
PORT=3000
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

Optional:
```env
LOG_LEVEL=info
```

### Logs and Monitoring

- **Render Logs**: Available in Render dashboard
- **Application Logs**: Check console output
- **Health Check**: Visit `/health` endpoint
- **Database**: Monitor MongoDB connection
- **Chrome Test**: Run `npm run test-chrome`

## 🔄 Continuous Deployment

### GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. **Automatic Deployment**
   - Render automatically detects changes
   - Builds and deploys new version
   - Health checks ensure service is running

### Manual Deployment

1. **Trigger Manual Deploy**
   - Go to Render dashboard
   - Click "Manual Deploy"
   - Select branch/commit

2. **Rollback if Needed**
   - Go to deployment history
   - Click "Rollback" on previous version

## 📊 Monitoring

### Health Check Endpoints

- `GET /` - Main health check
- `GET /health` - Detailed health status

### Expected Response

```json
{
  "status": "healthy",
  "service": "eProcurement Scraper",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔒 Security

### Environment Variables

- Never commit `.env` files
- Use Render's environment variable system
- Rotate MongoDB credentials regularly

### Database Security

- Use MongoDB Atlas for production
- Enable network access controls
- Use strong passwords
- Enable SSL connections

## 📈 Performance

### Production Optimizations

- Limited to 5 pages in production
- 2-second delays between requests
- Headless browser mode
- Graceful error handling
- Disabled images/CSS for faster loading

### Resource Limits

- Render free tier: 750 hours/month
- Memory: 512MB
- CPU: Shared
- Storage: 1GB

## 🆘 Support

### Debug Commands

```bash
# Check build
npm run build-check

# Test database
npm test

# Test Chrome
npm run test-chrome

# Debug issues
npm run debug

# Test scraping
npm start
```

### Common Issues

1. **Build Timeout**: Increase build timeout in Render
2. **Memory Issues**: Optimize Puppeteer settings
3. **Database Timeout**: Check MongoDB connection string
4. **Health Check Fails**: Verify server.js is working
5. **Chrome Not Found**: Set `PUPPETEER_EXECUTABLE_PATH`

## 📝 Notes

- The scraper runs once on startup
- HTTP server keeps the service alive
- Health checks ensure service availability
- Logs are available in Render dashboard
- Environment variables are securely stored
- Chrome is automatically detected and configured 