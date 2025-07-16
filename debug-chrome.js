const fs = require('fs');
const { execSync } = require('child_process');
const logger = require('./utils/logger');

async function debugChrome() {
    logger.info('🔍 Starting Chrome debug...');

    try {
        // Check environment
        logger.info('Environment variables:');
        logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
        logger.info(`PUPPETEER_EXECUTABLE_PATH: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
        logger.info(`PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: ${process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD}`);

        // Check if we're in production
        if (process.env.NODE_ENV === 'production') {
            logger.info('Production environment detected');

            // Try to install Chrome via Puppeteer
            try {
                logger.info('Installing Chrome via Puppeteer...');
                execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
                logger.success('Chrome installed via Puppeteer');
            } catch (error) {
                logger.warn('Failed to install Chrome via Puppeteer:', error.message);
            }

            // Try to install system Chrome
            try {
                logger.info('Installing system Chrome...');
                execSync('apt-get update -qq', { stdio: 'inherit' });
                execSync('apt-get install -y -qq wget gnupg ca-certificates', { stdio: 'inherit' });
                execSync('wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -', { stdio: 'inherit' });
                execSync('echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list', { stdio: 'inherit' });
                execSync('apt-get update -qq', { stdio: 'inherit' });
                execSync('apt-get install -y -qq google-chrome-stable', { stdio: 'inherit' });
                logger.success('System Chrome installed');
            } catch (error) {
                logger.warn('Failed to install system Chrome:', error.message);
            }
        }

        // Check all possible Chrome paths
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
        let chromeFound = false;
        for (const path of possiblePaths) {
            try {
                if (fs.existsSync(path)) {
                    logger.success(`✅ Chrome found at: ${path}`);
                    chromeFound = true;

                    // Try to get version
                    try {
                        const version = execSync(`${path} --version`, { encoding: 'utf8' });
                        logger.info(`Version: ${version.trim()}`);
                    } catch (error) {
                        logger.warn(`Could not get version: ${error.message}`);
                    }
                } else {
                    logger.warn(`❌ Chrome not found at: ${path}`);
                }
            } catch (error) {
                logger.warn(`❌ Error checking: ${path} - ${error.message}`);
            }
        }

        // Check Puppeteer bundled Chrome
        try {
            const puppeteer = require('puppeteer');
            const puppeteerPath = puppeteer.executablePath();
            if (puppeteerPath) {
                logger.success(`✅ Puppeteer bundled Chrome: ${puppeteerPath}`);
                chromeFound = true;
            } else {
                logger.warn('❌ Puppeteer bundled Chrome not available');
            }
        } catch (error) {
            logger.warn('❌ Error getting Puppeteer Chrome:', error.message);
        }

        // Check system information
        try {
            logger.info('System information:');
            const osInfo = execSync('uname -a', { encoding: 'utf8' });
            logger.info(`OS: ${osInfo.trim()}`);

            const diskSpace = execSync('df -h /', { encoding: 'utf8' });
            logger.info(`Disk space: ${diskSpace.trim()}`);

            const memory = execSync('free -h', { encoding: 'utf8' });
            logger.info(`Memory: ${memory.trim()}`);
        } catch (error) {
            logger.warn('Could not get system info:', error.message);
        }

        if (!chromeFound) {
            logger.error('❌ No Chrome installation found');
            process.exit(1);
        }

        // Try to launch browser
        logger.info('Testing browser launch...');
        const puppeteer = require('puppeteer');

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
            if (fs.existsSync(path)) {
                launchOptions.executablePath = path;
                logger.info(`Trying with executable: ${path}`);
                break;
            }
        }

        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        await page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 10000 });
        const title = await page.title();
        logger.success(`✅ Browser test successful. Page title: ${title}`);
        await browser.close();

        logger.success('✅ Chrome debug completed successfully!');

    } catch (error) {
        logger.error('❌ Chrome debug failed:', error.message);
        process.exit(1);
    }
}

debugChrome(); 