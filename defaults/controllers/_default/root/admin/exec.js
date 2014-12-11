// --------------------
// Admin namespace controller
// exec action
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
	
	title: 'Execute action on database',
	
	// functions
	
	initForm: function() {
		// make form
		this.form = forms.createForm({
			fields: {
				action: {format: 'enum', required: true, values: ['insert', 'update', 'delete']},
				model: {format: 'string', required: true},
				values: {format: 'text', required: false},
				id: {format: 'int', required: false, label: 'ID'},
				where: {format: 'text', required: false}
			}
		});
	},
	
	validate: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			// check values and where are valid JSON
			var formData = this.formData;
			
			['values', 'where'].forEach(function(fieldName) {
				try {
					var value = formData[fieldName];
					if (value) {
						var obj = JSON.parse(value);
						if (!_.isPlainObject(obj)) this.formErrors[fieldName] = _.humanize(fieldName) + ' must be a JSON object';
					}
				} catch(err) {
					this.formErrors[fieldName] = _.humanize(fieldName) + ' is invalid JSON';
				}
			}.bind(this));
			
			// check correct fields filled in
			if (formData.action != 'insert' && !formData.id && !formData.where) this.formErrors.id = 'You must provide either ID or Where';
			if (formData.action != 'delete' && !formData.values) this.formErrors.values = 'You must provide Values';
			
			return _.isEmpty(this.formErrors);
		});
	},
	
	process: function() {
		// convert values and where from JSON to object
		var actData = this.actData;
		console.log('actData:', actData);
		
		if (actData.values) actData.values = JSON.parse(actData.values);
		if (actData.where) actData.where = JSON.parse(actData.where);
		
		// add id to where if provided
		if (actData.id) {
			var fieldName = (actData.action == 'insert' ? 'values' : 'where');
			if (!actData[fieldName]) actData[fieldName] = {};
			actData[fieldName].id = actData.id;
			delete actData.id;
		}
	},
	
	act: function() {
		// init actResult
		this.actResult = {};
		
		// record user id and date in actData
		var actData = this.actData,
			action = actData.action,
			values = actData.values;
		
		if (action == 'insert') {
			if (!values.createdById) values.createdById = this.user.id;
			if (!values.createdAt) values.createdAt = new Date();
		}
		
		if (action != 'delete') {
			values.updatedById = this.user.id;
			values.updatedAt = new Date();
		}
		
		// get model + check exists
		var model = this.models[actData.model];
		if (!model) {
			this.actResult = {error: 'illegalValue', field: 'model'};
			return false;
		}
		
		var promise;
		
		// run action on DB
		if (action == 'insert') {
			promise = model.create(values, {transaction: this.transaction});
		} else if (action == 'update') {
			promise = model.update(values, {where: actData.where, transaction: this.transaction});
		} else {
			promise = model.destroy({where: actData.where, transaction: this.transaction});
		}
		
		return promise.bind(this)
		.return(true)
		.catch(function(err) { // jshint ignore:line
			// invalid input
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
		
		throw new Error('Unknown error returned from act function');
	}
};
