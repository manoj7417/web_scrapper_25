const Scraper = require('./services/scraper');
const database = require('./utils/database');
const logger = require('./utils/logger');
const http = require('http');

// Create HTTP server for health checks
const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'eProcurement Scraper'
        }));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3000;

async function main() {
    try {
        logger.info('🚀 Starting eProcurement Scraper...');

        // Start HTTP server
        server.listen(PORT, () => {
            logger.info(`Health check server running on port ${PORT}`);
        });

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
    server.close(() => {
        process.exit(0);
    });
});

// Run the application
main(); 