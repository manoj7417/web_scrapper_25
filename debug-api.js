const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple test endpoints
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Debug API',
        message: 'API is working correctly'
    });
});

app.get('/api/tenders', (req, res) => {
    // Return mock data for testing
    res.json({
        success: true,
        data: [
            {
                _id: 'test-1',
                title: 'Test Tender 1',
                organisationName: 'Test Organisation',
                publishedDate: '2024-01-01',
                tenderLink: 'https://example.com/tender1',
                serialNumber: 'TEST001'
            },
            {
                _id: 'test-2',
                title: 'Test Tender 2',
                organisationName: 'Another Organisation',
                publishedDate: '2024-01-02',
                tenderLink: 'https://example.com/tender2',
                serialNumber: 'TEST002'
            }
        ],
        pagination: {
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1
        }
    });
});

app.get('/api/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            totalTenders: 2,
            todayTenders: 0,
            topOrganisations: [
                { _id: 'Test Organisation', count: 1 },
                { _id: 'Another Organisation', count: 1 }
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
    console.log(`🔧 Debug API Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API Tenders: http://localhost:${PORT}/api/tenders`);
    console.log(`API Stats: http://localhost:${PORT}/api/stats`);
}); 