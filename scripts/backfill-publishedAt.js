require('dotenv').config();
const mongoose = require('mongoose');
const Tender = require('../models/Tender');

function parseDate(text) {
    if (!text) return null;
    const t = String(text).trim();
    const native = new Date(t);
    if (!isNaN(native.getTime())) return native;

    let m = t.match(/^([0-3]?\d)[\/\-]([0-1]?\d)[\/\-](\d{4})\s+([0-2]?\d):([0-5]\d)$/);
    if (m) {
        const d = parseInt(m[1], 10);
        const mo = parseInt(m[2], 10) - 1;
        const y = parseInt(m[3], 10);
        const hh = parseInt(m[4], 10);
        const mm = parseInt(m[5], 10);
        return new Date(Date.UTC(y, mo, d, hh, mm));
    }

    m = t.match(/^([0-3]?\d)[\/\-]([0-1]?\d)[\/\-](\d{4})$/);
    if (m) {
        const d = parseInt(m[1], 10);
        const mo = parseInt(m[2], 10) - 1;
        const y = parseInt(m[3], 10);
        return new Date(Date.UTC(y, mo, d));
    }

    m = t.match(/^([0-3]?\d)[\- ]([A-Za-z]{3})[\- ](\d{4})\s+([0-1]?\d):([0-5]\d)\s*(AM|PM)$/i);
    if (m) {
        const d = parseInt(m[1], 10);
        const monStr = m[2].toLowerCase();
        const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
        const mo = months[monStr];
        const y = parseInt(m[3], 10);
        let hh = parseInt(m[4], 10);
        const mm = parseInt(m[5], 10);
        const ampm = m[6].toUpperCase();
        if (ampm === 'PM' && hh !== 12) hh += 12;
        if (ampm === 'AM' && hh === 12) hh = 0;
        if (mo !== undefined) return new Date(Date.UTC(y, mo, d, hh, mm));
    }

    m = t.match(/^([0-3]?\d)[\- ]([A-Za-z]{3})[\- ](\d{4})$/);
    if (m) {
        const d = parseInt(m[1], 10);
        const monStr = m[2].toLowerCase();
        const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
        const mo = months[monStr];
        const y = parseInt(m[3], 10);
        if (mo !== undefined) return new Date(Date.UTC(y, mo, d));
    }

    return null;
}

async function run() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eprocurement';
    await mongoose.connect(uri);
    try {
        const cursor = Tender.find({ $or: [{ publishedAt: { $exists: false } }, { publishedAt: null }] }).cursor();
        let updated = 0, skipped = 0;
        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            const dt = parseDate(doc.publishedDate);
            if (dt) {
                doc.publishedAt = dt;
                try {
                    await doc.save();
                    updated++;
                } catch (e) {
                    skipped++;
                }
            } else {
                skipped++;
            }
        }
        console.log(JSON.stringify({ updated, skipped }));
    } finally {
        await mongoose.disconnect();
    }
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});


