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
	
	makeBreadcrumbsItem: function(route, data, url) {
		var title;
		if (data[route.model.name]) {
			data = data[route.model.name];
			title = data[route.targetModel.name].get('name');
		} else {
			title = route.titleItem;
		}
		
		var breadcrumbs = this.makeBreadcrumbsIndex(route, data, _.parentUrl(url));
		
		breadcrumbs.push({title: title, url: url});
		return breadcrumbs;
	}
};
