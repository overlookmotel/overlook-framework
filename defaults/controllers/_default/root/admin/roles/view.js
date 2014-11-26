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
			delete this.fields.type;
		});
	}
};
