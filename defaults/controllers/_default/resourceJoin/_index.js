// --------------------
// Default resource controller
// Route definition
// --------------------

// exports

// imports
var resourceRoute = require('../resource/_index');

// route definition
exports = module.exports = {
	// functions
	
	init: resourceRoute.init,
	
	makeBreadcrumbsItem: resourceRoute.makeBreadcrumbsItem
};
