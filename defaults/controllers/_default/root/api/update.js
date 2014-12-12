// --------------------
// API namespace controller
// update action
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
				values: {format: 'text', required: true},
				where: {format: 'text', required: true}
			}
		});
	},
	
	validate: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function(success) {
			// check `values` and `where` are valid JSON
			['values', 'where'].forEach(function(fieldName) {
				try {
					var obj = JSON.parse(this.formData[fieldName]);
					if (!_.isPlainObject(obj)) {
						this.formErrors[fieldName] = _.humanize(fieldName) + ' must be a JSON object';
						success = false;
					}
				} catch(err) {
					this.formErrors[fieldName] = _.humanize(fieldName) + ' is invalid JSON';
					success = false;
				}
			}.bind(this));
			
			return success;
		});
	},
	
	process: function() {
		// convert `values` and `where` from JSON to objects
		this.actData.values = JSON.parse(this.actData.values);
		this.actData.where = JSON.parse(this.actData.where);
	},
	
	act: function() {
		// init actResult
		this.actResult = {};
		
		// record user id and date in actData
		var actData = this.actData;
		
		_.defaults(actData.values, {
			updatedById: this.user.id,
			updatedAt: new Date()
		});
		
		// get model + check exists
		var model = this.models[actData.model];
		if (!model) {
			this.actResult = {error: 'illegalValue', field: 'model'};
			return false;
		}
		
		// run action on DB
		return model.update(actData.values, {where: actData.where, transaction: this.transaction}).bind(this)
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
