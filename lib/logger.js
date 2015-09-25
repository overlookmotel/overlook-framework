// --------------------
// Overlook
// Logger
// --------------------

// modules
var pathModule = require('path'),
    bunyan = require('bunyan'),
    _ = require('overlook-utils');

// exports
module.exports = function(name, path) {
    // init bunyan
    var bunyanLogger = bunyan.createLogger({
        name: name,
        streams: [
            { // log INFO and above to stdout
                level: 'info',
                stream: process.stdout
            },
            { // log DEBUG and above to main log file (rotated daily)
                level: 'debug',
                type: 'rotating-file',
                path: pathModule.join(path, 'main.log'),
                period: '1d', // daily rotation
                count: 365 // do not clear logs for 1 year
            },
            { // log errors and warnings to error log
                level: 'warn',
                path: pathModule.join(path, 'error.log')
            }
        ]
    });

    // create custom logger
    return new Logger(function(level, msg, obj) {
        if (!obj) return bunyanLogger[level](msg);

        if (obj instanceof Error) obj = {err: obj};

        var errors = {},
            error = true;
        _.forIn(obj, function(val, name) {
            if (!(val instanceof Error)) return;

            error = true;
            errors[name] = {name: val.name, message: val.message, stack: val.stack};
        });

        if (error) obj = _.defaults(errors, obj);

        return bunyanLogger[level](obj, msg);
    });
};

// Logger constructor
// Returns a function
function Logger(handler) {
    var logger = function() {
        return logger.info.apply(logger, arguments);
    };

    logger._handler = handler;

    Object.setPrototypeOf(logger, Logger.prototype);

    return logger;
}

['fatal', 'error', 'warn', 'info', 'debug', 'trace'].forEach(function(level) {
    Logger.prototype[level] = function(msg, obj) {
        return this._handler(level, msg, obj);
    };
});

// child method to create new logger with bound fields
Logger.prototype.child = function(addObj) {
    var parent = this;

    return new Logger(function(level, msg, obj) {
        if (obj && obj instanceof Error) obj = {err: obj};

        obj = _.extend({}, addObj, obj || {});

        return parent._handler(level, msg, obj);
    });
};
