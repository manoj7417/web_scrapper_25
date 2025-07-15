const fs = require('fs');
const path = require('path');

console.log('🔍 Checking file structure and paths...');

// Check current working directory
console.log('Current working directory:', process.cwd());

// Check if key files exist
const filesToCheck = [
    'package.json',
    'start.js',
    'index.js',
    'config.js',
    'services/scraper.js',
    'utils/logger.js',
    'utils/database.js',
    'models/Tender.js'
];

console.log('\n📁 Checking file existence:');
filesToCheck.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check directory structure
console.log('\n📂 Directory structure:');
function listDir(dir, indent = '') {
    try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            const icon = stat.isDirectory() ? '📁' : '📄';
            console.log(`${indent}${icon} ${item}`);

            if (stat.isDirectory() && item !== 'node_modules' && item !== '.git') {
                listDir(fullPath, indent + '  ');
            }
        });
    } catch (error) {
        console.log(`${indent}❌ Error reading ${dir}:`, error.message);
    }
}

listDir('.');

// Test module loading
console.log('\n🧪 Testing module loading:');
try {
    const logger = require('./utils/logger');
    console.log('✅ utils/logger loaded successfully');
} catch (error) {
    console.log('❌ utils/logger failed:', error.message);
}

try {
    const database = require('./utils/database');
    console.log('✅ utils/database loaded successfully');
} catch (error) {
    console.log('❌ utils/database failed:', error.message);
}

try {
    const scraper = require('./services/scraper');
    console.log('✅ services/scraper loaded successfully');
} catch (error) {
    console.log('❌ services/scraper failed:', error.message);
}

console.log('\n✅ Path test completed'); 