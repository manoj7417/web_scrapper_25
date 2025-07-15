const database = require('./utils/database');
const logger = require('./utils/logger');

async function testConnection() {
    try {
        logger.info('Testing database connection...');
        await database.connect();

        const status = await database.healthCheck();
        logger.success(`Connection successful. Status: ${status}`);

        await database.disconnect();
        logger.success('Test completed');
    } catch (error) {
        logger.error('Connection test failed', error);
        process.exit(1);
    }
}

testConnection(); 