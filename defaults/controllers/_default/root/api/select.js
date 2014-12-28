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
		
		// convert model names in params to models
		var params = _.clone(this.actData.params);

		try {
			convertIncludes(params, this.models);
			convertOrders(params, this.models);
		} catch(err) {
			this.actResult = {error: 'illegalValue', field: 'params'};
			return false;
		}

		// run action on DB
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

function convertIncludes(params, models) {
	var includes = params.include;
	if (!includes) return;
	if (!Array.isArray(includes)) includes = params.include = [includes];

	_.forEach(includes, function(include, index) {
		if (_.isString(include)) {
			if (!models[include]) throw new Error("Unknown model '" + include + "'");
			include = includes[index] = models[include];
			return;
		}

		if (!include.model) throw new Error('Undefined model in include');
		if (!models[include.model]) throw new Error("Unknown model '" + include.model + "'");
		include.model = models[include.model];

		convertIncludes(include, models);
	});
}

function convertOrders(params, models) {
	var orders = params.order;
	if (!orders) return;

	_.forEach(orders, function(order) {
		_.forEach(order, function(part) {
			if (!part.model) return;
			if (!models[part.model]) throw new Error("Unknown model '" + part.model + "'");
			part.model = models[part.model];
		});
	});
}
