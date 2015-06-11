// --------------------
// Users resource controller
// password action
// --------------------

// libraries
var forms = require('../../../../../../lib/forms');

// exports

exports = module.exports = {
	// action params
	actionTypes: {
		item: true,
		form: true
	},

	titleAction: 'Change Password',

	// functions

	initForm: function() {
		// create form
		this.form = forms.createForm({
			fields: {
				password: {format: 'password', required: true}
			}
		});
	},

	access: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function(allowed) {
			// check if is system/public user, and say no access if so
			return allowed && this.dataMain.type != 'system' && this.dataMain.type != 'public';
		});
	},

	process: function() {
		// run process action from new action to encode password
		return this.route.actions.new.process.call(this);
	},

	act: function() {
		// init actResult
		this.actResult = {};

		// record user id and date
		this.actData.updatedById = this.user.id;
		this.actData.updatedAt = new Date();

		// update db
		return this.dataMain.updateAttributes(this.actData).bind(this)
		.return(true);
	},

	done: function() {
		return this.redirect('./', 'Saved new password for ' + this.dataMain.name);
	},

	failed: function() {
		throw new Error('Unknown error returned from act function');
	},

	makeTitle: function() {
		this.title = 'Change Password for ' + this.dataMain.name;
	}
};
