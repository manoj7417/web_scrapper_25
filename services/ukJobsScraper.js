const puppeteer = require('puppeteer');
const logger = require('../utils/logger');
const UKJob = require('../models/UKJob');

class UKJobsScraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.allJobs = [];
        this.baseUrl = 'https://findajob.dwp.gov.uk/search';
    }

    async init() {
        try {
            // Configure Puppeteer for deployment
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
                    '--disable-web-resources',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection'
                ]
            };

            // For deployment, use Puppeteer's bundled Chrome
            logger.info('Using Puppeteer bundled Chrome for deployment');

            // Clear any system Chrome path to force using bundled Chrome
            delete process.env.PUPPETEER_EXECUTABLE_PATH;

            // For Windows, use the installed Chrome path
            if (process.platform === 'win32') {
                const chromePath = 'C:\\Users\\Aman\\.cache\\puppeteer\\chrome\\win64-127.0.6533.88\\chrome-win64\\chrome.exe';
                launchOptions.executablePath = chromePath;
                logger.info(`Using Windows Chrome path: ${chromePath}`);
            } else {
                // Explicitly set executable path to null to force bundled browser
                launchOptions.executablePath = null;
            }

            // Add additional Chrome arguments for deployment
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

            logger.success('Browser launched for UK Jobs scraper');
        } catch (error) {
            logger.error('Failed to launch browser for UK Jobs scraper', error);
            throw error;
        }
    }

    async navigateToPage(pageNumber = 1, location = '86383') {
        try {
            let url;

            if (pageNumber === 1) {
                url = `${this.baseUrl}?q=&loc=${location}`;
                logger.info(`Navigating to page ${pageNumber}: ${url}`);

                await this.page.goto(url, {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });

                // Wait for job listings to load
                await this.page.waitForSelector('h3', {
                    timeout: 30000
                });
            } else {
                // For subsequent pages, try to click the "next" button
                logger.info(`Attempting to navigate to page ${pageNumber} via pagination`);

                // Wait for the page to be ready
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Try to find and click the next button
                try {
                    const nextButton = await this.page.$('a[rel="next"], a:contains("next"), .pagination a:last-child, .next');
                    if (nextButton) {
                        await nextButton.click();
                        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for page to load
                    } else {
                        // If no next button, try URL-based pagination
                        url = `${this.baseUrl}?q=&loc=${location}&page=${pageNumber}`;
                        logger.info(`No next button found, trying URL: ${url}`);
                        await this.page.goto(url, {
                            waitUntil: 'networkidle2',
                            timeout: 30000
                        });
                    }
                } catch (error) {
                    logger.warn(`Could not find next button, trying URL-based pagination`);
                    url = `${this.baseUrl}?q=&loc=${location}&page=${pageNumber}`;
                    await this.page.goto(url, {
                        waitUntil: 'networkidle2',
                        timeout: 30000
                    });
                }

                // Wait for job listings to load
                await this.page.waitForSelector('h3', {
                    timeout: 30000
                });
            }

            logger.success(`Page ${pageNumber} loaded`);
        } catch (error) {
            logger.error(`Failed to navigate to page ${pageNumber}`, error);
            throw error;
        }
    }

    async extractDataFromPage(pageNumber) {
        try {
            // Wait for job listings to be visible - try multiple selectors
            let jobElements = [];
            try {
                await this.page.waitForSelector('h3', { timeout: 10000 });
                jobElements = await this.page.$$('h3');
            } catch (error) {
                logger.warn('h3 selector not found, trying alternative selectors...');
                try {
                    await this.page.waitForSelector('.job-listing', { timeout: 10000 });
                    jobElements = await this.page.$$('.job-listing');
                } catch (error2) {
                    logger.warn('job-listing selector not found, trying article elements...');
                    try {
                        await this.page.waitForSelector('article', { timeout: 10000 });
                        jobElements = await this.page.$$('article');
                    } catch (error3) {
                        logger.warn('article selector not found, trying div elements...');
                        jobElements = await this.page.$$('div[class*="job"]');
                    }
                }
            }

            logger.info(`Page ${pageNumber}: Found ${jobElements.length} job listings`);

            const pageJobs = [];
            for (let i = 0; i < jobElements.length; i++) {
                try {
                    const job = await this.extractJobData(jobElements[i], i + 1, pageNumber);
                    if (job) pageJobs.push(job);
                } catch (error) {
                    logger.warn(`Page ${pageNumber}, Job ${i + 1}: ${error.message}`);
                }
            }

            return pageJobs;
        } catch (error) {
            logger.error(`Failed to extract data from page ${pageNumber}`, error);
            return [];
        }
    }

    async extractJobData(jobElement, index, pageNumber) {
        try {
            // Get the job title - try multiple approaches
            let title = '';
            try {
                title = await jobElement.evaluate(el => el.textContent?.trim() || '');
            } catch (error) {
                // Try to find title in child elements
                try {
                    const titleElement = await jobElement.$('h3, h2, h1, .title, .job-title');
                    if (titleElement) {
                        title = await titleElement.evaluate(el => el.textContent?.trim() || '');
                    }
                } catch (error2) {
                    logger.warn(`Page ${pageNumber}, Job ${index}: Could not extract title`);
                }
            }

            if (!title) {
                logger.warn(`Page ${pageNumber}, Job ${index}: Missing title`);
                return null;
            }

            // Get the parent container for additional job details
            let container = jobElement;
            try {
                const jobContainer = await jobElement.evaluateHandle(el => el.closest('div, article, section'));
                container = jobContainer.asElement();
            } catch (error) {
                // If we can't get parent, use the element itself
                container = jobElement;
            }

            // Extract job details
            const details = await this.extractJobDetails(container, index, pageNumber);

            return {
                title,
                ...details,
                pageNumber
            };
        } catch (error) {
            logger.error(`Failed to extract job ${index} from page ${pageNumber}`, error);
            return null;
        }
    }

    async extractJobDetails(container, index, pageNumber) {
        try {
            const details = {};

            // Extract company name - try multiple approaches
            try {
                const companyElement = await container.$('strong, .company, .employer');
                if (companyElement) {
                    details.company = await companyElement.evaluate(el => el.textContent?.trim() || '');
                }
            } catch (error) {
                details.company = '';
            }

            // Extract location - try multiple approaches
            try {
                const locationElement = await container.$('li:first-child, .location, .job-location');
                if (locationElement) {
                    details.location = await locationElement.evaluate(el => el.textContent?.trim() || '');
                }
            } catch (error) {
                details.location = '';
            }

            // Extract salary - try multiple approaches
            try {
                const salaryElement = await container.$('li:nth-child(2), .salary, .job-salary');
                if (salaryElement) {
                    details.salary = await salaryElement.evaluate(el => el.textContent?.trim() || '');
                }
            } catch (error) {
                details.salary = '';
            }

            // Extract job type and work type from all list items and spans
            try {
                const allElements = await container.$$('li, span, div');
                for (const element of allElements) {
                    const text = await element.evaluate(el => el.textContent?.trim() || '');
                    if (text.includes('Permanent') || text.includes('Contract') || text.includes('Temporary') || text.includes('Apprenticeship')) {
                        details.jobType = text;
                    }
                    if (text.includes('Full time') || text.includes('Part time')) {
                        details.workType = text;
                    }
                    if (text.includes('On-site only') || text.includes('Hybrid remote') || text.includes('Fully remote')) {
                        details.remoteType = text;
                    }
                }
            } catch (error) {
                details.jobType = '';
                details.workType = '';
                details.remoteType = '';
            }

            // Extract posted date - try multiple approaches
            try {
                const dateElement = await container.$('li:first-child, .date, .posted-date');
                if (dateElement) {
                    details.postedDate = await dateElement.evaluate(el => el.textContent?.trim() || '');
                }
            } catch (error) {
                details.postedDate = '';
            }

            // Extract job link - try multiple approaches
            try {
                const linkElement = await container.$('a');
                if (linkElement) {
                    details.jobLink = await linkElement.evaluate(el => el.href || '');
                }
            } catch (error) {
                details.jobLink = '';
            }

            // Extract description - try multiple approaches
            try {
                const descElement = await container.$('p, .description, .job-description');
                if (descElement) {
                    details.description = await descElement.evaluate(el => el.textContent?.trim() || '');
                }
            } catch (error) {
                details.description = '';
            }

            return details;
        } catch (error) {
            logger.error(`Failed to extract job details for job ${index} from page ${pageNumber}`, error);
            return {};
        }
    }

    async scrapeAllPages(maxPages = 10, location = '86383') {
        let currentPage = 1;
        let totalJobs = 0;
        let pagesWithData = 0;

        while (currentPage <= maxPages) {
            try {
                await this.navigateToPage(currentPage, location);
                const pageJobs = await this.extractDataFromPage(currentPage);

                if (pageJobs.length > 0) {
                    this.allJobs.push(...pageJobs);
                    totalJobs += pageJobs.length;
                    pagesWithData++;
                    logger.success(`Page ${currentPage}: Extracted ${pageJobs.length} jobs`);
                } else {
                    logger.warn(`Page ${currentPage}: No data found, stopping pagination`);
                    break;
                }

                // Add delay between pages to be respectful
                if (currentPage < maxPages && pageJobs.length > 0) {
                    logger.info(`Waiting 2000ms before next page...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                currentPage++;
            } catch (error) {
                logger.error(`Failed to scrape page ${currentPage}`, error);
                break;
            }
        }

        logger.success(`Pagination completed: ${pagesWithData} pages, ${totalJobs} total jobs`);
        return this.allJobs;
    }

    async saveJobs(jobs) {
        let saved = 0, duplicates = 0, errors = 0;

        for (const job of jobs) {
            try {
                // Remove pageNumber from the object before saving to database
                const { pageNumber, ...jobData } = job;
                await new UKJob(jobData).save();
                saved++;
            } catch (error) {
                if (error.code === 11000) {
                    duplicates++;
                } else {
                    errors++;
                    logger.error(`Failed to save: ${job.title}`, error);
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

    async scrape(maxPages = 10, location = '86383') {
        try {
            await this.init();
            logger.info('Starting UK Jobs scraping...');

            const jobs = await this.scrapeAllPages(maxPages, location);

            if (jobs.length > 0) {
                return await this.saveJobs(jobs);
            } else {
                logger.warn('No jobs found across all pages');
                return { saved: 0, duplicates: 0, errors: 0 };
            }
        } catch (error) {
            logger.error('UK Jobs scraping failed', error);
            throw error;
        } finally {
            await this.close();
        }
    }
}

module.exports = UKJobsScraper; 