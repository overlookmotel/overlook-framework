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
		form: true,
		api: true
	},
	
	// functions
	
	initForm: function() {
		// make form
		this.form = forms.createForm({
			fields: {
				model: {format: 'string', required: true},
				params: {format: 'json', required: true}
			}
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
	}
};
