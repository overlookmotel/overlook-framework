// --------------------
// Overlook
// Errors
// --------------------

// modules
var util = require('util');

// exports
var errors = module.exports = {};

errors.OverlookError = function(message) {
	var tmp = Error.call(this, message);
	tmp.name = this.name = 'OverlookError';
    this.message = tmp.message;
    Error.captureStackTrace(this, this.constructor);
};
util.inherits(errors.OverlookError, Error);
