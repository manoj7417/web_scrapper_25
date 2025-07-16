# Troubleshooting Guide

## Issue: No Data in API

If you're getting no data from `https://web-scrapper-25.onrender.com/api/tenders`, follow these steps:

## 🔍 Step 1: Check Health Endpoint

First, verify the server is running:
```bash
curl https://web-scrapper-25.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-16T06:52:59.353Z",
  "service": "eProcurement Scraper API",
  "version": "1.0.0"
}
```

## 🔍 Step 2: Check API Endpoint

Test the API endpoint:
```bash
curl https://web-scrapper-25.onrender.com/api/tenders
```

**If you get 404 error:**
- The server is running but using old `index.js` instead of `server.js`
- **Solution:** Redeploy with updated `render.yaml` (already fixed)

**If you get empty data:**
- The database is empty
- **Solution:** Run manual scraping

## 🔍 Step 3: Check Database

Run the database test locally:
```bash
npm run test-database
```

This will show:
- Database connection status
- Total number of tenders
- Sample tender data
- Recent tenders

## 🔍 Step 4: Manual Scraping

If the database is empty, run manual scraping:
```bash
npm run manual-scrape
```

This will:
- Connect to the database
- Run the scraper
- Save tenders to database
- Show results

## 🔍 Step 5: Check Render Logs

1. Go to your Render dashboard
2. Click on your service
3. Go to "Logs" tab
4. Look for:
   - Chrome installation errors
   - Scraping errors
   - Database connection errors

## 🔍 Step 6: Test Locally

Run the server locally to test:
```bash
npm start
```

Then test:
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/tenders
```

## 🔍 Step 7: Common Issues & Solutions

### Issue 1: 404 Error on API
**Cause:** Server using old `index.js` instead of `server.js`
**Solution:** 
- Updated `render.yaml` to use `node server.js`
- Redeploy the application

### Issue 2: Empty Database
**Cause:** Scraper hasn't run or failed
**Solution:**
- Run manual scraping: `npm run manual-scrape`
- Check Chrome installation in logs
- Verify target website is accessible

### Issue 3: Chrome Installation Failed
**Cause:** Chrome not properly installed on Render
**Solution:**
- Check build logs for Chrome installation
- Verify `render.yaml` has correct Chrome setup
- Test Chrome locally: `npm run test-chrome`

### Issue 4: Database Connection Failed
**Cause:** MongoDB URI not set or incorrect
**Solution:**
- Check `MONGODB_URI` environment variable in Render
- Test database connection: `npm run test-database`
- Verify MongoDB Atlas connection string

### Issue 5: Scraping Failed
**Cause:** Target website changed or blocked
**Solution:**
- Check if target website is accessible
- Update selectors in `services/scraper.js`
- Add delays and better error handling

## 🔍 Step 8: Debug Commands

### Test Chrome Installation
```bash
npm run test-chrome
```

### Test Database Connection
```bash
npm run test-database
```

### Test Deployment
```bash
npm run test-deployment
```

### Manual Scraping
```bash
npm run manual-scrape
```

### Debug Chrome Issues
```bash
npm run debug-chrome
```

## 🔍 Step 9: API Testing

### Test All Endpoints
```bash
# Health check
curl https://web-scrapper-25.onrender.com/health

# Get tenders
curl https://web-scrapper-25.onrender.com/api/tenders

# Search tenders
curl "https://web-scrapper-25.onrender.com/api/search?q=construction"

# Get statistics
curl https://web-scrapper-25.onrender.com/api/stats

# Manual scraping
curl -X POST https://web-scrapper-25.onrender.com/api/scrape
```

## 🔍 Step 10: Expected API Response

When working correctly, you should get:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60f1a2b3c4d5e6f7g8h9i0j1",
      "title": "Construction of Highway Bridge",
      "publishedDate": "2025-01-15",
      "bidSubmissionClosingDate": "2025-02-15",
      "tenderOpeningDate": "2025-02-16",
      "organisationName": "Ministry of Road Transport",
      "tenderLink": "https://example.com/tender/123",
      "corrigendum": "",
      "scrapedAt": "2025-01-16T05:10:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## 🔍 Step 11: Next Steps

1. **If health check works but API returns 404:**
   - Redeploy with updated `render.yaml`

2. **If API works but returns empty data:**
   - Run manual scraping
   - Check database connection

3. **If scraping fails:**
   - Check Chrome installation
   - Verify target website accessibility
   - Update selectors if needed

4. **If everything works:**
   - Set up automated scraping
   - Monitor logs regularly
   - Add more error handling

## 🔍 Step 12: Monitoring

After fixing the issues:
- Monitor Render logs regularly
- Set up alerts for scraping failures
- Check API response times
- Monitor database size and performance

This troubleshooting guide should help you identify and fix the issue with your API returning no data. 