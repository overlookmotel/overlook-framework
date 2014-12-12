// --------------------
// API namespace controller
// insert action
// --------------------

// modules
var _ = require('overlook-utils');

// libraries
var forms = require('../../../../../lib/forms');

// exports

// action definition
exports = module.exports = {
	// action params
	actionTypes: {
		form: true
	},
	
	// functions
	
	initForm: function() {
		// make form
		this.form = forms.createForm({
			fields: {
				model: {format: 'string', required: true},
				values: {format: 'text', required: true}
			}
		});
	},
	
	validate: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function(success) {
			// check `values` is valid JSON
			try {
				var obj = JSON.parse(this.formData.values);
				if (!_.isPlainObject(obj)) {
					this.formErrors.values = 'Values must be a JSON object';
					return false;
				}
			} catch(err) {
				this.formErrors.values = 'Values is invalid JSON';
				return false;
			}
			
			return success;
		});
	},
	
	process: function() {
		// convert values from JSON to object
		this.actData.values = JSON.parse(this.actData.values);
	},
	
	act: function() {
		// init actResult
		this.actResult = {};
		
		// record user id and date in actData
		var actData = this.actData,
			values = actData.values;
		
		_.defaults(values, {
			createdById: this.user.id,
			createdAt: new Date()
		});
		
		_.defaults(values, {
			updatedById: values.createdById,
			updatedAt: values.createdAt
		});
		
		// get model + check exists
		var model = this.models[actData.model];
		if (!model) {
			this.actResult = {error: 'illegalValue', field: 'model'};
			return false;
		}
		
		// run action on DB
		return model.create(values, {transaction: this.transaction}).bind(this)
		.return(true)
		.catch(this.sequelize.UniqueConstraintError, function(err) { // jshint ignore:line
			// unique field not unique
			this.actResult = {error: 'uniqueFail', field: 'values'};
			return false;
		})
		.catch(this.sequelize.ForeignKeyConstraintError, function(err) { // jshint ignore:line
			// bad reference to another model
			this.actResult = {error: 'illegalValue', field: 'values'};
			return false;
		});
	},
	
	done: function() {
		// redirect to admin page
		return this.redirect('./', 'Action completed');
	},
	
	failed: function() {
		var error = this.actResult.error,
			field = this.actResult.field;
		
		if (error == 'illegalValue') {
			this.formErrors[field] = this.form.fields[field].label + ' is invalid';
			return;
		}
		if (error == 'uniqueFail') {
			this.formErrors[field] = 'Unique constraint violated';
			return;
		}
		
		throw new Error('Unknown error returned from act function');
	}
};