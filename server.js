const app = require('./api');
const database = require('./utils/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Connect to database
        await database.connect();
        logger.success('Database connected');

        // Start server
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
    await database.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Shutting down server...');
    await database.disconnect();
    process.exit(0);
});

startServer(); 