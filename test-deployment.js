const puppeteer = require('puppeteer');
const logger = require('./utils/logger');

async function testDeployment() {
    logger.info('🧪 Testing deployment...');

    try {
        // Test Chrome installation
        logger.info('Testing Chrome installation...');

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
        const fs = require('fs');
        const possiblePaths = [
            process.env.PUPPETEER_EXECUTABLE_PATH,
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium'
        ].filter(Boolean);

        for (const path of possiblePaths) {
            if (fs.existsSync(path)) {
                launchOptions.executablePath = path;
                logger.info(`Using Chrome executable: ${path}`);
                break;
            }
        }

        // Launch browser
        logger.info('Launching browser...');
        const browser = await puppeteer.launch(launchOptions);

        logger.info('Creating page...');
        const page = await browser.newPage();

        logger.info('Navigating to test page...');
        await page.goto('https://www.google.com', {
            waitUntil: 'networkidle2',
            timeout: 10000
        });

        const title = await page.title();
        logger.success(`✅ Page loaded successfully. Title: ${title}`);

        await browser.close();
        logger.success('✅ Deployment test completed successfully!');

    } catch (error) {
        logger.error('❌ Deployment test failed:', error.message);
        process.exit(1);
    }
}

testDeployment(); 