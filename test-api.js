const express = require('express');
const app = express();

// Simple test server
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Test API'
    });
});

app.get('/api/tenders', (req, res) => {
    res.json({
        success: true,
        data: [
            {
                id: 'test-1',
                title: 'Test Tender 1',
                organisationName: 'Test Org',
                publishedDate: '2024-01-01'
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Test API running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Tenders: http://localhost:${PORT}/api/tenders`);
}); 