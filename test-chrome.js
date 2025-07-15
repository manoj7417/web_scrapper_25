const puppeteer = require('puppeteer');
const fs = require('fs');
const logger = require('./utils/logger');

async function testChrome() {
    logger.info('🔍 Testing Chrome installation...');

    // Check possible Chrome paths
    const possiblePaths = [
        process.env.PUPPETEER_EXECUTABLE_PATH,
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/opt/google/chrome/chrome',
        '/usr/bin/chrome'
    ].filter(Boolean);

    logger.info('Checking Chrome paths:');
    for (const path of possiblePaths) {
        try {
            if (fs.existsSync(path)) {
                logger.success(`✅ Found Chrome at: ${path}`);
            } else {
                logger.warn(`❌ Not found: ${path}`);
            }
        } catch (error) {
            logger.warn(`❌ Error checking: ${path} - ${error.message}`);
        }
    }

    // Try to get Puppeteer's bundled Chrome
    try {
        const puppeteerPath = require('puppeteer').executablePath();
        if (puppeteerPath) {
            logger.success(`✅ Puppeteer bundled Chrome: ${puppeteerPath}`);
        } else {
            logger.warn('❌ No Puppeteer bundled Chrome found');
        }
    } catch (error) {
        logger.warn(`❌ Error getting Puppeteer Chrome: ${error.message}`);
    }

    // Try to launch browser
    try {
        logger.info('🚀 Attempting to launch browser...');

        const launchOptions = {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        };

        // Try to find Chrome executable
        for (const path of possiblePaths) {
            try {
                if (fs.existsSync(path)) {
                    launchOptions.executablePath = path;
                    logger.info(`Trying with executable: ${path}`);
                    break;
                }
            } catch (error) {
                // Continue to next path
            }
        }

        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();

        logger.success('✅ Browser launched successfully!');

        await page.goto('https://www.google.com');
        logger.success('✅ Successfully navigated to Google');

        await browser.close();
        logger.success('✅ Browser closed successfully');

    } catch (error) {
        logger.error('❌ Failed to launch browser:', error.message);
    }
}

testChrome().catch(console.error); 