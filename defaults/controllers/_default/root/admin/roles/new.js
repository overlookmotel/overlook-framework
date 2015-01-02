// --------------------
// Roles resource controller
// new action
// --------------------

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
