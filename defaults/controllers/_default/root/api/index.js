// --------------------
// API namespace controller
// index action
// --------------------

// imports
var defaultAction = require('../../all/_default/api');

// exports

// action definition
exports = module.exports = {
	// action params
	actionTypes: {
		api: true
	},
	
	// functions
	
	//xxx should be inherited from api defaults anyway, but isn't working correctly at present
	access: defaultAction.access
};
