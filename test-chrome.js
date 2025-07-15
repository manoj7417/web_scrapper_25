const puppeteer = require('puppeteer');
const logger = require('./utils/logger');

async function testChrome() {
    logger.info('🔍 Testing Chrome installation...');

    try {
        // Check if Puppeteer can find Chrome
        const puppeteerPath = puppeteer.executablePath();
        logger.info(`Puppeteer executable path: ${puppeteerPath}`);

        // Test launching browser
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });

        logger.success('✅ Chrome launched successfully');

        const page = await browser.newPage();
        await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });

        const title = await page.title();
        logger.success(`✅ Page loaded successfully: ${title}`);

        await browser.close();
        logger.success('✅ Chrome test completed successfully');

    } catch (error) {
        logger.error('❌ Chrome test failed', error);

        // Try alternative approaches
        logger.info('🔄 Trying alternative Chrome paths...');

        const possiblePaths = [
            process.env.PUPPETEER_EXECUTABLE_PATH,
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            '/opt/google/chrome/chrome',
            '/usr/bin/chrome',
            '/usr/bin/google-chrome-stable'
        ].filter(Boolean);

        for (const path of possiblePaths) {
            try {
                logger.info(`Trying path: ${path}`);
                const fs = require('fs');
                if (fs.existsSync(path)) {
                    logger.success(`✅ Found Chrome at: ${path}`);

                    const browser = await puppeteer.launch({
                        headless: true,
                        executablePath: path,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                            '--disable-dev-shm-usage'
                        ]
                    });

                    logger.success('✅ Chrome launched with custom path');
                    await browser.close();
                    return;
                }
            } catch (error) {
                logger.warn(`❌ Failed with path: ${path}`);
            }
        }

        logger.error('❌ No working Chrome installation found');
    }
}

testChrome().catch(error => {
    logger.error('Chrome test failed', error);
    process.exit(1);
}); 