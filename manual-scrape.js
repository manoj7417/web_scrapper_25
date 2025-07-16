const Scraper = require('./services/scraper');
const database = require('./utils/database');
const logger = require('./utils/logger');

async function manualScrape() {
    try {
        logger.info('🚀 Starting manual scraping...');

        // Connect to database
        await database.connect();
        logger.success('✅ Database connected');

        // Run scraper
        const scraper = new Scraper();
        const result = await scraper.scrape();

        // Log results
        logger.success('🎉 Scraping completed!', {
            saved: result.saved,
            duplicates: result.duplicates,
            errors: result.errors
        });

        // Check database after scraping
        const totalTenders = await require('./models/Tender').countDocuments();
        logger.info(`📊 Total tenders in database after scraping: ${totalTenders}`);

        if (totalTenders > 0) {
            logger.success('✅ Database now has data!');
            logger.info('You can now access the API at:');
            logger.info('https://web-scrapper-25.onrender.com/api/tenders');
        } else {
            logger.warn('⚠️ No data was saved to database');
            logger.info('Check the scraping logs for errors');
        }

    } catch (error) {
        logger.error('❌ Manual scraping failed:', error.message);
        process.exit(1);
    } finally {
        await database.disconnect();
        logger.info('🔌 Database disconnected');
    }
}

manualScrape(); 