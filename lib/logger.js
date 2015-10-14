// --------------------
// Overlook
// Logger
// --------------------

// modules
var pathModule = require('path'),
    bunyanesque = require('bunyanesque');

// exports
module.exports = function(name, path) {
    // init bunyan
    return bunyanesque.createLogger({
        name: name,
        streams: [
            { // log INFO and above to stdout
                level: 'info',
                stream: process.stdout
            },
            { // log all to main log file (rotated daily)
                level: 'trace',
                type: 'rotating-file',
                path: pathModule.join(path, 'main.log'),
                period: '1d', // daily rotation
                count: 365 // do not clear logs for 1 year
            },
            { // log errors and warnings to error log
                level: 'warn',
                path: pathModule.join(path, 'error.log')
            }
        ],
        serializers: bunyanesque.stdSerializers
    });
};
