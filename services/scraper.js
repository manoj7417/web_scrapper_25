const puppeteer = require('puppeteer');
const config = require('../config');
const logger = require('../utils/logger');
const Tender = require('../models/Tender');

class Scraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.allTenders = [];
    }

    async init() {
        try {
            // Configure Puppeteer for Render deployment
            const launchOptions = {
                headless: config.scraper.headless,
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
                    '--disable-web-resources',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection'
                ]
            };

            // For Render deployment, try to find Chrome in common locations
            if (process.env.NODE_ENV === 'production') {
                const fs = require('fs');
                const { execSync } = require('child_process');
                
                // Log environment for debugging
                logger.info('Production environment detected');
                logger.info(`PUPPETEER_EXECUTABLE_PATH: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
                
                // Try to install Chrome if not present
                try {
                    logger.info('Attempting to install Chrome via Puppeteer...');
                    execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
                    logger.success('Chrome installed via Puppeteer');
                } catch (error) {
                    logger.warn('Failed to install Chrome via Puppeteer:', error.message);
                }
                
                const possiblePaths = [
                    process.env.PUPPETEER_EXECUTABLE_PATH,
                    '/usr/bin/google-chrome-stable',
                    '/usr/bin/google-chrome',
                    '/usr/bin/chromium-browser',
                    '/usr/bin/chromium',
                    '/opt/google/chrome/chrome',
                    '/usr/bin/chrome'
                ].filter(Boolean);

                // Try to find Chrome executable
                logger.info('Checking Chrome paths:');
                for (const path of possiblePaths) {
                    try {
                        if (fs.existsSync(path)) {
                            launchOptions.executablePath = path;
                            logger.success(`✅ Chrome found at: ${path}`);
                            break;
                        } else {
                            logger.warn(`❌ Chrome not found at: ${path}`);
                        }
                    } catch (error) {
                        logger.warn(`❌ Error checking: ${path} - ${error.message}`);
                    }
                }

                // If no Chrome found, try to use Puppeteer's bundled Chrome
                if (!launchOptions.executablePath) {
                    try {
                        const puppeteerPath = require('puppeteer').executablePath();
                        if (puppeteerPath) {
                            launchOptions.executablePath = puppeteerPath;
                            logger.success(`✅ Using Puppeteer bundled Chrome: ${puppeteerPath}`);
                        } else {
                            logger.warn('❌ Puppeteer bundled Chrome not available');
                        }
                    } catch (error) {
                        logger.warn('❌ Error getting Puppeteer Chrome:', error.message);
                    }
                }
                
                // If still no Chrome, try to install system Chrome
                if (!launchOptions.executablePath) {
                    try {
                        logger.info('Attempting to install system Chrome...');
                        execSync('apt-get update -qq', { stdio: 'inherit' });
                        execSync('apt-get install -y -qq wget gnupg ca-certificates', { stdio: 'inherit' });
                        execSync('wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -', { stdio: 'inherit' });
                        execSync('echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list', { stdio: 'inherit' });
                        execSync('apt-get update -qq', { stdio: 'inherit' });
                        execSync('apt-get install -y -qq google-chrome-stable', { stdio: 'inherit' });
                        logger.success('System Chrome installed');
                        
                        // Check if Chrome is now available
                        if (fs.existsSync('/usr/bin/google-chrome-stable')) {
                            launchOptions.executablePath = '/usr/bin/google-chrome-stable';
                            logger.success('✅ Chrome now available at /usr/bin/google-chrome-stable');
                        }
                    } catch (error) {
                        logger.warn('Failed to install system Chrome:', error.message);
                    }
                }
                
                // Final fallback: try to force Puppeteer to use its bundled Chrome
                if (!launchOptions.executablePath) {
                    try {
                        logger.info('Attempting to force Puppeteer bundled Chrome...');
                        // Clear any cached executable path
                        delete process.env.PUPPETEER_EXECUTABLE_PATH;
                        
                        // Try to get Puppeteer's bundled Chrome
                        const puppeteerPath = require('puppeteer').executablePath();
                        if (puppeteerPath && fs.existsSync(puppeteerPath)) {
                            launchOptions.executablePath = puppeteerPath;
                            logger.success(`✅ Using Puppeteer bundled Chrome: ${puppeteerPath}`);
                        } else {
                            logger.warn('Puppeteer bundled Chrome not available, will try without executable path');
                        }
                    } catch (error) {
                        logger.warn('Error getting Puppeteer Chrome:', error.message);
                    }
                }

                // Add additional Chrome arguments for Render
                launchOptions.args.push(
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
                    '--disable-web-resources',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection'
                );
            }

            this.browser = await puppeteer.launch(launchOptions);

            this.page = await this.browser.newPage();
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await this.page.setViewport({ width: 1920, height: 1080 });

            // Disable images and CSS for faster loading
            await this.page.setRequestInterception(true);
            this.page.on('request', (req) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            logger.success('Browser launched');
        } catch (error) {
            logger.error('Failed to launch browser', error);
            throw error;
        }
    }

    async navigateToPage(pageNumber = 1) {
        try {
            const url = pageNumber === 1
                ? config.scraper.url
                : `${config.scraper.url}?page=${pageNumber}`;

            logger.info(`Navigating to page ${pageNumber}: ${url}`);

            await this.page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: config.scraper.timeout
            });

            await this.page.waitForSelector('#table', {
                timeout: config.scraper.timeout
            });

            logger.success(`Page ${pageNumber} loaded`);
        } catch (error) {
            logger.error(`Failed to navigate to page ${pageNumber}`, error);
            throw error;
        }
    }

    async extractDataFromPage(pageNumber) {
        try {
            const rows = await this.page.$$(config.scraper.tableSelector);
            logger.info(`Page ${pageNumber}: Found ${rows.length} rows`);

            const pageTenders = [];
            for (let i = 0; i < rows.length; i++) {
                try {
                    const tender = await this.extractRow(rows[i], i + 1, pageNumber);
                    if (tender) pageTenders.push(tender);
                } catch (error) {
                    logger.warn(`Page ${pageNumber}, Row ${i + 1}: ${error.message}`);
                }
            }

            return pageTenders;
        } catch (error) {
            logger.error(`Failed to extract data from page ${pageNumber}`, error);
            return [];
        }
    }

    async extractRow(row, index, pageNumber) {
        try {
            const cells = await row.$$('td');
            if (cells.length < 7) {
                logger.warn(`Page ${pageNumber}, Row ${index}: Insufficient columns (${cells.length})`);
                return null;
            }

            const getText = async (cell) => {
                try {
                    return await cell.evaluate(el => el.textContent?.trim() || '');
                } catch (error) {
                    return '';
                }
            };

            const getLink = async (cell) => {
                try {
                    const anchor = await cell.$('a');
                    return anchor ? await anchor.evaluate(el => el.href || '') : '';
                } catch (error) {
                    return '';
                }
            };

            const titleCell = cells[4];
            const title = await getText(titleCell);
            const link = await getLink(titleCell);

            if (!title) {
                logger.warn(`Page ${pageNumber}, Row ${index}: Missing title`);
                return null;
            }

            return {
                serialNumber: await getText(cells[0]) || `Page${pageNumber}-Row${index}`,
                publishedDate: await getText(cells[1]),
                bidSubmissionClosingDate: await getText(cells[2]),
                tenderOpeningDate: await getText(cells[3]),
                title,
                tenderLink: link,
                organisationName: await getText(cells[5]),
                corrigendum: await getText(cells[6]),
                pageNumber // Add page number for tracking
            };
        } catch (error) {
            logger.error(`Failed to extract row ${index} from page ${pageNumber}`, error);
            return null;
        }
    }

    async scrapeAllPages() {
        const { pagination } = config.scraper;
        let currentPage = pagination.startPage;
        let totalTenders = 0;
        let pagesWithData = 0;

        while (currentPage <= pagination.maxPages) {
            try {
                await this.navigateToPage(currentPage);
                const pageTenders = await this.extractDataFromPage(currentPage);

                if (pageTenders.length > 0) {
                    this.allTenders.push(...pageTenders);
                    totalTenders += pageTenders.length;
                    pagesWithData++;
                    logger.success(`Page ${currentPage}: Extracted ${pageTenders.length} tenders`);
                } else {
                    logger.warn(`Page ${currentPage}: No data found, stopping pagination`);
                    break;
                }

                // Add delay between pages to be respectful
                if (currentPage < pagination.maxPages && pageTenders.length > 0) {
                    logger.info(`Waiting ${pagination.delayBetweenPages}ms before next page...`);
                    await new Promise(resolve => setTimeout(resolve, pagination.delayBetweenPages));
                }

                currentPage++;
            } catch (error) {
                logger.error(`Failed to scrape page ${currentPage}`, error);
                break;
            }
        }

        logger.success(`Pagination completed: ${pagesWithData} pages, ${totalTenders} total tenders`);
        return this.allTenders;
    }

    async saveTenders(tenders) {
        let saved = 0, duplicates = 0, errors = 0;

        for (const tender of tenders) {
            try {
                // Remove pageNumber from the object before saving to database
                const { pageNumber, ...tenderData } = tender;
                await new Tender(tenderData).save();
                saved++;
            } catch (error) {
                if (error.code === 11000) {
                    duplicates++;
                } else {
                    errors++;
                    logger.error(`Failed to save: ${tender.title}`, error);
                }
            }
        }

        logger.success('Database operation completed', { saved, duplicates, errors });
        return { saved, duplicates, errors };
    }

    async close() {
        try {
            if (this.browser) {
                await this.browser.close();
                logger.success('Browser closed');
            }
        } catch (error) {
            logger.error('Failed to close browser', error);
        }
    }

    async scrape() {
        try {
            await this.init();

            if (config.scraper.pagination.enabled) {
                logger.info('Starting paginated scraping...');
                const tenders = await this.scrapeAllPages();

                if (tenders.length > 0) {
                    return await this.saveTenders(tenders);
                } else {
                    logger.warn('No tenders found across all pages');
                    return { saved: 0, duplicates: 0, errors: 0 };
                }
            } else {
                // Single page scraping (original behavior)
                await this.navigateToPage(1);
                const tenders = await this.extractDataFromPage(1);

                if (tenders.length > 0) {
                    return await this.saveTenders(tenders);
                } else {
                    logger.warn('No tenders found');
                    return { saved: 0, duplicates: 0, errors: 0 };
                }
            }
        } catch (error) {
            logger.error('Scraping failed', error);
            throw error;
        } finally {
            await this.close();
        }
    }
}

module.exports = Scraper; 