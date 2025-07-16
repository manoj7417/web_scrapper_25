const logger = require('./utils/logger');
const fs = require('fs');
const { execSync } = require('child_process');

async function buildCheck() {
    logger.info('🔍 Running build check...');

    try {
        // Check if we're in production environment
        if (process.env.NODE_ENV === 'production') {
            logger.info('Production environment detected');

            // Try to install Chrome if not present
            try {
                logger.info('Installing Chrome...');
                execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
                logger.success('Chrome installed via Puppeteer');
            } catch (error) {
                logger.warn('Failed to install Chrome via Puppeteer, trying system installation');

                // Try system Chrome installation
                try {
                    execSync('apt-get update', { stdio: 'inherit' });
                    execSync('apt-get install -y wget gnupg', { stdio: 'inherit' });
                    execSync('wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -', { stdio: 'inherit' });
                    execSync('echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list', { stdio: 'inherit' });
                    execSync('apt-get update', { stdio: 'inherit' });
                    execSync('apt-get install -y google-chrome-stable', { stdio: 'inherit' });
                    logger.success('Chrome installed via system package manager');
                } catch (sysError) {
                    logger.warn('System Chrome installation failed:', sysError.message);
                }
            }
        }

        // Check Chrome paths - handle both Windows and Linux
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

        logger.info('Checking Chrome availability:');
        let chromeFound = false;

        for (const path of possiblePaths) {
            try {
                if (fs.existsSync(path)) {
                    logger.success(`✅ Chrome found at: ${path}`);
                    chromeFound = true;
                } else {
                    logger.warn(`❌ Chrome not found at: ${path}`);
                }
            } catch (error) {
                logger.warn(`❌ Error checking: ${path}`);
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

        if (!chromeFound) {
            logger.error('❌ No Chrome installation found');
            process.exit(1);
        }

        // Test database connection
        try {
            const database = require('./utils/database');
            await database.connect();
            logger.success('✅ Database connection successful');
            await database.disconnect();
        } catch (error) {
            logger.error('❌ Database connection failed:', error.message);
            // Don't exit for database issues in build check
        }

        logger.success('✅ Build check completed successfully');

    } catch (error) {
        logger.error('❌ Build check failed:', error.message);
        process.exit(1);
    }
}

buildCheck(); 