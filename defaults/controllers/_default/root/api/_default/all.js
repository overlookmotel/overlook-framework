// --------------------
// API namespace controller
// Default action
// --------------------

// exports

exports = module.exports = {
	access: function() {
		// allow access if admin user
		return !!this.user.permissions.API;
	}
};
