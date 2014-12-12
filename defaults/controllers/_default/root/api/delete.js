// --------------------
// API namespace controller
// delete action
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
				where: {format: 'text', required: true}
			}
		});
	},
	
	validate: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function(success) {
			// check `where` is valid JSON
			try {
				var obj = JSON.parse(this.formData.where);
				if (!_.isPlainObject(obj)) {
					this.formErrors.where = 'Where must be a JSON object';
					return false;
				}
			} catch(err) {
				this.formErrors.where = 'Where is invalid JSON';
				return false;
			}
			
			return success;
		});
	},
	
	process: function() {
		// convert where from JSON to object
		this.actData.where = JSON.parse(this.actData.where);
	},
	
	act: function() {
		// init actResult
		this.actResult = {};
		
		// record user id and date in actData
		var actData = this.actData;
		
		// get model + check exists
		var model = this.models[actData.model];
		if (!model) {
			this.actResult = {error: 'illegalValue', field: 'model'};
			return false;
		}
		
		// run action on DB
		return model.destroy({where: actData.where, transaction: this.transaction}).bind(this)
		.return(true)
		.catch(this.sequelize.ForeignKeyConstraintError, function(err) { // jshint ignore:line
			// cannot be deleted
			this.actResult = {error: 'cannotDelete', field: 'where'};
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
		if (error == 'cannotDelete') {
			this.formErrors[field] = 'Cannot be deleted';
			return;
		}
		
		throw new Error('Unknown error returned from act function');
	}
};
