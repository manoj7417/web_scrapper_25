const mongoose = require('mongoose');
const config = require('../config');
const logger = require('./logger');

class Database {
    async connect() {
        try {
            await mongoose.connect(config.mongodb.uri, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            logger.success('Database connected');
        } catch (error) {
            logger.error('Database connection failed', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            logger.success('Database disconnected');
        } catch (error) {
            logger.error('Database disconnection failed', error);
        }
    }

    async healthCheck() {
        try {
            const status = mongoose.connection.readyState;
            const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
            return states[status] || 'unknown';
        } catch (error) {
            logger.error('Health check failed', error);
            return 'error';
        }
    }
}

module.exports = new Database(); 