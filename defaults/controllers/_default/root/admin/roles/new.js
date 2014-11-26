// --------------------
// Roles resource controller
// edit action
// --------------------

// modules
var _ = require('overlook-utils');

// exports

// action definition
exports = module.exports = {
	// functions
	
	initForm: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			// modify form
			delete this.form.fields.type;
		});
	}
};
