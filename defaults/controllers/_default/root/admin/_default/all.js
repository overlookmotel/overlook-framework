// --------------------
// Admin namespace controller
// Default action
// --------------------

// exports

exports = module.exports = {
	access: function(defaultFn) {
		return defaultFn();
		//xxx access control for admin namespace should be here, but it won't work at present
	}
};
