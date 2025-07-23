const mongoose = require('mongoose');

const ukJobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: String,
    location: String,
    salary: String,
    jobType: String, // Permanent, Contract, Temporary, Apprenticeship
    workType: String, // Full time, Part time
    remoteType: String, // On-site only, Hybrid remote, Fully remote
    postedDate: String,
    jobLink: String,
    description: String,
    category: String, // Healthcare & Nursing, Education & Childcare, etc.
    scrapedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Prevent duplicates based on title, company, and location
ukJobSchema.index({ title: 1, company: 1, location: 1 }, { unique: true });

module.exports = mongoose.model('UKJob', ukJobSchema); 