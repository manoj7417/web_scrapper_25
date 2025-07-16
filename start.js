const Scraper = require('./services/scraper');
const database = require('./utils/database');
const logger = require('./utils/logger');
const app = require('./api');

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        logger.info('🚀 Starting eProcurement Scraper on Render...');

        // Connect to database
        await database.connect();
        logger.success('Database connected');

        // Start scraping in background (don't wait for it to complete)
        const scraper = new Scraper();
        scraper.scrape().then(result => {
            logger.success('🎉 Scraping completed!', {
                saved: result.saved,
                duplicates: result.duplicates,
                errors: result.errors
            });
        }).catch(error => {
            logger.error('Scraping failed', error);
        });

        // Start the API server
        app.listen(PORT, () => {
            logger.success(`🚀 API Server running on port ${PORT}`);
            logger.info(`Health check: http://localhost:${PORT}/health`);
            logger.info(`API Documentation: http://localhost:${PORT}/api/tenders`);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Shutting down server...');
    try {
        await database.disconnect();
    } catch (error) {
        logger.warn('Error disconnecting from database:', error.message);
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Shutting down server...');
    try {
        await database.disconnect();
    } catch (error) {
        logger.warn('Error disconnecting from database:', error.message);
    }
    process.exit(0);
});

// Start the application
start(); 