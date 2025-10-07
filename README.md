# eProcurement Scraper

Simple Node.js scraper for Indian Government eProcurement portal using Puppeteer and MongoDB with pagination support.

## Features

- 🕷️ **Puppeteer scraping** with headless browser
- 📊 **MongoDB storage** with duplicate prevention
- 📄 **Pagination support** to scrape multiple pages
- 📝 **Clean logging** with timestamps
- 🛡️ **Error handling** for all operations
- 🚀 **Easy to run** with `node index.js`

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up MongoDB**

   - Install MongoDB locally or use MongoDB Atlas
   - Create database named `eprocurement`

3. **Create `.env` file**
   ```env
   MONGODB_URI=mongodb://localhost:27017/eprocurement
   ```

## Usage

### Run scraper (single page)

```bash
npm start
```

### Run paginated scraper (multiple pages)

```bash
npm run pages
```

### Scrape specific page range

```bash
# Scrape pages 1-5 (default)
npm run pages

# Scrape pages 2-6
node scrape-pages.js 2 5

# Scrape pages 10-15
node scrape-pages.js 10 5
```

### Development mode

```bash
npm run dev
```

### Automatic scheduling

The app can auto-scrape on a cron schedule using an in-process scheduler. Configure via environment variables:

```
SCRAPE_SCHEDULER_ENABLED=true   # enable/disable scheduler
SCRAPE_CRON=0 */6 * * *         # cron expression (every 6 hours)
SCRAPE_CRON_TZ=UTC              # timezone
SCRAPE_ON_BOOT=true             # run a scrape once at startup
```

By default, it runs every 6 hours and once at boot. Overlapping runs are prevented.

### Test database connection

```bash
npm test
```

### Debug issues

```bash
npm run debug
```

## Project Structure

```
├── index.js              # Main entry point
├── config.js             # Configuration
├── package.json          # Dependencies
├── scrape-pages.js       # Pagination script
├── models/
│   └── Tender.js        # Database model
├── services/
│   └── scraper.js       # Scraping logic
└── utils/
    ├── database.js       # Database utilities
    └── logger.js         # Logging utilities
```

## Data Extracted

- Serial Number
- Published Date
- Bid Submission Closing Date
- Tender Opening Date
- Title (with link)
- Organisation Name
- Corrigendum

## Configuration

Edit `config.js` to modify:

- Target URL
- Timeout settings
- Browser options
- Pagination settings:
  ```javascript
  pagination: {
    enabled: true,
    startPage: 1,
    maxPages: 10,        // Maximum pages to scrape
    delayBetweenPages: 2000  // Delay between pages (ms)
  }
  ```

## Pagination Features

- **Multi-page scraping**: Automatically scrapes multiple pages
- **Configurable range**: Set start page and maximum pages
- **Respectful delays**: 2-second delay between pages
- **Error handling**: Continues if one page fails
- **Progress tracking**: Shows progress for each page
- **Duplicate prevention**: Prevents duplicates across all pages

## Logging

The scraper provides detailed logs:

```
[2024-01-15T10:30:00.000Z] INFO: 🚀 Starting eProcurement Scraper...
[2024-01-15T10:30:01.000Z] SUCCESS: Database connected
[2024-01-15T10:30:02.000Z] SUCCESS: Browser launched
[2024-01-15T10:30:03.000Z] INFO: Navigating to page 1: https://eprocure.gov.in/cppp/latestactivetendersnew/cpppdata
[2024-01-15T10:30:04.000Z] SUCCESS: Page 1 loaded
[2024-01-15T10:30:05.000Z] INFO: Page 1: Found 10 rows
[2024-01-15T10:30:06.000Z] SUCCESS: Page 1: Extracted 10 tenders
[2024-01-15T10:30:08.000Z] INFO: Navigating to page 2: https://eprocure.gov.in/cppp/latestactivetendersnew/cpppdata?page=2
[2024-01-15T10:30:09.000Z] SUCCESS: Page 2 loaded
[2024-01-15T10:30:10.000Z] INFO: Page 2: Found 10 rows
[2024-01-15T10:30:11.000Z] SUCCESS: Page 2: Extracted 10 tenders
[2024-01-15T10:30:12.000Z] SUCCESS: Pagination completed: 2 pages, 20 total tenders
[2024-01-15T10:30:13.000Z] SUCCESS: Database operation completed
[2024-01-15T10:30:14.000Z] SUCCESS: 🎉 Scraping completed!
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**

   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Puppeteer Launch Failed**

   - Install system dependencies
   - Check browser installation

3. **No Data Extracted**

   - Verify target URL is accessible
   - Check website structure changes

4. **Pagination Issues**
   - Check if pagination is enabled in config
   - Verify page URLs are accessible
   - Increase delay between pages if needed

## License

MIT License
