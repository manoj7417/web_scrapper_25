const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');

async function checkBuild() {
    logger.info('🔍 Checking build configuration...');

    const checks = [
        {
            name: 'Package.json exists',
            check: () => fs.existsSync('package.json'),
            fix: 'Create package.json file'
        },
        {
            name: 'Start script exists',
            check: () => fs.existsSync('start.js'),
            fix: 'Create start.js file'
        },
        {
            name: 'Main entry point exists',
            check: () => fs.existsSync('index.js'),
            fix: 'Create index.js file'
        },
        {
            name: 'Config file exists',
            check: () => fs.existsSync('config.js'),
            fix: 'Create config.js file'
        },
        {
            name: 'Services directory exists',
            check: () => fs.existsSync('services/scraper.js'),
            fix: 'Create services/scraper.js file'
        },
        {
            name: 'Utils directory exists',
            check: () => fs.existsSync('utils/logger.js') && fs.existsSync('utils/database.js'),
            fix: 'Create utils directory with logger.js and database.js'
        },
        {
            name: 'Models directory exists',
            check: () => fs.existsSync('models/Tender.js'),
            fix: 'Create models/Tender.js file'
        },
        {
            name: 'Gitignore exists',
            check: () => fs.existsSync('.gitignore'),
            fix: 'Create .gitignore file'
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const check of checks) {
        try {
            if (check.check()) {
                logger.success(`✅ ${check.name}`);
                passed++;
            } else {
                logger.error(`❌ ${check.name} - ${check.fix}`);
                failed++;
            }
        } catch (error) {
            logger.error(`❌ ${check.name} - Error: ${error.message}`);
            failed++;
        }
    }

    logger.info(`Build check completed: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
        logger.error('Build check failed. Please fix the issues above.');
        process.exit(1);
    } else {
        logger.success('✅ All build checks passed!');
    }
}

checkBuild().catch(error => {
    logger.error('Build check failed', error);
    process.exit(1);
}); 