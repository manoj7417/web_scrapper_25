const logger = require('./utils/logger');
const database = require('./utils/database');
const config = require('./config');

async function debug() {
    logger.info('🔍 Starting debug checks...');

    // Check Node.js version
    const nodeVersion = process.version;
    logger.info(`Node.js version: ${nodeVersion}`);

    // Check if we're in the right directory
    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync('package.json')) {
        logger.error('package.json not found. Are you in the correct directory?');
        return;
    }

    // Check if .env exists
    if (!fs.existsSync('.env')) {
        logger.warn('.env file not found. Creating sample .env file...');
        const envContent = `MONGODB_URI=mongodb://localhost:27017/eprocurement\n`;
        fs.writeFileSync('.env', envContent);
        logger.success('Created .env file with default settings');
    }

    // Test database connection
    try {
        logger.info('Testing database connection...');
        await database.connect();
        const status = await database.healthCheck();
        logger.success(`Database status: ${status}`);
        await database.disconnect();
    } catch (error) {
        logger.error('Database connection failed. Please check:');
        logger.error('1. Is MongoDB running?');
        logger.error('2. Is the connection string correct in .env?');
        logger.error('3. Do you have network access?');
    }

    // Check Puppeteer
    try {
        logger.info('Testing Puppeteer...');
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        await browser.close();
        logger.success('Puppeteer is working correctly');
    } catch (error) {
        logger.error('Puppeteer test failed:', error.message);
        logger.error('Try running: npm install puppeteer');
    }

    logger.info('✅ Debug checks completed');
}

debug().catch(error => {
    logger.error('Debug failed', error);
    process.exit(1);
}); 