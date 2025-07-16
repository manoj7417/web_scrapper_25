const express = require('express');
const app = express();

// Simple test server for Render deployment
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Render Test API',
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000
    });
});

app.get('/api/tenders', (req, res) => {
    res.json({
        success: true,
        message: 'API is working - this is test data',
        data: [
            {
                _id: 'render-test-1',
                title: 'Render Test Tender 1',
                organisationName: 'Test Organisation',
                publishedDate: '2024-01-01',
                tenderLink: 'https://example.com/tender1'
            }
        ],
        pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1
        }
    });
});

app.get('/api/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            totalTenders: 1,
            todayTenders: 0,
            topOrganisations: [
                { _id: 'Test Organisation', count: 1 }
            ]
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableRoutes: ['/health', '/api/tenders', '/api/stats']
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Render Test API running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Tenders: http://localhost:${PORT}/api/tenders`);
    console.log(`Stats: http://localhost:${PORT}/api/stats`);
}); 