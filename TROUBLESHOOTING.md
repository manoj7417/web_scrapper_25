# API Troubleshooting Guide

## Issue: API endpoints returning 404 errors

### Current Status
- Health endpoint (`/health`) is working ✅
- API endpoints (`/api/tenders`, `/api/stats`) are returning 404 ❌

### Possible Causes

1. **Database Connection Issues**
   - MongoDB URI not configured
   - Database connection failing
   - Network connectivity issues

2. **Server Startup Issues**
   - Server failing to start due to database errors
   - Environment variables not set correctly
   - Port conflicts

3. **Route Configuration Issues**
   - Routes not properly mounted
   - Middleware conflicts
   - Express app configuration problems

### Diagnostic Steps

#### 1. Check Health Endpoint
```bash
curl https://web-scrapper-25.onrender.com/health
```
Expected: `{"status":"healthy",...}`

#### 2. Check API Endpoints
```bash
curl https://web-scrapper-25.onrender.com/api/tenders
curl https://web-scrapper-25.onrender.com/api/stats
```

#### 3. Check Debug Information
```bash
curl https://web-scrapper-25.onrender.com/debug
```

### Solutions

#### Solution 1: Use Diagnostic Server (Temporary)
The `diagnose.js` server provides basic API endpoints without database dependency.

#### Solution 2: Fix Database Connection
1. Set `MONGODB_URI` environment variable in Render
2. Use a valid MongoDB connection string
3. Ensure database is accessible from Render

#### Solution 3: Graceful Error Handling
The updated `server.js` and `api.js` now handle database connection failures gracefully.

### Environment Variables Required

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
NODE_ENV=production
PORT=3000
```

### Testing Locally

1. **Test Database Connection**
```bash
node test-database.js
```

2. **Test API Locally**
```bash
node diagnose.js
# Then visit http://localhost:3000/api/tenders
```

3. **Test Full Server**
```bash
node server.js
# Then visit http://localhost:3000/api/tenders
```

### Deployment Commands

#### Current Render Configuration
- **Start Command**: `node diagnose.js` (temporary)
- **Health Check**: `/health`
- **Build Command**: Includes Chrome installation and tests

#### To Switch Back to Full Server
Change `render.yaml`:
```yaml
startCommand: node server.js
```

### Monitoring

1. **Check Render Logs**
   - Go to Render dashboard
   - View deployment logs
   - Check for error messages

2. **Check API Status**
   - Health endpoint: `/health`
   - Debug endpoint: `/debug`
   - API endpoints: `/api/tenders`, `/api/stats`

### Common Issues and Fixes

#### Issue: "Database not connected"
**Fix**: Set `MONGODB_URI` environment variable in Render

#### Issue: "Route not found"
**Fix**: Check if server is starting correctly, verify route definitions

#### Issue: "Internal server error"
**Fix**: Check server logs, verify database connection

### Next Steps

1. Deploy with diagnostic server to verify basic functionality
2. Set up MongoDB Atlas database
3. Configure environment variables
4. Switch back to full server with database
5. Test scraping functionality

### Contact Information

If issues persist, check:
- Render deployment logs
- MongoDB Atlas connection
- Environment variable configuration 