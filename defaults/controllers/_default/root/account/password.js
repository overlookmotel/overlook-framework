// --------------------
// Users resource controller
// password action
// --------------------

// libraries
var forms = require('../../../../../lib/forms'),
	authentication = require('../../../../../lib/authentication');

// imports
var actionEdit = require('./edit');

// exports

exports = module.exports = {
	// action params
	actionTypes: {
		form: true
	},

	titleAction: 'Change Password',
	title: 'Change Password',

	// functions

	initForm: function() {
		// create form
		this.form = forms.createForm({
			fields: {
				password: {format: 'password', required: true}
			}
		});
	},

	load: function() {
		return this.route.actions.index.load.call(this);
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

	act: actionEdit.act,

	done: function() {
		return this.redirect('./', 'Password changed');
	},

	failed: function() {
		throw new Error('Unknown error returned from act function');
	}
};
