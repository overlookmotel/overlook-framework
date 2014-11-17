// --------------------
// Root namespace controller
// logout action
// --------------------

// libraries
var authentication = require('../../../../lib/authentication');

// exports

// action definition
exports = module.exports = {
	// action params
	title: 'Logout',
	view: false,
	actLocal: true,
	
	// functions
	
	get: function() {
		// logout user
		return authentication.logout(this.user, this.res, this.overlook).bind(this)
		.then(function() {
			// redirect to homepage
			return this.redirect('/', 'You are logged out');
		});
	}
};
