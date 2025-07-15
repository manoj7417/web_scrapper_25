require('dotenv').config();

module.exports = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/eprocurement'
    },
    scraper: {
        url: 'https://eprocure.gov.in/cppp/latestactivetendersnew/cpppdata',
        timeout: 30000,
        headless: process.env.NODE_ENV === 'production' ? true : true,
        tableSelector: '#table tbody tr',
        pagination: {
            enabled: true,
            startPage: 1,
            maxPages: process.env.NODE_ENV === 'production' ? 5 : 10, // Limit pages in production
            delayBetweenPages: 2000
        }
    },
    server: {
        port: process.env.PORT || 3000
    }
}; 