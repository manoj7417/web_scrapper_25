const app = require('./api');
const database = require('./utils/database');
const Tender = require('./models/Tender');
const logger = require('./utils/logger');

async function testAPI() {
    try {
        logger.info('🧪 Testing API locally...');

        // Connect to database
        await database.connect();
        logger.success('✅ Database connected');

        // Test database data
        const totalTenders = await Tender.countDocuments();
        logger.info(`📊 Total tenders in database: ${totalTenders}`);

        if (totalTenders === 0) {
            logger.error('❌ No tenders in database');
            return;
        }

        // Test API endpoints
        const testCases = [
            {
                name: 'GET /health',
                method: 'GET',
                url: '/health'
            },
            {
                name: 'GET /api/tenders',
                method: 'GET',
                url: '/api/tenders'
            },
            {
                name: 'GET /api/tenders with pagination',
                method: 'GET',
                url: '/api/tenders?page=1&limit=5'
            },
            {
                name: 'GET /api/stats',
                method: 'GET',
                url: '/api/stats'
            }
        ];

        for (const testCase of testCases) {
            try {
                logger.info(`Testing: ${testCase.name}`);

                // Create a mock request and response
                const req = {
                    method: testCase.method,
                    url: testCase.url,
                    query: new URLSearchParams(testCase.url.split('?')[1] || '').reduce((acc, [key, value]) => {
                        acc[key] = value;
                        return acc;
                    }, {})
                };

                const res = {
                    statusCode: 200,
                    headers: {},
                    json: (data) => {
                        logger.success(`✅ ${testCase.name} - Status: ${res.statusCode}`);
                        logger.info(`Response data:`, JSON.stringify(data, null, 2));
                    },
                    status: (code) => {
                        res.statusCode = code;
                        return res;
                    }
                };

                // Find the route handler
                const route = app._router.stack.find(layer => {
                    if (layer.route) {
                        return layer.route.path === testCase.url.split('?')[0] &&
                            layer.route.methods[testCase.method.toLowerCase()];
                    }
                    return false;
                });

                if (route) {
                    // Execute the route handler
                    await route.route.stack[0].handle(req, res, () => { });
                } else {
                    logger.warn(`⚠️ Route not found: ${testCase.method} ${testCase.url}`);
                }

            } catch (error) {
                logger.error(`❌ ${testCase.name} failed:`, error.message);
            }
        }

        logger.success('✅ API test completed');

    } catch (error) {
        logger.error('❌ API test failed:', error.message);
    } finally {
        await database.disconnect();
        logger.info('🔌 Database disconnected');
    }
}

testAPI(); 