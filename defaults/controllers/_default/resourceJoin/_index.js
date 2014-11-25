// --------------------
// Default resourceJoin controller
// Route definition
// --------------------

// modules
var _ = require('overlook-utils');

// exports

// imports
var resourceRoute = require('../resource/_index');

// route definition
exports = module.exports = {
	// functions
	
	init: function(defaultFn) {
		return resourceRoute.init.call(this, defaultFn).bind(this)
		.then(function() {
			// set paramField
			this.paramField = this.targetModel.name + _.capitalize(this.targetModel.primaryKeyAttribute);
		});
	},
	
	makeBreadcrumbsItem: resourceRoute.makeBreadcrumbsItem
};
