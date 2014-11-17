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
			_.forEach(['isRoot', 'isPublic'], function(fieldName) {
				delete this.form.fields[fieldName];
			}, this);
		});
	}
};
