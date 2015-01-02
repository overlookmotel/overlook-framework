// --------------------
// Default resource controller
// index action
// --------------------

// modules
var _ = require('overlook-utils');

// libraries
var forms = require('../../../../lib/forms');

// exports

// action definition
exports = module.exports = {
	// functions

	init: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			// set up fields
			this.fields = {id: {}, name: {}};
		});
	},

	load: function(defaultFn) {
		return defaultFn().bind(this)
		.then(this.loaded)
		.ifElse(function() {
			var options = {attributes: ['id', 'name'], where: {}, order: [['name']]};

			// filter results by parent resource
			if (this.parentResources) {
				var parentResource = this.parentResources[this.parentResources.length - 1];
				options.where[parentResource.model.name + _.capitalize(parentResource.paramField)] = this.params[parentResource.param];
			}

			// filter results by query (if provided)
			if (this.query.q) {
				options.where.name = {like: '%' + this.query.q + '%'};
				options.limit = 10;
			}

			// get results from DB
			return this.model.findAll(options).bind(this)
			.then(function(items) {
				// save db result to data
				this.dataMain = this.data[this.model.namePlural] = items;
			});
		});
	},

	makeDisplayOptions: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			this.displayOptions.options.data = _.set({}, this.model.name, forms.getValuesByFields(this.dataMain, this.fields));
		});
	}
};
