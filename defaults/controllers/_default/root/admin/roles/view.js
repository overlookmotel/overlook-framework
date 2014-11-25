// --------------------
// Roles resource controller
// view action
// --------------------

// modules
var _ = require('overlook-utils');

// exports

// action definition
exports = module.exports = {
	// functions
	
	init: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			// modify fields
			_.forEach(['isRoot', 'isPublic'], function(fieldName) {
				delete this.fields[fieldName];
			}, this);
		});
	}
};
