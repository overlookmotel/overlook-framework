// --------------------
// API namespace controller
// select action
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
				params: {format: 'text', required: true}
			}
		});
	},
	
	validate: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function(success) {
			// check `params` is valid JSON
			try {
				var obj = JSON.parse(this.formData.params);
				if (!_.isPlainObject(obj)) {
					this.formErrors.params = 'Params must be a JSON object';
					return false;
				}
			} catch(err) {
				this.formErrors.values = 'Params is invalid JSON';
				return false;
			}
			
			return success;
		});
	},
	
	process: function() {
		// convert params from JSON to object
		this.actData.params = JSON.parse(this.actData.params);
	},
	
	act: function() {
		// init actResult
		this.actResult = {};
		
		// get model + check exists
		var model = this.models[this.actData.model];
		if (!model) {
			this.actResult = {error: 'illegalValue', field: 'model'};
			return false;
		}
		
		// run action on DB
		var params = _.clone(this.actData.params);
		params.transaction = this.transaction;
		
		return model.findAll(params).bind(this)
		.then(function(results) {
			// write result to dataMain
			this.dataMain = results;
			
			return true;
		})
		.catch(function(err) { // jshint ignore:line
			// illegal params
			this.actResult = {error: 'illegalValue', field: 'params'};
			return false;
		});
	},
	
	done: function() {
		// display results
		var displayOptions = {
			options: {
				data: {
					results: this.dataMain
				}
			},
			layoutOptions: {
				title: this.title,
				breadcrumbs: this.breadcrumbs,
				url: this.url,
				user: this.user
			}
		};
		
		// render page (just show menu if HTML call)
		this.view = '_compiled/api/index';
		return this.render(displayOptions.options, displayOptions.layoutOptions);
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
