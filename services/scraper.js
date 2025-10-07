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

            // For Render deployment, use Puppeteer's bundled Chrome
            if (process.env.NODE_ENV === 'production') {
                logger.info('Production environment detected');
                logger.info('Using Puppeteer bundled Chrome for Render deployment');

                // Clear any system Chrome path to force using bundled Chrome
                delete process.env.PUPPETEER_EXECUTABLE_PATH;

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

            const publishedDateText = await getText(cells[1]);

            // Try to normalize published date/time into a Date object (UTC)
            const parsePublishedAt = (text) => {
                if (!text) return null;
                const t = text.trim();
                // Try native Date first
                const native = new Date(t);
                if (!isNaN(native.getTime())) return native;

                // dd/MM/yyyy HH:mm (24h)
                let m = t.match(/^([0-3]?\d)[\/\-]([0-1]?\d)[\/\-](\d{4})\s+([0-2]?\d):([0-5]\d)$/);
                if (m) {
                    const d = parseInt(m[1], 10);
                    const mo = parseInt(m[2], 10) - 1;
                    const y = parseInt(m[3], 10);
                    const hh = parseInt(m[4], 10);
                    const mm = parseInt(m[5], 10);
                    return new Date(Date.UTC(y, mo, d, hh, mm));
                }

                // dd/MM/yyyy or d/M/yyyy (no time)
                m = t.match(/^([0-3]?\d)[\/\-]([0-1]?\d)[\/\-](\d{4})$/);
                if (m) {
                    const d = parseInt(m[1], 10);
                    const mo = parseInt(m[2], 10) - 1;
                    const y = parseInt(m[3], 10);
                    return new Date(Date.UTC(y, mo, d));
                }

                // dd-MMM-yyyy hh:mm AM/PM (e.g., 15-Jul-2025 05:12 PM)
                m = t.match(/^([0-3]?\d)[\- ]([A-Za-z]{3})[\- ](\d{4})\s+([0-1]?\d):([0-5]\d)\s*(AM|PM)$/i);
                if (m) {
                    const d = parseInt(m[1], 10);
                    const monStr = m[2].toLowerCase();
                    const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
                    const mo = months[monStr];
                    const y = parseInt(m[3], 10);
                    let hh = parseInt(m[4], 10);
                    const mm = parseInt(m[5], 10);
                    const ampm = m[6].toUpperCase();
                    if (ampm === 'PM' && hh !== 12) hh += 12;
                    if (ampm === 'AM' && hh === 12) hh = 0;
                    if (mo !== undefined) return new Date(Date.UTC(y, mo, d, hh, mm));
                }

                // dd-MMM-yyyy (e.g., 05-Aug-2025)
                m = t.match(/^([0-3]?\d)[\- ]([A-Za-z]{3})[\- ](\d{4})$/);
                if (m) {
                    const d = parseInt(m[1], 10);
                    const monStr = m[2].toLowerCase();
                    const months = {
                        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
                    };
                    const mo = months[monStr];
                    const y = parseInt(m[3], 10);
                    if (mo !== undefined) return new Date(Date.UTC(y, mo, d));
                }

                return null;
            };

            const publishedAt = parsePublishedAt(publishedDateText);

            return {
                serialNumber: await getText(cells[0]) || `Page${pageNumber}-Row${index}`,
                publishedDate: publishedDateText,
                publishedAt,
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