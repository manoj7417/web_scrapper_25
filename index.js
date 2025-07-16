const express = require('express');
const cors = require('cors');
const Scraper = require('./services/scraper');
const database = require('./utils/database');
const logger = require('./utils/logger');
const Tender = require('./models/Tender');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'eProcurement Scraper API',
        version: '1.0.0'
    });
});

// Get all tenders with pagination and filtering
app.get('/api/tenders', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            organisation,
            startDate,
            endDate,
            sortBy = 'publishedDate',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { organisationName: { $regex: search, $options: 'i' } }
            ];
        }

        if (organisation) {
            query.organisationName = { $regex: organisation, $options: 'i' };
        }

        if (startDate || endDate) {
            query.publishedDate = {};
            if (startDate) query.publishedDate.$gte = startDate;
            if (endDate) query.publishedDate.$lte = endDate;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const tenders = await Tender.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Tender.countDocuments(query);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: tenders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            }
        });

    } catch (error) {
        logger.error('Error fetching tenders:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tenders',
            message: error.message
        });
    }
});

// Get tender by ID
app.get('/api/tenders/:id', async (req, res) => {
    try {
        const tender = await Tender.findById(req.params.id).lean();

        if (!tender) {
            return res.status(404).json({
                success: false,
                error: 'Tender not found'
            });
        }

        res.json({
            success: true,
            data: tender
        });

    } catch (error) {
        logger.error('Error fetching tender:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tender',
            message: error.message
        });
    }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        const totalTenders = await Tender.countDocuments();
        const todayTenders = await Tender.countDocuments({
            publishedDate: {
                $gte: new Date().toISOString().split('T')[0]
            }
        });

        const organisations = await Tender.aggregate([
            { $group: { _id: '$organisationName', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                totalTenders,
                todayTenders,
                topOrganisations: organisations
            }
        });

    } catch (error) {
        logger.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics',
            message: error.message
        });
    }
});

// Manual scraping endpoint
app.post('/api/scrape', async (req, res) => {
    try {
        logger.info('Manual scraping requested via API');

        const scraper = new Scraper();
        const result = await scraper.scrape();

        res.json({
            success: true,
            message: 'Scraping completed',
            data: {
                saved: result.saved,
                duplicates: result.duplicates,
                errors: result.errors
            }
        });

    } catch (error) {
        logger.error('Error during manual scraping:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to scrape',
            message: error.message
        });
    }
});

// Search tenders
app.get('/api/search', async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }

        const tenders = await Tender.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { organisationName: { $regex: q, $options: 'i' } }
            ]
        })
            .sort({ publishedDate: -1 })
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            data: tenders
        });

    } catch (error) {
        logger.error('Error searching tenders:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search tenders',
            message: error.message
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Error handler
app.use((error, req, res, next) => {
    logger.error('API Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

async function startApplication() {
    try {
        logger.info('🚀 Starting eProcurement Scraper API...');

        // Connect to database
        await database.connect();
        logger.success('Database connected');

        // Start scraping in background (don't wait for it to complete)
        const scraper = new Scraper();
        scraper.scrape().then(result => {
            logger.success('🎉 Scraping completed!', {
                saved: result.saved,
                duplicates: result.duplicates,
                errors: result.errors
            });
        }).catch(error => {
            logger.error('Scraping failed', error);
        });

        // Start the API server
        app.listen(PORT, () => {
            logger.success(`🚀 API Server running on port ${PORT}`);
            logger.info(`Health check: http://localhost:${PORT}/health`);
            logger.info(`API Documentation: http://localhost:${PORT}/api/tenders`);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Shutting down server...');
    try {
        await database.disconnect();
    } catch (error) {
        logger.warn('Error disconnecting from database:', error.message);
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Shutting down server...');
    try {
        await database.disconnect();
    } catch (error) {
        logger.warn('Error disconnecting from database:', error.message);
    }
    process.exit(0);
});

// Start the application
startApplication(); 