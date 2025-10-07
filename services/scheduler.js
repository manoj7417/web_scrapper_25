const cron = require('node-cron');
const database = require('../utils/database');
const logger = require('../utils/logger');
const Scraper = require('./scraper');

// Simple in-process lock to avoid overlapping runs
let isRunning = false;

function getScheduleFromEnv() {
    const expr = process.env.SCRAPE_CRON || '0 */6 * * *'; // default: every 6 hours
    return expr;
}

async function runScrapeJob() {
    if (isRunning) {
        logger.warn('Skipped scheduled scrape: previous run still in progress');
        return;
    }
    isRunning = true;

    const startTime = Date.now();
    logger.info('⏱️ Scheduled scraping job started');

    try {
        // Ensure DB is connected for job context (API may already have it)
        await database.connect();

        const scraper = new Scraper();
        const result = await scraper.scrape();

        const durationMs = Date.now() - startTime;
        logger.success('✅ Scheduled scrape completed', {
            saved: result.saved,
            duplicates: result.duplicates,
            errors: result.errors,
            durationMs
        });
    } catch (error) {
        logger.error('❌ Scheduled scrape failed', error);
    } finally {
        try {
            await database.disconnect();
        } catch (e) {
            // best-effort
        }
        isRunning = false;
    }
}

function startScheduler() {
    const enabled = (process.env.SCRAPE_SCHEDULER_ENABLED || 'true').toLowerCase() === 'true';
    if (!enabled) {
        logger.info('Scheduler disabled via SCRAPE_SCHEDULER_ENABLED=false');
        return { stop: () => { } };
    }

    const schedule = getScheduleFromEnv();
    logger.info(`Starting scheduler with cron: ${schedule}`);

    // Validate and start cron
    const task = cron.schedule(schedule, runScrapeJob, {
        scheduled: true,
        timezone: process.env.SCRAPE_CRON_TZ || 'UTC'
    });

    return {
        stop: () => task.stop(),
        start: () => task.start()
    };
}

module.exports = {
    startScheduler,
    runScrapeJob
};


