// --------------------
// Permissions resource controller
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
	},
	
	act: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function(success) {
			if (!success) return success;
			
			// add permission to root role
			return this.overlook.rootRole.addPermission(this.dataMain, {transaction: this.transaction})
			.return(success);
		});
	}
};
