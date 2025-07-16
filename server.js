const app = require('./api');
const database = require('./utils/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Try to connect to database, but don't fail if it doesn't work
        try {
            await database.connect();
            logger.success('Database connected');
        } catch (dbError) {
            logger.warn('Database connection failed, but continuing with API server');
            logger.warn('Database error:', dbError.message);
        }

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

startServer(); 