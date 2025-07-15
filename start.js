const Scraper = require('./services/scraper');
const database = require('./utils/database');
const logger = require('./utils/logger');
const server = require('./server');

async function start() {
    try {
        logger.info('🚀 Starting eProcurement Scraper on Render...');

        // Connect to database
        await database.connect();

        // Start scraping
        const scraper = new Scraper();
        const result = await scraper.scrape();

        // Log results
        logger.success('🎉 Scraping completed!', {
            saved: result.saved,
            duplicates: result.duplicates,
            errors: result.errors
        });

    } catch (error) {
        logger.error('Scraping failed', error);
        // Don't exit on error for Render - let the server keep running
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('Shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Shutting down...');
    process.exit(0);
});

// Start the application
start(); 