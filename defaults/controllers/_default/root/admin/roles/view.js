// --------------------
// Roles resource controller
// view action
// --------------------

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
