const logger = require('./utils/logger');
const { execSync } = require('child_process');

async function testDeployment() {
    logger.info('🧪 Testing deployment configuration...');

    try {
        // Simulate production environment
        process.env.NODE_ENV = 'production';
        process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'false';

        logger.info('Environment variables set for production');

        // Test Chrome installation
        logger.info('Testing Chrome installation...');
        const puppeteer = require('puppeteer');

        // Check Puppeteer bundled Chrome
        try {
            const puppeteerPath = puppeteer.executablePath();
            logger.success(`Puppeteer bundled Chrome: ${puppeteerPath}`);
        } catch (error) {
            logger.warn('Puppeteer bundled Chrome not available');
        }

        // Test browser launch with production settings
        logger.info('Testing browser launch with production settings...');

        const launchOptions = {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection',
                '--disable-default-apps',
                '--disable-sync',
                '--disable-translate',
                '--hide-scrollbars',
                '--mute-audio',
                '--no-default-browser-check',
                '--no-pings',
                '--disable-background-networking',
                '--disable-component-extensions-with-background-pages',
                '--disable-background-mode',
                '--disable-client-side-phishing-detection',
                '--disable-domain-reliability',
                '--disable-features=AudioServiceOutOfProcess',
                '--disable-hang-monitor',
                '--disable-prompt-on-repost',
                '--disable-sync-preferences',
                '--disable-web-resources'
            ]
        };

        // Try to find Chrome executable - use different paths for different OS
        const isWindows = process.platform === 'win32';
        const possiblePaths = isWindows ? [
            // Windows paths
            process.env.PUPPETEER_EXECUTABLE_PATH,
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
        ] : [
            // Linux paths
            process.env.PUPPETEER_EXECUTABLE_PATH,
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            '/opt/google/chrome/chrome',
            '/usr/bin/chrome'
        ].filter(Boolean);

        for (const path of possiblePaths) {
            try {
                const fs = require('fs');
                if (fs.existsSync(path)) {
                    launchOptions.executablePath = path;
                    logger.info(`Using Chrome executable: ${path}`);
                    break;
                }
            } catch (error) {
                // Continue to next path
            }
        }

        // If no Chrome found, try Puppeteer's bundled Chrome
        if (!launchOptions.executablePath) {
            try {
                const puppeteerPath = puppeteer.executablePath();
                if (puppeteerPath) {
                    launchOptions.executablePath = puppeteerPath;
                    logger.info(`Using Puppeteer bundled Chrome: ${puppeteerPath}`);
                }
            } catch (error) {
                logger.warn('No Chrome executable found, trying without executable path');
            }
        }

        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();

        logger.success('✅ Browser launched successfully with production settings!');

        await page.goto('https://www.google.com');
        logger.success('✅ Successfully navigated to Google');

        await browser.close();
        logger.success('✅ Browser closed successfully');

        // Test database connection
        logger.info('Testing database connection...');
        const database = require('./utils/database');
        await database.connect();
        logger.success('✅ Database connection successful');
        await database.disconnect();

        logger.success('✅ Deployment test completed successfully!');

    } catch (error) {
        logger.error('❌ Deployment test failed:', error.message);
        process.exit(1);
    }
}

testDeployment(); 