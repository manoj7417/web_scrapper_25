const Scraper = require('./services/scraper');
const database = require('./utils/database');
const logger = require('./utils/logger');

async function scrapePages(startPage = 1, maxPages = 5) {
    try {
        logger.info(`🚀 Starting paginated scraping from page ${startPage} to ${startPage + maxPages - 1}...`);

        // Connect to database
        await database.connect();

        // Create scraper instance
        const scraper = new Scraper();

        // Temporarily modify config for this run
        const originalConfig = require('./config');
        originalConfig.scraper.pagination.startPage = startPage;
        originalConfig.scraper.pagination.maxPages = maxPages;

        // Start scraping
        const result = await scraper.scrape();

        // Log results
        logger.success('🎉 Paginated scraping completed!', {
            saved: result.saved,
            duplicates: result.duplicates,
            errors: result.errors,
            pages: `${startPage} to ${startPage + maxPages - 1}`
        });

    } catch (error) {
        logger.error('Paginated scraping failed', error);
        process.exit(1);
    } finally {
        await database.disconnect();
    }
}

// Get command line arguments
const args = process.argv.slice(2);
const startPage = parseInt(args[0]) || 1;
const maxPages = parseInt(args[1]) || 5;

scrapePages(startPage, maxPages); 