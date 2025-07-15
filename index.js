const Scraper = require('./services/scraper');
const database = require('./utils/database');
const logger = require('./utils/logger');

async function main() {
    try {
        logger.info('🚀 Starting eProcurement Scraper...');

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
        process.exit(1);
    } finally {
        await database.disconnect();
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('Shutting down...');
    process.exit(0);
});

// Run the application
main(); 