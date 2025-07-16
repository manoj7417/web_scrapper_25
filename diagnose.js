const express = require('express');
const app = express();

// Diagnostic endpoints
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Diagnostic API',
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000,
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        env: {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set'
        }
    });
});

app.get('/api/tenders', (req, res) => {
    res.json({
        success: true,
        message: 'Diagnostic API - Tenders endpoint working',
        data: [
            {
                _id: 'diagnostic-1',
                title: 'Diagnostic Test Tender',
                organisationName: 'Test Org',
                publishedDate: '2024-01-01',
                tenderLink: 'https://example.com/test'
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
        message: 'Diagnostic API - Stats endpoint working',
        data: {
            totalTenders: 1,
            todayTenders: 0,
            topOrganisations: [
                { _id: 'Test Org', count: 1 }
            ]
        }
    });
});

app.get('/debug', (req, res) => {
    res.json({
        success: true,
        message: 'Debug information',
        process: {
            pid: process.pid,
            version: process.version,
            platform: process.platform,
            arch: process.arch,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        },
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set'
        },
        request: {
            method: req.method,
            url: req.url,
            headers: req.headers
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableRoutes: ['/health', '/api/tenders', '/api/stats', '/debug']
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔧 Diagnostic API running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Tenders: http://localhost:${PORT}/api/tenders`);
    console.log(`Stats: http://localhost:${PORT}/api/stats`);
    console.log(`Debug: http://localhost:${PORT}/debug`);
}); 