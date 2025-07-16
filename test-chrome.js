const puppeteer = require('puppeteer');
const logger = require('./utils/logger');

async function testChrome() {
    logger.info('🧪 Testing Chrome installation...');

    try {
        // Check for Chrome executable
        const possiblePaths = [
            process.env.PUPPETEER_EXECUTABLE_PATH,
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium'
        ].filter(Boolean);

        let chromePath = null;
        for (const path of possiblePaths) {
            try {
                const fs = require('fs');
                if (fs.existsSync(path)) {
                    chromePath = path;
                    logger.success(`✅ Chrome found at: ${path}`);
                    break;
                }
            } catch (error) {
                // Continue to next path
            }
        }

        if (!chromePath) {
            // Try Puppeteer's bundled Chrome
            try {
                chromePath = require('puppeteer').executablePath();
                if (chromePath) {
                    logger.success(`✅ Using Puppeteer bundled Chrome: ${chromePath}`);
                }
            } catch (error) {
                logger.warn('No Chrome executable found');
            }
        }

        // Launch browser
        const launchOptions = {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        };

        if (chromePath) {
            launchOptions.executablePath = chromePath;
        }

        logger.info('🚀 Launching browser...');
        const browser = await puppeteer.launch(launchOptions);

        logger.info('📄 Creating new page...');
        const page = await browser.newPage();

        logger.info('🌐 Navigating to test page...');
        await page.goto('https://www.google.com', {
            waitUntil: 'networkidle2',
            timeout: 10000
        });

        const title = await page.title();
        logger.success(`✅ Page loaded successfully. Title: ${title}`);

        await browser.close();
        logger.success('✅ Chrome test completed successfully!');

    } catch (error) {
        logger.error('❌ Chrome test failed:', error.message);
        process.exit(1);
    }
}

testChrome(); 