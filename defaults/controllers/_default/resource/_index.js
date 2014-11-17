// --------------------
// Default resource controller
// Route definition
// --------------------

// modules
var _ = require('overlook-utils');

// exports

// route definition
exports = module.exports = {
	// functions
	
	init: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			// set title
			_.defaultValue(this, 'titleItem', _.humanize(this.nameSingular));
		});
	},
	
	makeBreadcrumbsItem: function(route, data, url) {
		var title;
		if (data[route.model.name]) {
			data = data[route.model.name];
			title = data.get('name');
		} else {
			title = route.titleItem;
		}
		
		var breadcrumbs = this.makeBreadcrumbsIndex(route, data, _.parentUrl(url));
		
		breadcrumbs.push({title: title, url: url});
		return breadcrumbs;
	}
};
