class Logger {
    constructor() {
        if (Logger.instance) {
            return Logger.instance;
        }
        Logger.instance = this;
        this.isDevelopment = process.env.NODE_ENV !== 'production';
    }

    info(message, ...args) {
        console.log(`ℹ️  [INFO] ${new Date().toISOString()} -`, message, ...args);
    }

    error(message, ...args) {
        console.error(`❌ [ERROR] ${new Date().toISOString()} -`, message, ...args);
    }

    warn(message, ...args) {
        console.warn(`⚠️  [WARN] ${new Date().toISOString()} -`, message, ...args);
    }

    debug(message, ...args) {
        if (this.isDevelopment) {
            console.log(`🐛 [DEBUG] ${new Date().toISOString()} -`, message, ...args);
        }
    }

    success(message, ...args) {
        console.log(`✅ [SUCCESS] ${new Date().toISOString()} -`, message, ...args);
    }
}

// Export singleton instance
module.exports = new Logger();
