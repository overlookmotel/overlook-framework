// --------------------
// Roles resource controller
// delete action
// --------------------

// exports

// action definition
exports = module.exports = {
	// functions
	
	access: function(defaultFn) {
		return defaultFn().bind(this)
		.ifElse(function() {
			// check if is public/root role, and say no access if so
			return !this.dataMain.isPublic && !this.dataMain.isRoot;
		}, function() {
			return false;
		});
	}
};
