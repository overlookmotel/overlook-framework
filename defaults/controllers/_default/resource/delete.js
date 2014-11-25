// --------------------
// Default resource controller
// delete action
// --------------------

// modules
var _ = require('overlook-utils');

// libraries
var forms = require('../../../../lib/forms');

// exports

// action definition
exports = module.exports = {
	// action params
	actionTypes: {
		item: true,
		form: true
	},
	
	// functions
	
	initForm: function() {
		// init form
		var form = {
			fields: {},
			submit: {text: 'Delete', glyph: 'trash', mode: 'danger'}
		};
		this.form = forms.createForm(form);
	},
	
	act: function() {
		this.actData.updatedById = this.user.id;
		this.actData.updatedAt = new Date();
		
		// delete item
		return this.dataMain.destroy({transaction: this.transaction}).bind(this)
		.return(true)
		.catch(this.sequelize.ForeignKeyConstraintError, function(err) { // jshint ignore:line
			// cannot be deleted
			this.actResult = {error: 'cannotDelete'};
			return false;
		});
	},
	
	done: function() {
		return this.redirect('../', 'Deleted ' + this.dataMain.name);
	},
	
	failed: function() {
		var error = this.actResult.error;
		if (error == 'cannotDelete') {
			this.formErrors._dummy = this.dataMain.name + ' cannot be deleted';
			return;
		}
		
		throw new Error('Unknown error returned from act function');
	},
	
	makeDisplayOptions: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			this.displayOptions.options.data = _.set({}, this.model.name, forms.getValuesByFields(this.dataMain, {name: {}}));
		});
	}
};
