// --------------------
// Default resource controller
// typeahead action
// --------------------

// modules
var _ = require('overlook-utils');

// exports

// action definition
exports = module.exports = {
	// functions
	
	load: function(defaultFn) {
		return defaultFn().bind(this)
		.then(this.loaded)
		.ifElse(function() {
			// check if column name is valid
			var col = this.query.c;
			if (!this.model.rawAttributes[col] || this.model.rawAttributes[col].secret) return;
			
			// filter results by query
			var options = {attributes: [col], order: [[col]], limit: 10};
			if (this.query.q) {
				options.where = {};
				options.where[col] = {like: '%' + this.query.q + '%'};
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
			// get data
			var col = this.query.c;
			var viewData = this.dataMain.map(function(item) {
				return item[col];
			});
			
			this.displayOptions.options.data = viewData;
		});
	}
};
