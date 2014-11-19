// --------------------
// Overlook
// Errors
// --------------------

// modules
var util = require('util');

// exports
var errors = module.exports = {};

errors.OverlookError = function(message) {
	Error.call(this, message);
	this.name = 'OverlookError';
	this.message = message;
};
util.inherits(errors.OverlookError, Error);
