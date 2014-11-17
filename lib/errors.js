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
};
util.inherits(errors.OverlookError, Error);
