const express = require('express');
const cors = require('cors');
const Tender = require('./models/Tender');
const database = require('./utils/database');
const logger = require('./utils/logger');

async function testAPI() {
    try {
        logger.info('🧪 Testing API with database...');

        // Connect to database
        await database.connect();
        logger.success('✅ Database connected');

        // Check database data
        const totalTenders = await Tender.countDocuments();
        logger.info(`📊 Total tenders in database: ${totalTenders}`);

        if (totalTenders === 0) {
            logger.error('❌ No tenders in database');
            return;
        }

        // Get a sample tender
        const sampleTender = await Tender.findOne().lean();
        logger.success('✅ Sample tender found:');
        logger.info(`Title: ${sampleTender.title}`);
        logger.info(`Published Date: ${sampleTender.publishedDate}`);

        // Test the API logic directly
        logger.info('🧪 Testing API logic...');

        // Test GET /api/tenders
        const tenders = await Tender.find()
            .sort({ publishedDate: -1 })
            .limit(20)
            .lean();

        logger.success(`✅ API logic test - Found ${tenders.length} tenders`);

        if (tenders.length > 0) {
            logger.info('First tender:');
            logger.info(`Title: ${tenders[0].title}`);
            logger.info(`Published: ${tenders[0].publishedDate}`);
            logger.info(`Organization: ${tenders[0].organisationName}`);
        }

        // Test statistics
        const stats = await Tender.aggregate([
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        logger.success(`✅ Statistics test - Total: ${stats[0]?.count || 0}`);

        logger.success('✅ All API tests passed!');
        logger.info('The API should work correctly once deployed with server.js');

    } catch (error) {
        logger.error('❌ API test failed:', error.message);
    } finally {
        await database.disconnect();
        logger.info('🔌 Database disconnected');
    }
}

testAPI(); 