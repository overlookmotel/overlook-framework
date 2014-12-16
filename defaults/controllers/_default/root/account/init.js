// --------------------
// Account namespace controller
// init action
// --------------------

// libraries
var forms = require('../../../../../lib/forms');

// imports
var defaultActionEdit = require('../../resource/edit');

// exports

// action definition
exports = module.exports = {
	// action params
	actionTypes: {
		form: true
	},
	
	title: 'Welcome',
	
	// functions
	
	initForm: function() {
		// call edit action initForm()
		this.route.actions.edit.initForm.call(this);
		
		// add password field
		forms.addField(this.form, 'password', {format: 'password', required: true});
	},
	
	load: function(defaultFn) {
		return this.route.actions.edit.load.call(this, defaultFn);
	},
	
	access: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			return !!this.user.id;
		});
	},
	
	populate: function(defaultFn) {
		return this.route.actions.edit.populate.call(this, defaultFn);
	},
	
	process: function(defaultFn) {
		return this.route.actions.password.process.call(this, defaultFn);
	},
	
	act: function(defaultFn) {
		// flag as initialized
		this.actData.isInitialized = true;
		
		// update user
		return this.route.actions.edit.act.call(this, defaultFn).bind(this);
	},
	
	done: function() {
		return this.redirect('/', 'Saved changes to your account details');
	},
	
	failed: defaultActionEdit.failed
};
