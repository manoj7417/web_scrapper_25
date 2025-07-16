const database = require('./utils/database');
const config = require('./config');
const logger = require('./utils/logger');

async function testDatabase() {
    logger.info('🧪 Testing database connection...');

    try {
        // Log configuration
        logger.info('MongoDB URI:', config.mongodb.uri ? 'Set' : 'Not set');
        logger.info('NODE_ENV:', process.env.NODE_ENV || 'Not set');

        // Test connection
        await database.connect();
        logger.success('✅ Database connected successfully');

        // Test health check
        const health = await database.healthCheck();
        logger.info('Database health:', health);

        // Test disconnection
        await database.disconnect();
        logger.success('✅ Database disconnected successfully');

    } catch (error) {
        logger.error('❌ Database connection failed:', error.message);
        logger.error('Full error:', error);

        // Provide troubleshooting tips
        logger.info('🔧 Troubleshooting tips:');
        logger.info('1. Check if MONGODB_URI environment variable is set');
        logger.info('2. Verify the MongoDB connection string is correct');
        logger.info('3. Ensure MongoDB service is running');
        logger.info('4. Check network connectivity to MongoDB');

        process.exit(1);
    }
}

testDatabase(); 