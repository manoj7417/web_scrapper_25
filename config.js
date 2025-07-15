require('dotenv').config();

module.exports = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/eprocurement'
    },
    scraper: {
        url: 'https://eprocure.gov.in/cppp/latestactivetendersnew/cpppdata',
        timeout: 30000,
        headless: true,
        tableSelector: '#table tbody tr',
        pagination: {
            enabled: true,
            startPage: 1,
            maxPages: 10, // Limit to prevent infinite scraping
            delayBetweenPages: 2000 // 2 seconds delay between pages
        }
    }
}; 