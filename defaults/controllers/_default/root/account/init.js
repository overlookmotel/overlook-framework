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
		// make form
		this.form = forms.createFormFromModel(this.route.overlook.models.user);
		
		// modify form fields
		delete this.form.fields.type;
		delete this.form.fields.isActive;
		
		forms.addField(this.form, 'password', {format: 'password', required: true});
	},
	
	load: function() {
		return this.route.actions.edit.load.call(this);
	},
	
	access: function() {
		return !!this.user.id;
	},
	
	populate: defaultActionEdit.populate,
	
	process: function() {
		return this.route.actions.password.process.call(this);
	},
	
	act: function() {
		// init actResult
		this.actResult = {};
		
		// record user id and date
		this.actData.updatedById = this.user.id;
		this.actData.updatedAt = new Date();
		
		// flag as initialized
		this.actData.isInitialized = true;
		
		// update db
		return this.dataMain.updateAttributes(this.actData, {transaction: this.transaction}).bind(this)
		.return(true)
		.catch(this.sequelize.UniqueConstraintError, function(err) {
			// unique field not unique
			this.actResult = {error: 'uniqueFail', field: err.index};
			return false;
		});
	},
	
	done: function() {
		return this.redirect('/', 'Saved changes to your account details');
	},
	
	failed: defaultActionEdit.failed
};
