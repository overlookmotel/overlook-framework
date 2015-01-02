// --------------------
// Users resource controller
// delete action
// --------------------

// exports

// action definition
exports = module.exports = {
	// functions

	access: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function(allowed) {
			// check if is system/public/root user, and say no access if so
			return allowed && this.dataMain.type == null;
		});
	}
};
