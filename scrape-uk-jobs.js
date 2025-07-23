require('dotenv').config();
const UKJobsScraper = require('./services/ukJobsScraper');
const database = require('./utils/database');
const logger = require('./utils/logger');

async function main() {
    try {
        logger.info('Starting UK Jobs scraper...');
        
        // Connect to database first
        await database.connect();
        logger.success('Database connected');
        
        const scraper = new UKJobsScraper();
        
        // Configure scraping parameters
        const maxPages = process.env.MAX_PAGES ? parseInt(process.env.MAX_PAGES) : 10;
        const location = process.env.LOCATION_CODE || '86383'; // Default location code
        
        logger.info(`Scraping configuration: Max pages = ${maxPages}, Location = ${location}`);
        
        // Start scraping
        const result = await scraper.scrape(maxPages, location);
        
        logger.success('UK Jobs scraping completed successfully!');
        logger.info('Results:', result);
        
        // Disconnect from database
        await database.disconnect();
        
        process.exit(0);
    } catch (error) {
        logger.error('UK Jobs scraping failed:', error);
        try {
            await database.disconnect();
        } catch (disconnectError) {
            logger.warn('Failed to disconnect from database:', disconnectError.message);
        }
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

// Run the scraper
main(); 