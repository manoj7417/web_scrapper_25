require('dotenv').config();
const UKJobsScraper = require('./services/ukJobsScraper');
const database = require('./utils/database');
const logger = require('./utils/logger');

async function testUKJobsScraper() {
    try {
        logger.info('🧪 Testing UK Jobs scraper...');
        
        // Connect to database first
        await database.connect();
        logger.success('Database connected for testing');
        
        const scraper = new UKJobsScraper();
        
        // Test with just 1 page to verify functionality
        const result = await scraper.scrape(1, '86383');
        
        logger.success('✅ UK Jobs scraper test completed!');
        logger.info('Test Results:', result);
        
        if (result.saved > 0) {
            logger.success(`✅ Successfully scraped ${result.saved} jobs`);
        } else {
            logger.warn('⚠️ No jobs were scraped - this might be normal if the page structure changed');
        }
        
        // Disconnect from database
        await database.disconnect();
        
        process.exit(0);
    } catch (error) {
        logger.error('❌ UK Jobs scraper test failed:', error);
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

// Run the test
testUKJobsScraper(); 