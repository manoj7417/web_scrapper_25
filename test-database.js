const database = require('./utils/database');
const Tender = require('./models/Tender');
const logger = require('./utils/logger');

async function testDatabase() {
    try {
        logger.info('🔍 Testing database connection and data...');

        // Connect to database
        await database.connect();
        logger.success('✅ Database connected successfully');

        // Check if we have any tenders
        const totalTenders = await Tender.countDocuments();
        logger.info(`📊 Total tenders in database: ${totalTenders}`);

        if (totalTenders > 0) {
            // Get a sample tender
            const sampleTender = await Tender.findOne().lean();
            logger.success('✅ Sample tender found:');
            logger.info(`Title: ${sampleTender.title}`);
            logger.info(`Published Date: ${sampleTender.publishedDate}`);
            logger.info(`Organization: ${sampleTender.organisationName}`);
        } else {
            logger.warn('⚠️ No tenders found in database');
            logger.info('This could mean:');
            logger.info('1. The scraper hasn\'t run yet');
            logger.info('2. The scraping failed');
            logger.info('3. The database is empty');
        }

        // Check database stats
        const stats = await Tender.aggregate([
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        logger.info('📈 Database statistics:');
        logger.info(`Total documents: ${stats[0]?.count || 0}`);

        // Check recent tenders
        const recentTenders = await Tender.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        logger.info('📅 Recent tenders:');
        recentTenders.forEach((tender, index) => {
            logger.info(`${index + 1}. ${tender.title} (${tender.publishedDate})`);
        });

    } catch (error) {
        logger.error('❌ Database test failed:', error.message);
        process.exit(1);
    } finally {
        await database.disconnect();
        logger.info('🔌 Database disconnected');
    }
}

testDatabase(); 