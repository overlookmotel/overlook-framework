// --------------------
// Users resource controller
// new action
// --------------------

// libraries
var forms = require('../../../../../../lib/forms'),
	authentication = require('../../../../../../lib/authentication');

// exports

// action definition
exports = module.exports = {
	// functions

	initForm: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			// modify form
			delete this.form.fields.type;
			forms.addField(this.form, 'password', {format: 'password', required: true});
		});
	},

	process: function() {
		// create password hash
		return authentication.makeHashAndKey(this.actData.password).bind(this)
		.spread(function(hash, key) {
			// store hash and key in actData
			this.actData.passwordHash = hash;
			this.actData.cookieKey = key;
			delete this.actData.password;
		});
	},

	act: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function(success) {
			if (!success) return success;

			// add user role to user
			return this.dataMain.addRole(this.overlook.userRole, {transaction: this.transaction})
			.return(success);
		});
	}
};
