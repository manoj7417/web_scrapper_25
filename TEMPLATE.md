# Web Scraper Template for Other Projects

This template shows how to apply the eProcurement scraper pattern to other projects and create APIs to get data.

## 🚀 Quick Start for New Projects

### 1. Project Structure
```
your-project/
├── models/
│   └── YourModel.js          # MongoDB schema
├── services/
│   └── scraper.js            # Scraping logic
├── utils/
│   ├── database.js           # Database connection
│   └── logger.js             # Logging utility
├── api.js                    # Express API routes
├── server.js                 # Server startup
├── config.js                 # Configuration
├── package.json
└── render.yaml               # Deployment config
```

### 2. Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "puppeteer": "^22.0.0",
    "mongoose": "^8.1.0",
    "dotenv": "^16.4.0"
  }
}
```

### 3. Configuration (config.js)
```javascript
module.exports = {
  scraper: {
    url: 'https://your-target-website.com',
    headless: true,
    timeout: 30000,
    tableSelector: 'your-table-selector',
    // Add your specific selectors
    selectors: {
      title: 'h1',
      description: '.description',
      date: '.date',
      link: 'a[href]'
    }
  },
  database: {
    uri: process.env.MONGODB_URI
  }
};
```

### 4. Model Template (models/YourModel.js)
```javascript
const mongoose = require('mongoose');

const yourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  url: String,
  publishedDate: String,
  // Add your specific fields
  scrapedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Prevent duplicates
yourSchema.index({ title: 1, publishedDate: 1 }, { unique: true });

module.exports = mongoose.model('YourModel', yourSchema);
```

### 5. Scraper Template (services/scraper.js)
```javascript
const puppeteer = require('puppeteer');
const config = require('../config');
const logger = require('../utils/logger');
const YourModel = require('../models/YourModel');

class Scraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    try {
      const launchOptions = {
        headless: config.scraper.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      };

      this.browser = await puppeteer.launch(launchOptions);
      this.page = await this.browser.newPage();
      
      // Set user agent
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      logger.success('Browser launched');
    } catch (error) {
      logger.error('Failed to launch browser', error);
      throw error;
    }
  }

  async scrape() {
    try {
      await this.init();
      
      // Navigate to your target page
      await this.page.goto(config.scraper.url, {
        waitUntil: 'networkidle2',
        timeout: config.scraper.timeout
      });

      // Extract data using your selectors
      const data = await this.extractData();
      
      // Save to database
      const result = await this.saveData(data);
      
      return result;
    } catch (error) {
      logger.error('Scraping failed', error);
      throw error;
    } finally {
      await this.close();
    }
  }

  async extractData() {
    // Implement your data extraction logic
    const items = await this.page.$$(config.scraper.selectors.container);
    
    const data = [];
    for (const item of items) {
      const title = await item.$eval(config.scraper.selectors.title, el => el.textContent);
      const description = await item.$eval(config.scraper.selectors.description, el => el.textContent);
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
        await YourModel.create(item);
        saved++;
      } catch (error) {
        if (error.code === 11000) {
          duplicates++;
        } else {
          errors++;
          logger.error('Error saving item:', error);
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

### 6. API Template (api.js)
```javascript
const express = require('express');
const cors = require('cors');
const YourModel = require('./models/YourModel');
const Scraper = require('./services/scraper');
const logger = require('./utils/logger');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Your Scraper API'
  });
});

// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const items = await YourModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await YourModel.countDocuments(query);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Manual scraping
app.post('/api/scrape', async (req, res) => {
  try {
    const scraper = new Scraper();
    const result = await scraper.scrape();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = app;
```

## 🔧 Deployment Configuration

### render.yaml
```yaml
services:
  - type: web
    name: your-scraper
    env: node
    buildCommand: |
      npm install
      npx puppeteer browsers install chrome
      apt-get update -qq
      apt-get install -y -qq wget gnupg ca-certificates
      wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - > /dev/null 2>&1
      echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
      apt-get update -qq
      apt-get install -y -qq google-chrome-stable
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: PUPPETEER_EXECUTABLE_PATH
        value: /usr/bin/google-chrome-stable
    healthCheckPath: /health
```

## 📊 API Endpoints

### Available Endpoints
- `GET /health` - Health check
- `GET /api/items` - Get all items with pagination
- `GET /api/items/:id` - Get specific item
- `POST /api/scrape` - Manual scraping
- `GET /api/search?q=query` - Search items
- `GET /api/stats` - Get statistics

### Example Usage
```bash
# Get all items
curl https://your-app.onrender.com/api/items

# Search items
curl https://your-app.onrender.com/api/search?q=keyword

# Manual scraping
curl -X POST https://your-app.onrender.com/api/scrape

# Get statistics
curl https://your-app.onrender.com/api/stats
```

## 🎯 Common Use Cases

### 1. Job Listings Scraper
```javascript
// models/Job.js
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: String,
  location: String,
  salary: String,
  description: String,
  url: String,
  postedDate: String
});
```

### 2. News Scraper
```javascript
// models/News.js
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  author: String,
  category: String,
  publishedDate: String,
  url: String
});
```

### 3. Product Scraper
```javascript
// models/Product.js
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: String,
  description: String,
  category: String,
  url: String,
  imageUrl: String
});
```

## 🔄 Scheduling Scraping

### Option 1: Cron Jobs (Recommended)
```javascript
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

### Option 2: Render Cron Service
```yaml
services:
  - type: cron
    name: scraper-cron
    env: node
    schedule: "0 * * * *"
    buildCommand: npm install
    startCommand: node scrape.js
```

## 🛡️ Best Practices

1. **Rate Limiting**: Add delays between requests
2. **Error Handling**: Implement retry mechanisms
3. **Data Validation**: Validate scraped data
4. **Monitoring**: Add logging and alerts
5. **Respect Robots.txt**: Check website's robots.txt
6. **User Agents**: Use realistic user agents
7. **Proxy Rotation**: Use proxies for large-scale scraping

## 📈 Performance Optimization

1. **Headless Mode**: Always use headless for production
2. **Resource Blocking**: Block unnecessary resources
3. **Concurrent Scraping**: Use multiple pages for speed
4. **Database Indexing**: Index frequently queried fields
5. **Caching**: Cache API responses

## 🔍 Troubleshooting

### Common Issues
1. **Chrome not found**: Use the provided render.yaml configuration
2. **Memory issues**: Add `--disable-dev-shm-usage` flag
3. **Timeout errors**: Increase timeout values
4. **Duplicate data**: Use unique indexes in MongoDB

### Debug Commands
```bash
# Test Chrome installation
npm run test-chrome

# Test database connection
npm run test-connection

# Debug scraping
npm run debug-scraper
```

This template provides a solid foundation for building web scrapers with APIs that can be easily adapted to different projects and use cases. 