# API Usage Guide

This guide shows how to use the eProcurement Scraper API and apply the pattern to other projects.

## 🚀 Current API Endpoints

### Base URL
```
https://web-scrapper-25.onrender.com
```

### Available Endpoints

#### 1. Health Check
```bash
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-16T05:10:00.000Z",
  "service": "eProcurement Scraper API",
  "version": "1.0.0"
}
```

#### 2. Get All Tenders
```bash
GET /api/tenders?page=1&limit=20&search=construction&organisation=government
```
**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search in title and organization
- `organisation` (optional): Filter by organization
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)
- `sortBy` (optional): Sort field (default: publishedDate)
- `sortOrder` (optional): asc/desc (default: desc)

**Response:**
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

#### 3. Get Tender by ID
```bash
GET /api/tenders/60f1a2b3c4d5e6f7g8h9i0j1
```

#### 4. Search Tenders
```bash
GET /api/search?q=construction&limit=10
```

#### 5. Get Statistics
```bash
GET /api/stats
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalTenders": 150,
    "todayTenders": 5,
    "topOrganisations": [
      {
        "_id": "Ministry of Road Transport",
        "count": 25
      },
      {
        "_id": "Department of Education",
        "count": 20
      }
    ]
  }
}
```

#### 6. Manual Scraping
```bash
POST /api/scrape
```
**Response:**
```json
{
  "success": true,
  "message": "Scraping completed",
  "data": {
    "saved": 15,
    "duplicates": 3,
    "errors": 0
  }
}
```

## 🔧 How to Apply to Other Projects

### Step 1: Create New Project Structure
```bash
mkdir my-scraper
cd my-scraper
npm init -y
```

### Step 2: Install Dependencies
```bash
npm install express cors puppeteer mongoose dotenv
```

### Step 3: Copy Template Files
Copy these files from your current project:
- `utils/database.js`
- `utils/logger.js`
- `api.js` (modify for your data)
- `server.js`
- `render.yaml`

### Step 4: Create Your Model
```javascript
// models/YourData.js
const mongoose = require('mongoose');

const yourDataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  url: String,
  publishedDate: String,
  // Add your specific fields
  scrapedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

yourDataSchema.index({ title: 1, publishedDate: 1 }, { unique: true });

module.exports = mongoose.model('YourData', yourDataSchema);
```

### Step 5: Create Your Scraper
```javascript
// services/scraper.js
const puppeteer = require('puppeteer');
const YourData = require('../models/YourData');
const logger = require('../utils/logger');

class Scraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    // Use the same Chrome setup as your current project
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    };

    this.browser = await puppeteer.launch(launchOptions);
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  }

  async scrape() {
    try {
      await this.init();
      
      // Navigate to your target website
      await this.page.goto('https://your-target-website.com');
      
      // Extract data using your selectors
      const data = await this.extractData();
      
      // Save to database
      return await this.saveData(data);
    } finally {
      await this.close();
    }
  }

  async extractData() {
    // Implement your data extraction logic
    const items = await this.page.$$('.item-selector');
    
    const data = [];
    for (const item of items) {
      const title = await item.$eval('.title', el => el.textContent);
      const description = await item.$eval('.description', el => el.textContent);
      // Extract other fields...
      
      data.push({ title, description });
    }
    
    return data;
  }

  async saveData(data) {
    let saved = 0;
    let duplicates = 0;
    let errors = 0;

    for (const item of data) {
      try {
        await YourData.create(item);
        saved++;
      } catch (error) {
        if (error.code === 11000) {
          duplicates++;
        } else {
          errors++;
        }
      }
    }

    return { saved, duplicates, errors };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = Scraper;
```

### Step 6: Update API Routes
```javascript
// api.js - Update the routes for your data
const YourData = require('./models/YourData');
const Scraper = require('./services/scraper');

// Update the routes to use YourData instead of Tender
app.get('/api/items', async (req, res) => {
  // Same logic but with YourData model
});

app.post('/api/scrape', async (req, res) => {
  // Same logic but with your scraper
});
```

### Step 7: Deploy to Render
1. Push your code to GitHub
2. Connect to Render
3. Use the same `render.yaml` configuration
4. Set your `MONGODB_URI` environment variable

## 📊 Example Use Cases

### 1. Job Listings Scraper
```javascript
// Target: LinkedIn, Indeed, etc.
// Model: Job listings with company, location, salary
// API: /api/jobs, /api/jobs/search?q=developer
```

### 2. News Scraper
```javascript
// Target: News websites
// Model: Articles with title, content, author, category
// API: /api/news, /api/news/category/technology
```

### 3. Product Scraper
```javascript
// Target: E-commerce sites
// Model: Products with name, price, description, category
// API: /api/products, /api/products/search?q=laptop
```

### 4. Real Estate Scraper
```javascript
// Target: Property websites
// Model: Properties with address, price, bedrooms, area
// API: /api/properties, /api/properties/location/mumbai
```

## 🔄 Scheduling and Automation

### Option 1: Render Cron Service
```yaml
# render.yaml
services:
  - type: cron
    name: scraper-cron
    env: node
    schedule: "0 */6 * * *"  # Every 6 hours
    buildCommand: npm install
    startCommand: node scrape.js
```

### Option 2: Node-cron in your main app
```javascript
// server.js
const cron = require('node-cron');
const Scraper = require('./services/scraper');

// Run every hour
cron.schedule('0 * * * *', async () => {
  try {
    const scraper = new Scraper();
    await scraper.scrape();
  } catch (error) {
    logger.error('Scheduled scraping failed:', error);
  }
});
```

## 🛡️ Best Practices

1. **Rate Limiting**: Add delays between requests
2. **Error Handling**: Implement retry mechanisms
3. **Data Validation**: Validate scraped data
4. **Monitoring**: Add logging and alerts
5. **Respect Robots.txt**: Check website's robots.txt
6. **User Agents**: Use realistic user agents
7. **Proxy Rotation**: Use proxies for large-scale scraping

## 📈 Performance Tips

1. **Headless Mode**: Always use headless for production
2. **Resource Blocking**: Block unnecessary resources
3. **Concurrent Scraping**: Use multiple pages for speed
4. **Database Indexing**: Index frequently queried fields
5. **Caching**: Cache API responses

## 🔍 Testing Your API

### Using curl
```bash
# Health check
curl https://your-app.onrender.com/health

# Get items
curl https://your-app.onrender.com/api/items

# Search
curl "https://your-app.onrender.com/api/search?q=keyword"

# Manual scraping
curl -X POST https://your-app.onrender.com/api/scrape
```

### Using JavaScript
```javascript
// Fetch tenders
const response = await fetch('https://your-app.onrender.com/api/tenders');
const data = await response.json();
console.log(data);

// Search tenders
const searchResponse = await fetch('https://your-app.onrender.com/api/search?q=construction');
const searchData = await searchResponse.json();
console.log(searchData);
```

### Using Python
```python
import requests

# Get tenders
response = requests.get('https://your-app.onrender.com/api/tenders')
data = response.json()
print(data)

# Search tenders
search_response = requests.get('https://your-app.onrender.com/api/search?q=construction')
search_data = search_response.json()
print(search_data)
```

This pattern can be applied to any website you want to scrape and create an API for! 