const puppeteer = require('puppeteer');
const logger = require('./utils/logger');

async function testSimpleChrome() {
    logger.info('🧪 Testing simple Chrome setup...');

    try {
        // Simple launch without any executable path
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        logger.success('✅ Browser launched successfully');

        const page = await browser.newPage();
        await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });

        const title = await page.title();
        logger.success(`✅ Page loaded successfully. Title: ${title}`);

        await browser.close();
        logger.success('✅ Browser closed successfully');
        logger.success('✅ Simple Chrome test passed!');

    } catch (error) {
        logger.error('❌ Simple Chrome test failed:', error.message);
        process.exit(1);
    }
}

testSimpleChrome(); 