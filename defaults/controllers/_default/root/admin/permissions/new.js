// --------------------
// Permissions resource controller
// new action
// --------------------

// exports

// action definition
exports = module.exports = {
	fieldsExclude: ['type'],

	// functions

	act: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function(success) {
			if (!success) return success;

			// add permission to root role
			return this.overlook.rootRole.addPermission(this.dataMain)
			.return(success);
		});
	}
};
