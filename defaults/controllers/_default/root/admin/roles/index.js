// --------------------
// Roles resource controller
// index action
// --------------------

// exports

// action definition
exports = module.exports = {
	// functions
	
	init: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			// set up fields
			delete this.fields.isRoot;
			delete this.fields.isPublic;
		});
	}
};
