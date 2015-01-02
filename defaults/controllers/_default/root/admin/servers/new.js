// --------------------
// Servers resource controller
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
			forms.addField(this.form, 'password', {format: 'password', required: true});
		});
	},

	process: function() {
		// create password hash
		return authentication.makeHash(this.actData.password).bind(this)
		.then(function(hash) {
			// store hash and key in actData
			this.actData.passwordHash = hash;
			delete this.actData.password;
		});
	}
};
