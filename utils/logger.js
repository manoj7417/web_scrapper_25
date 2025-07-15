const config = require('../config');

class Logger {
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

        switch (level) {
            case 'error':
                console.error(logMessage);
                break;
            case 'warn':
                console.warn(logMessage);
                break;
            case 'success':
                console.log('\x1b[32m%s\x1b[0m', logMessage);
                break;
            default:
                console.log(logMessage);
        }

        if (data) {
            console.log('Data:', JSON.stringify(data, null, 2));
        }
    }

    info(message, data = null) {
        this.log('info', message, data);
    }

    error(message, error = null) {
        this.log('error', message);
        if (error) {
            console.error('Error:', error.message);
        }
    }

    warn(message, data = null) {
        this.log('warn', message, data);
    }

    success(message, data = null) {
        this.log('success', message, data);
    }
}

module.exports = new Logger(); 