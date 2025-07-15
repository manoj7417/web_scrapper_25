const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema({
    serialNumber: String,
    publishedDate: String,
    bidSubmissionClosingDate: String,
    tenderOpeningDate: String,
    title: { type: String, required: true },
    tenderLink: String,
    organisationName: String,
    corrigendum: { type: String, default: '' },
    scrapedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Prevent duplicates
tenderSchema.index({ title: 1, publishedDate: 1 }, { unique: true });

module.exports = mongoose.model('Tender', tenderSchema); 